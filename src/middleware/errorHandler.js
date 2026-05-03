const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.name === 'MulterError' ? 400 : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    data: null,
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = errorHandler;
