const Resume = require('../models/Resume');

const createResume = async (file) => {
  return Resume.create({
    fileName: file.filename,
    filePath: file.path,
    uploadedAt: new Date(),
  });
};

const getLatestResume = async () => {
  return Resume.findOne().sort({ uploadedAt: -1 });
};

module.exports = {
  createResume,
  getLatestResume,
};
