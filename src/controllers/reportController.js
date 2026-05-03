const { getEmailReports } = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');

const getReports = asyncHandler(async (req, res) => {
  const reports = await getEmailReports();
  sendResponse(res, 200, 'Email reports fetched successfully', reports);
});

module.exports = {
  getReports,
};
