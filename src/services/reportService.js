const EmailReport = require('../models/EmailReport');

const getDateKey = (date = new Date()) => {
  return date.toISOString().slice(0, 10);
};

const recordEmailReport = async (summary) => {
  const dateKey = getDateKey(summary.finishedAt);
  const run = {
    startedAt: summary.startedAt,
    finishedAt: summary.finishedAt,
    includeSent: summary.includeSent,
    totalEligible: summary.totalEligible,
    successCount: summary.successCount,
    failedCount: summary.failedCount,
    skippedSentCount: summary.skippedSentCount,
    resentSentCount: summary.resentSentCount,
  };

  return EmailReport.findOneAndUpdate(
    { dateKey },
    {
      $setOnInsert: {
        dateKey,
      },
      $inc: {
        totalRuns: 1,
        totalEligible: summary.totalEligible,
        successCount: summary.successCount,
        failedCount: summary.failedCount,
        skippedSentCount: summary.skippedSentCount,
        resentSentCount: summary.resentSentCount,
      },
      $push: {
        runs: {
          $each: [run],
          $position: 0,
        },
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
};

const getEmailReports = async () => {
  return EmailReport.find().sort({ dateKey: -1 });
};

module.exports = {
  recordEmailReport,
  getEmailReports,
};
