import { Router } from 'express';
import { body } from 'express-validator';
import { createJournal, journalAnalytics, listJournal } from '../controllers/journal.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

export const journalRoutes = Router();

journalRoutes.use(requireAuth);
journalRoutes.get('/', listJournal);
journalRoutes.get('/analytics', journalAnalytics);
journalRoutes.post(
  '/',
  body('symbol').isString().trim().isLength({ min: 1, max: 20 }).escape(),
  body('action').isIn(['BUY', 'SELL', 'HOLD']),
  body('entryPrice').optional().isNumeric(),
  body('exitPrice').optional().isNumeric(),
  body('quantity').optional().isInt({ min: 1 }),
  body('notes').optional().isString().trim().escape(),
  validateRequest,
  createJournal
);
