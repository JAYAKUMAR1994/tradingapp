import cron from 'node-cron';
import { getMarketSnapshot } from '../services/marketData.service.js';
import { getOpeningScannerResults } from '../services/openingScanner.service.js';
import { scanSignals } from '../services/signalEngine.service.js';
import { getMarketState, isOpeningWindow } from '../utils/marketHours.js';

let scannerTask;
let scannerRunning = false;

export function startScanner(io) {
  if (scannerTask) return scannerTask;
  scannerRunning = true;

  scannerTask = cron.schedule('*/30 * * * * *', async () => {
    const marketState = getMarketState();
    io.emit('market:state', { state: marketState, updatedAt: new Date().toISOString() });

    if (marketState !== 'live') return;

    try {
      const [market, signals] = await Promise.all([
        getMarketSnapshot(),
        scanSignals(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'LT'])
      ]);

      io.emit('market:snapshot', market);
      io.emit('signals:update', signals);

      if (isOpeningWindow()) {
        io.emit('scanner:opening', await getOpeningScannerResults(market));
      }
    } catch (error) {
      console.error('Market scheduler failed:', error.message);
      io.emit('market:error', { message: 'Market update failed', updatedAt: new Date().toISOString() });
    }
  });

  return scannerTask;
}

export function stopScanner() {
  if (scannerTask) {
    scannerTask.stop();
    scannerTask = null;
  }
  scannerRunning = false;
}

export function getScannerStatus() {
  return {
    running: scannerRunning,
    marketState: getMarketState(),
    intervalSeconds: 30
  };
}

export function startMarketScheduler(io) {
  return startScanner(io);
}
