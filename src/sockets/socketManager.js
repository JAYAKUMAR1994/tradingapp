import { Server } from 'socket.io';
import { getMarketSnapshot } from '../services/marketData.service.js';
import { getOpeningScannerResults } from '../services/openingScanner.service.js';
import { scanSignals } from '../services/signalEngine.service.js';
import { getMarketState, isOpeningWindow } from '../utils/marketHours.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
  });

  io.on('connection', async (socket) => {
    try {
      const market = await getMarketSnapshot();
      socket.emit('market:state', { state: getMarketState(), updatedAt: new Date().toISOString() });
      socket.emit('market:snapshot', market);
      socket.emit('signals:update', await scanSignals());
      if (isOpeningWindow()) socket.emit('scanner:opening', await getOpeningScannerResults(market));
    } catch (error) {
      socket.emit('market:error', { message: error.message || 'Market data unavailable' });
    }

    socket.on('watchlist:join', (symbols = []) => {
      symbols.forEach((symbol) => socket.join(`symbol:${symbol}`));
    });
  });

  return io;
}
