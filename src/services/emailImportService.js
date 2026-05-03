const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const Email = require('../models/Email');
const { isValidEmail, normalizeEmail } = require('../utils/validators');

const parseCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
};

const parseJson = async (filePath) => {
  const raw = await fs.promises.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    const error = new Error('JSON upload must be an array of email records');
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

const loadRecords = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.csv') {
    return parseCsv(filePath);
  }

  if (ext === '.json') {
    return parseJson(filePath);
  }

  const error = new Error('Unsupported email file type');
  error.statusCode = 400;
  throw error;
};

const importEmails = async (filePath) => {
  const records = await loadRecords(filePath);
  const seenInFile = new Set();
  const validRecords = [];
  let invalidCount = 0;
  let duplicateInFileCount = 0;

  records.forEach((record) => {
    const email = normalizeEmail(record.email);

    if (!isValidEmail(email)) {
      invalidCount += 1;
      return;
    }

    if (seenInFile.has(email)) {
      duplicateInFileCount += 1;
      return;
    }

    seenInFile.add(email);
    validRecords.push({
      email,
      name: record.name || '',
      company: record.company || '',
      status: 'pending',
    });
  });

  if (validRecords.length === 0) {
    return {
      insertedCount: 0,
      duplicateCount: duplicateInFileCount,
      invalidCount,
      totalProcessed: records.length,
    };
  }

  const operations = validRecords.map((record) => ({
    updateOne: {
      filter: { email: record.email },
      update: { $setOnInsert: record },
      upsert: true,
    },
  }));

  const result = await Email.bulkWrite(operations, { ordered: false });
  const insertedCount = result.upsertedCount || 0;
  const duplicateCount = duplicateInFileCount + validRecords.length - insertedCount;

  return {
    insertedCount,
    duplicateCount,
    invalidCount,
    totalProcessed: records.length,
  };
};

module.exports = {
  importEmails,
};
