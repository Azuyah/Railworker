const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { PDFParse } = require('pdf-parse');

const execFileAsync = promisify(execFile);
const SWIFT_SCRIPT_PATH = path.join(__dirname, '..', 'scripts', 'ocrPdf.swift');

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

const hasSwiftOcrSupport = async () => {
  try {
    await execFileAsync('xcrun', ['--version'], { maxBuffer: 1024 * 1024 });
    return true;
  } catch {
    return false;
  }
};

const parsePdfWithOcr = async (buffer, prefix = 'pdfocr-') => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  const tempPdfPath = path.join(tempDir, 'upload.pdf');

  try {
    await fs.writeFile(tempPdfPath, buffer);
    const { stdout } = await execFileAsync('xcrun', ['swift', SWIFT_SCRIPT_PATH, tempPdfPath], {
      maxBuffer: 20 * 1024 * 1024,
    });
    return JSON.parse(stdout);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};

const parsePdfWithTextOrOcr = async (buffer, prefix = 'pdfocr-') => {
  const textPayload = await parsePdfText(buffer);
  if (hasUsefulText(textPayload)) {
    return textPayload;
  }

  if (!(await hasSwiftOcrSupport())) {
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
