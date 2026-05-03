const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const emailRoutes = require('./routes/emailRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const sendEmailRoutes = require('./routes/sendEmailRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart HR Outreach API is running',
    data: null,
  });
});

app.use('/api/emails', emailRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/send-emails', sendEmailRoutes);
app.use('/api/reports', reportRoutes);

app.use('/emails', emailRoutes);
app.use('/resume', resumeRoutes);
app.use('/send-emails', sendEmailRoutes);
app.use('/reports', reportRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
