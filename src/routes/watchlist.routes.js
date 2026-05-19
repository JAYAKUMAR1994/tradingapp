import { Router } from 'express';
import { addWatchlist, listWatchlist, removeWatchlist } from '../controllers/watchlist.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const watchlistRoutes = Router();

watchlistRoutes.use(requireAuth);
watchlistRoutes.get('/', listWatchlist);
watchlistRoutes.post('/', addWatchlist);
watchlistRoutes.delete('/:id', removeWatchlist);
