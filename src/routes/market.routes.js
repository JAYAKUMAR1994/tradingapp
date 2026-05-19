import { Router } from 'express';
import { candles, news, openingScanner, scannerStatus, sentiment, snapshot } from '../controllers/market.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const marketRoutes = Router();

marketRoutes.use(requireAuth);
marketRoutes.get('/snapshot', snapshot);
marketRoutes.get('/sentiment', sentiment);
marketRoutes.get('/scanner/status', scannerStatus);
marketRoutes.get('/scanner/opening', openingScanner);
marketRoutes.get('/candles/:symbol', candles);
marketRoutes.get('/news/:symbol?', news);
