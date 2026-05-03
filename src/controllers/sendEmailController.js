const { sendBulkEmails } = require('../services/bulkEmailService');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');

const triggerBulkEmails = asyncHandler(async (req, res) => {
  const summary = await sendBulkEmails({
    includeSent: req.body.includeSent === true,
  });
  sendResponse(res, 200, 'Bulk email process completed', summary);
});

module.exports = {
  triggerBulkEmails,
};
