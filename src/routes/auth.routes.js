import { Router } from 'express';
import { body } from 'express-validator';
import { login, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

export const authRoutes = Router();

authRoutes.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6, max: 128 }).trim(),
  validateRequest,
  login
);
authRoutes.get('/me', requireAuth, me);
