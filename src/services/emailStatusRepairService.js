const Email = require('../models/Email');

const restorePendingSentEmails = async () => {
  await Email.updateMany(
    {
      status: 'pending',
      lastSentAt: { $exists: true, $ne: null },
    },
    {
      $set: {
        status: 'sent',
        skippedFromStatus: '',
        error: '',
      },
    }
  );
};

module.exports = {
  restorePendingSentEmails,
};
