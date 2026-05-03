const express = require('express');

const { triggerBulkEmails, getSendStatus, checkSmtp } = require('../controllers/sendEmailController');

const router = express.Router();

router.post('/', triggerBulkEmails);
router.get('/status', getSendStatus);
router.get('/smtp-check', checkSmtp);

module.exports = router;
