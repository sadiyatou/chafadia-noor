const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err.message);

  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Below 500 (validation, not-found, auth, etc.) err.message is always a
  // message a controller wrote deliberately for the client. 500s are usually
  // an unexpected exception (e.g. a raw Postgres error) whose message can
  // contain schema/query detail — don't hand that to the client in production.
  const status = err.status || 500;
  const message = status < 500 || process.env.NODE_ENV !== 'production'
    ? (err.message || 'Internal server error.')
    : 'Internal server error.';

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
