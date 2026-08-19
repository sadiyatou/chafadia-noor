const rateLimit = require('express-rate-limit');

// Login/register/password-reset have no other brute-force protection (no
// account lockout, no CAPTCHA), so without this an attacker can credential-
// stuff or brute-force a password/reset-token at unlimited speed.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

// Generous global ceiling for the rest of the API — not meant to shape
// normal usage, just to stop a single client from hammering the server.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

module.exports = { authLimiter, apiLimiter };
