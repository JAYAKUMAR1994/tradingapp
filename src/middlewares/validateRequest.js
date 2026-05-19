import { validationResult } from 'express-validator';

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    message: 'Invalid request',
    errors: errors.array().map((error) => ({ field: error.path, message: error.msg }))
  });
}
