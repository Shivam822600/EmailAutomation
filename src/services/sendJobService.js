const { sendBulkEmails } = require('./bulkEmailService');
const { writeLog } = require('../utils/logger');

const sendJob = {
  running: false,
  startedAt: null,
  finishedAt: null,
  summary: null,
  error: '',
};

const startSendJob = ({ includeSent = false } = {}) => {
  if (sendJob.running) {
    const error = new Error('Email sending job is already running');
    error.statusCode = 409;
    throw error;
  }

  sendJob.running = true;
  sendJob.startedAt = new Date();
  sendJob.finishedAt = null;
  sendJob.summary = null;
  sendJob.error = '';

  setImmediate(async () => {
    try {
      sendJob.summary = await sendBulkEmails({ includeSent });
    } catch (error) {
      sendJob.error = error.message;
      await writeLog(`Bulk email background job failed: ${error.message}`);
    } finally {
      sendJob.running = false;
      sendJob.finishedAt = new Date();
    }
  });

  return getSendJobStatus();
};

const getSendJobStatus = () => ({
  running: sendJob.running,
  startedAt: sendJob.startedAt,
  finishedAt: sendJob.finishedAt,
  summary: sendJob.summary,
  error: sendJob.error,
});

module.exports = {
  startSendJob,
  getSendJobStatus,
};
