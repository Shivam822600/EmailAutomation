const express = require('express');

const { triggerBulkEmails } = require('../controllers/sendEmailController');

const router = express.Router();

router.post('/', triggerBulkEmails);

module.exports = router;
