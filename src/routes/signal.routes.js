import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { alert, scanner, signalForSymbol } from '../controllers/signal.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

export const signalRoutes = Router();

signalRoutes.use(requireAuth);
signalRoutes.get('/scan', query('symbols').optional().isString().trim().escape(), validateRequest, scanner);
signalRoutes.get('/:symbol', param('symbol').isString().trim().isLength({ min: 1, max: 20 }).escape(), query('timeframe').optional().isString().trim().escape(), validateRequest, signalForSymbol);
signalRoutes.post('/telegram/alert', body('signal').isObject(), validateRequest, alert);
