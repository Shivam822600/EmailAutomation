const path = require('path');

const Email = require('../models/Email');
const { getLatestResume } = require('./resumeService');
const { sendMail } = require('./mailService');
const { loadTemplate, renderTemplate } = require('./templateService');
const delay = require('../utils/delay');
const { writeLog } = require('../utils/logger');
const { env } = require('../config/env');
const { recordEmailReport } = require('./reportService');

const sendWithRetry = async (mailOptions) => {
  let lastError;

  for (let attempt = 1; attempt <= env.emailMaxRetries + 1; attempt += 1) {
    try {
      await sendMail(mailOptions);
      return { success: true, attempts: attempt };
    } catch (error) {
      lastError = error;
      await writeLog(`Attempt ${attempt} failed for ${mailOptions.to}: ${error.message}`);
    }
  }

  return {
    success: false,
    attempts: env.emailMaxRetries + 1,
    error: lastError,
  };
};

const sendBulkEmails = async ({ includeSent = false } = {}) => {
  const startedAt = new Date();
  const resume = await getLatestResume();

  if (!resume) {
    const error = new Error('No resume found. Upload a resume before sending emails.');
    error.statusCode = 400;
    throw error;
  }

  const template = await loadTemplate();
  const eligibleStatuses = includeSent ? ['pending', 'failed', 'sent'] : ['pending', 'failed'];
  const recipients = await Email.find({
    status: { $in: eligibleStatuses },
  }).sort({ createdAt: 1 });
  const skippedSentCount = includeSent ? 0 : await Email.countDocuments({ status: 'sent' });
  const resentSentCount = includeSent ? recipients.filter((recipient) => recipient.status === 'sent').length : 0;

  const summary = {
    includeSent,
    startedAt,
    finishedAt: null,
    totalEligible: recipients.length,
    successCount: 0,
    failedCount: 0,
    skippedSentCount,
    resentSentCount,
  };

  await writeLog(`Bulk email process started. Eligible recipients: ${recipients.length}. Include sent: ${includeSent}`);

  for (let index = 0; index < recipients.length; index += 1) {
    const recipient = recipients[index];
    const html = renderTemplate(template, {
      name: recipient.name || 'there',
      company: recipient.company || 'your company',
    });

    console.log(`Sending ${index + 1}/${recipients.length}: ${recipient.email}`);

    const result = await sendWithRetry({
      to: recipient.email,
      subject: 'Application for MERN Stack / React Developer your company | 3+ years',
      html,
      attachments: [
        {
          filename: resume.fileName,
          path: path.resolve(resume.filePath),
        },
      ],
    });

    if (result.success) {
      recipient.status = 'sent';
      recipient.lastSentAt = new Date();
      recipient.error = '';
      summary.successCount += 1;
      await writeLog(`Email sent to ${recipient.email} in ${result.attempts} attempt(s)`);
    } else {
      recipient.status = 'failed';
      recipient.error = result.error?.message || 'Unknown email sending error';
      summary.failedCount += 1;
      await writeLog(`Email failed for ${recipient.email}: ${recipient.error}`);
    }

    await recipient.save();

    if (index < recipients.length - 1) {
      await delay(env.emailDelayMs);
    }
  }

  summary.finishedAt = new Date();
  await recordEmailReport(summary);
  await writeLog(`Bulk email process finished. Success: ${summary.successCount}, Failed: ${summary.failedCount}`);
  return summary;
};

module.exports = {
  sendBulkEmails,
};
