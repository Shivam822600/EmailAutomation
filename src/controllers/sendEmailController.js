const { startSendJob, getSendJobStatus } = require('../services/sendJobService');
const { verifySmtpConnection } = require('../services/mailService');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');

const triggerBulkEmails = asyncHandler(async (req, res) => {
  const job = startSendJob({
    includeSent: req.body.includeSent === true,
  });
  sendResponse(res, 202, 'Bulk email process started', job);
});

const getSendStatus = asyncHandler(async (req, res) => {
  sendResponse(res, 200, 'Bulk email job status fetched successfully', getSendJobStatus());
});

const checkSmtp = asyncHandler(async (req, res) => {
  await verifySmtpConnection();
  sendResponse(res, 200, 'SMTP connection verified successfully');
});

module.exports = {
  triggerBulkEmails,
  getSendStatus,
  checkSmtp,
};
