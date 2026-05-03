const fs = require('fs');

const Email = require('../models/Email');
const { importEmails } = require('../services/emailImportService');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/apiResponse');
const { isValidEmail, normalizeEmail } = require('../utils/validators');

const uploadEmails = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error('Email upload file is required');
    error.statusCode = 400;
    throw error;
  }

  let result;

  try {
    result = await importEmails(req.file.path);
  } finally {
    await fs.promises.unlink(req.file.path).catch(() => {});
  }

  sendResponse(res, 201, 'Email upload processed successfully', result);
});

const getEmails = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const emails = await Email.find(filter).sort({ createdAt: -1 });
  sendResponse(res, 200, 'Emails fetched successfully', emails);
});

const deleteEmail = asyncHandler(async (req, res) => {
  const deletedEmail = await Email.findByIdAndDelete(req.params.id);

  if (!deletedEmail) {
    const error = new Error('Email record not found');
    error.statusCode = 404;
    throw error;
  }

  sendResponse(res, 200, 'Email deleted successfully', deletedEmail);
});

const getValidEmailIds = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    const error = new Error('Email ids are required');
    error.statusCode = 400;
    throw error;
  }

  return ids.filter((id) => /^[a-f\d]{24}$/i.test(String(id)));
};

const bulkDeleteEmails = asyncHandler(async (req, res) => {
  const ids = getValidEmailIds(req.body.ids);
  const result = await Email.deleteMany({ _id: { $in: ids } });

  sendResponse(res, 200, 'Selected emails deleted successfully', {
    deletedCount: result.deletedCount,
  });
});

const updateEmailSkipStatus = asyncHandler(async (req, res) => {
  const shouldSkip = req.body.skip === true;
  const updatedEmail = await Email.findById(req.params.id);

  if (!updatedEmail) {
    const error = new Error('Email record not found');
    error.statusCode = 404;
    throw error;
  }

  updatedEmail.status = shouldSkip ? 'skipped' : 'pending';
  updatedEmail.error = shouldSkip ? 'Manually skipped from sending' : '';
  await updatedEmail.save();

  sendResponse(
    res,
    200,
    shouldSkip ? 'Email skipped successfully' : 'Email moved back to pending successfully',
    updatedEmail
  );
});

const bulkUpdateEmailSkipStatus = asyncHandler(async (req, res) => {
  const ids = getValidEmailIds(req.body.ids);
  const shouldSkip = req.body.skip === true;
  const result = await Email.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        status: shouldSkip ? 'skipped' : 'pending',
        error: shouldSkip ? 'Manually skipped from sending' : '',
      },
    }
  );

  sendResponse(
    res,
    200,
    shouldSkip ? 'Selected emails skipped successfully' : 'Selected emails moved back to pending successfully',
    {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    }
  );
});

const createEmail = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!isValidEmail(email)) {
    const error = new Error('Valid email is required');
    error.statusCode = 400;
    throw error;
  }

  const existingEmail = await Email.findOne({ email });

  if (existingEmail) {
    sendResponse(res, 200, 'Email already exists. Duplicate skipped.', {
      inserted: false,
      email: existingEmail,
    });
    return;
  }

  const createdEmail = await Email.create({
    email,
    name: req.body.name || '',
    company: req.body.company || '',
    status: 'pending',
  });

  sendResponse(res, 201, 'Email added successfully', {
    inserted: true,
    email: createdEmail,
  });
});

module.exports = {
  uploadEmails,
  getEmails,
  deleteEmail,
  bulkDeleteEmails,
  updateEmailSkipStatus,
  bulkUpdateEmailSkipStatus,
  createEmail,
};
