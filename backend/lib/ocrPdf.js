const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

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

module.exports = {
  normalizeText,
  normalizeForMatching,
  parsePdfWithOcr,
};
