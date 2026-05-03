const fs = require('fs');
const path = require('path');

const logFilePath = path.join(process.cwd(), 'logs', 'logs.txt');

const writeLog = async (message) => {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  await fs.promises.appendFile(logFilePath, line);
};

module.exports = {
  writeLog,
};
