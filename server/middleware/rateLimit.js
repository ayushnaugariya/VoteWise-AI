/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */
const rateLimit = require('express-rate-limit');

/** General API limiter - 100 requests per 15 minutes */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again after 15 minutes.' },
  skip: (req) => req.path === '/health',
});

/** Stricter limiter for AI endpoints - 20 requests per minute */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded. Please wait a moment.' },
});

module.exports = { apiLimiter, aiLimiter };
