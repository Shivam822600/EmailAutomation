const express = require('express');

const { getReports } = require('../controllers/reportController');

const router = express.Router();

router.get('/', getReports);

module.exports = router;
