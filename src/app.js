import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';
import { journalRoutes } from './routes/journal.routes.js';
import { marketRoutes } from './routes/market.routes.js';
import { signalRoutes } from './routes/signal.routes.js';
import { watchlistRoutes } from './routes/watchlist.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (process.env.CLIENT_URL || 'http://localhost:5173' || 'https://warm-cucurucho-1d81af.netlify.app').split(','),
      credentials: true
    })
  );
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(express.json({ limit: '250kb' }));
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'trading-signal' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/market', marketRoutes);
  app.use('/api/signals', signalRoutes);
  app.use('/api/watchlist', watchlistRoutes);
  app.use('/api/journal', journalRoutes);

  app.use(errorHandler);
  return app;
}
