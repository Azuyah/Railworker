#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../generated/prisma/client');
const {
  buildBlankett31ArchiveInventory,
  importBlankett31Archive,
} = require('../lib/blankett31Registry');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const rootPath = args[0];
const outputPath = args[1] || path.resolve(process.cwd(), '.codex-preview/blankett31-archive-inventory.json');
const shouldImport = args.includes('--import');

if (!rootPath) {
  console.error('Användning: node backend/scripts/import_blankett31_archive.js <arkivmapp> [output.json] [--import]');
  process.exit(1);
}

async function main() {
  const inventory = await buildBlankett31ArchiveInventory(rootPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2), 'utf8');

  let importResult = null;
  if (shouldImport) {
    importResult = await importBlankett31Archive(prisma, rootPath);
  }

  console.log(JSON.stringify({
    outputPath,
    stats: inventory.stats,
    imported: importResult,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
