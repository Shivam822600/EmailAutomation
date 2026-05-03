const mongoose = require('mongoose');

const runSchema = new mongoose.Schema(
  {
    startedAt: {
      type: Date,
      required: true,
    },
    finishedAt: {
      type: Date,
      required: true,
    },
    includeSent: {
      type: Boolean,
      default: false,
    },
    totalEligible: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    skippedSentCount: {
      type: Number,
      default: 0,
    },
    resentSentCount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const emailReportSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalRuns: {
      type: Number,
      default: 0,
    },
    totalEligible: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    skippedSentCount: {
      type: Number,
      default: 0,
    },
    resentSentCount: {
      type: Number,
      default: 0,
    },
    runs: {
      type: [runSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmailReport', emailReportSchema);
