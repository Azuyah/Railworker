const os = require('os');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { createWorker } = require('tesseract.js');

const OCR_LANGUAGES = ['swe', 'eng'];
const OCR_CACHE_PATH = path.join(os.tmpdir(), 'railworker-tesseract-cache');
const OCR_OUTPUT_FORMATS = { blocks: true };
const SCREENSHOT_SCALE = 2;

const normalizeText = (value = '') =>
  value
    .replace(/\u0440/g, 'p')
    .replace(/\u0420/g, 'P')
    .replace(/\u0422/g, 'T')
    .replace(/\u0442/g, 't')
    .replace(/\u0456/g, 'i')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();

const normalizeForMatching = (value = '') =>
  normalizeText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const toImageBuffer = (value) => {
  if (!value) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }

  if (value instanceof ArrayBuffer) {
    return Buffer.from(value);
  }

  if (Array.isArray(value)) {
    return Buffer.from(value);
  }

  return null;
};

const flattenOcrLines = (blocks = []) =>
  blocks.flatMap((block) =>
    Array.isArray(block?.paragraphs)
      ? block.paragraphs.flatMap((paragraph) => (Array.isArray(paragraph?.lines) ? paragraph.lines : []))
      : []
  );

const normalizeOcrBox = (text, bbox, imageWidth, imageHeight) => {
  const normalizedText = normalizeText(text || '');
  if (!normalizedText) {
    return null;
  }

  const x0 = Number(bbox?.x0);
  const y0 = Number(bbox?.y0);
  const x1 = Number(bbox?.x1);
  const y1 = Number(bbox?.y1);

  if (![x0, y0, x1, y1].every(Number.isFinite) || imageWidth <= 0 || imageHeight <= 0) {
    return {
      text: normalizedText,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  return {
    text: normalizedText,
    x: clamp01(x0 / imageWidth),
    y: clamp01(1 - (y1 / imageHeight)),
    width: clamp01((x1 - x0) / imageWidth),
    height: clamp01((y1 - y0) / imageHeight),
  };
};

const extractWordChunks = (line, imageWidth) => {
  const words = Array.isArray(line?.words)
    ? line.words
        .map((word) => ({
          text: normalizeText(word?.text || ''),
          bbox: word?.bbox || null,
        }))
        .filter((word) => word.text && word.bbox)
        .sort((left, right) => Number(left.bbox?.x0 || 0) - Number(right.bbox?.x0 || 0))
    : [];

  if (!words.length) {
    return [];
  }

  const gapThreshold = Math.max(imageWidth * 0.03, 24);
  const chunks = [];
  let currentChunk = null;

  for (const word of words) {
    if (!currentChunk) {
      currentChunk = {
        words: [word.text],
        bbox: { ...word.bbox },
      };
      continue;
    }

    const gap = Number(word.bbox?.x0 || 0) - Number(currentChunk.bbox?.x1 || 0);
    if (gap > gapThreshold) {
      chunks.push(currentChunk);
      currentChunk = {
        words: [word.text],
        bbox: { ...word.bbox },
      };
      continue;
    }

    currentChunk.words.push(word.text);
    currentChunk.bbox = {
      x0: Math.min(Number(currentChunk.bbox.x0 || 0), Number(word.bbox.x0 || 0)),
      y0: Math.min(Number(currentChunk.bbox.y0 || 0), Number(word.bbox.y0 || 0)),
      x1: Math.max(Number(currentChunk.bbox.x1 || 0), Number(word.bbox.x1 || 0)),
      y1: Math.max(Number(currentChunk.bbox.y1 || 0), Number(word.bbox.y1 || 0)),
    };
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const extractOcrLineItems = (line, imageWidth, imageHeight) => {
  const chunks = extractWordChunks(line, imageWidth);
  if (chunks.length) {
    return chunks
      .map((chunk) => normalizeOcrBox(chunk.words.join(' '), chunk.bbox, imageWidth, imageHeight))
      .filter(Boolean);
  }

  return [normalizeOcrBox(line?.text || '', line?.bbox || null, imageWidth, imageHeight)].filter(Boolean);
};

const normalizeOcrLine = (line, imageWidth, imageHeight) => {
  const text = normalizeText(line?.text || '');
  if (!text) {
    return null;
  }

  return normalizeOcrBox(text, line?.bbox || null, imageWidth, imageHeight);
};

const createOcrWorker = async () => {
  const worker = await createWorker(OCR_LANGUAGES, 1, {
    cachePath: OCR_CACHE_PATH,
    logger: () => {},
  });

  await worker.setParameters({
    preserve_interword_spaces: '1',
  });

  return worker;
};

const parsePdfText = async (buffer) => {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText({ pageJoiner: '' });
    const pages = Array.isArray(result?.pages)
      ? result.pages.map((page) => ({
          page: Number(page?.num) || 0,
          text: String(page?.text || ''),
          lines: [],
        }))
      : [];

    return { pages };
  } finally {
    await parser.destroy();
  }
};

const hasUsefulText = (payload) =>
  Array.isArray(payload?.pages) &&
  payload.pages.some((page) => normalizeText(String(page?.text || '')).length > 20);

const parsePdfScreenshots = async (buffer) => {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getScreenshot({
      imageBuffer: true,
      imageDataUrl: false,
      scale: SCREENSHOT_SCALE,
    });

    return Array.isArray(result?.pages) ? result.pages : [];
  } finally {
    await parser.destroy();
  }
};

const parsePdfWithOcr = async (buffer, prefix = 'pdfocr-') => {
  void prefix;
  const screenshots = await parsePdfScreenshots(buffer);
  const worker = await createOcrWorker();

  try {
    const pages = [];

    for (let index = 0; index < screenshots.length; index += 1) {
      const screenshot = screenshots[index];
      const imageWidth = Number(screenshot?.width) || 0;
      const imageHeight = Number(screenshot?.height) || 0;
      const imageBuffer = toImageBuffer(screenshot?.data);

      if (!imageBuffer) {
        pages.push({
          page: index + 1,
          text: '',
          lines: [],
        });
        continue;
      }

      const result = await worker.recognize(imageBuffer, {}, OCR_OUTPUT_FORMATS);
      const rawLines = flattenOcrLines(result?.data?.blocks);
      const lines = rawLines
        .flatMap((line) => extractOcrLineItems(line, imageWidth, imageHeight))
        .filter(Boolean)
        .sort((left, right) => right.y - left.y || left.x - right.x);
      const text = lines.length
        ? rawLines
            .map((line) => normalizeOcrLine(line, imageWidth, imageHeight))
            .filter(Boolean)
            .map((line) => line.text)
            .join('\n')
        : normalizeText(result?.data?.text || '');

      pages.push({
        page: Number(screenshot?.num) || index + 1,
        text,
        lines,
      });
    }

    return { pages };
  } finally {
    await worker.terminate();
  }
};

const parsePdfWithTextOrOcr = async (buffer, prefix = 'pdfocr-') => {
  const textPayload = await parsePdfText(buffer);
  if (hasUsefulText(textPayload)) {
    return textPayload;
  }

  return parsePdfWithOcr(buffer, prefix);
};

module.exports = {
  normalizeText,
  normalizeForMatching,
  parsePdfText,
  parsePdfWithOcr,
  parsePdfWithTextOrOcr,
};
