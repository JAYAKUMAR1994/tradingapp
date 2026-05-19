import { getCandles, getMarketSnapshot } from '../services/marketData.service.js';
import { analyzeNews } from '../services/newsAnalyzer.service.js';
import { getOpeningScannerResults } from '../services/openingScanner.service.js';
import { getScannerStatus } from '../schedulers/marketScheduler.js';

export async function snapshot(_req, res) {
  res.json(await getMarketSnapshot());
}

export async function candles(req, res) {
  res.json(await getCandles(req.params.symbol, req.query.timeframe || '15m'));
}

export async function news(req, res) {
  res.json(await analyzeNews(req.params.symbol || 'MARKET'));
}

export async function sentiment(_req, res) {
  const market = await getMarketSnapshot();
  res.json(market.sentiment);
}

export async function scannerStatus(_req, res) {
  res.json(getScannerStatus());
}

export async function openingScanner(_req, res) {
  const market = await getMarketSnapshot();
  res.json(await getOpeningScannerResults(market));
}
