const express = require('express');

const { uploadResume, getResume } = require('../controllers/resumeController');
const { resumeUpload } = require('../middleware/upload');

const router = express.Router();

router.post('/upload', resumeUpload.single('resume'), uploadResume);
router.get('/', getResume);

module.exports = router;
