const express = require('express');

const {
  uploadEmails,
  getEmails,
  deleteEmail,
  bulkDeleteEmails,
  updateEmailSkipStatus,
  bulkUpdateEmailSkipStatus,
  createEmail,
} = require('../controllers/emailController');
const { emailUpload } = require('../middleware/upload');

const router = express.Router();

router.post('/upload', emailUpload.single('file'), uploadEmails);
router.post('/', createEmail);
router.get('/', getEmails);
router.patch('/bulk/skip', bulkUpdateEmailSkipStatus);
router.delete('/bulk', bulkDeleteEmails);
router.patch('/:id/skip', updateEmailSkipStatus);
router.delete('/:id', deleteEmail);

module.exports = router;
