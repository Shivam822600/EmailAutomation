const { createResume, getLatestResume } = require('../services/resumeService');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error('Resume file is required');
    error.statusCode = 400;
    throw error;
  }

  const resume = await createResume(req.file);
  sendResponse(res, 201, 'Resume uploaded successfully', resume);
});

const getResume = asyncHandler(async (req, res) => {
  const resume = await getLatestResume();

  if (!resume) {
    const error = new Error('No resume found');
    error.statusCode = 404;
    throw error;
  }

  sendResponse(res, 200, 'Latest resume fetched successfully', resume);
});

module.exports = {
  uploadResume,
  getResume,
};
