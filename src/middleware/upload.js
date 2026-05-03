const path = require('path');
const multer = require('multer');

const uploadDir = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginalName}`);
  },
});

const emailUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.csv', '.json'];

    if (!allowed.includes(ext)) {
      return cb(new Error('Only CSV and JSON files are allowed for email upload'));
    }

    cb(null, true);
  },
});

const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.doc', '.docx'];

    if (!allowed.includes(ext)) {
      return cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume upload'));
    }

    cb(null, true);
  },
});

module.exports = {
  emailUpload,
  resumeUpload,
};
