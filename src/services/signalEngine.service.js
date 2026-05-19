import { getCandles } from './marketData.service.js';
import { getMarketSnapshot } from './marketData.service.js';
import { analyzeNews } from './newsAnalyzer.service.js';
import { scoreSignal } from './confidenceEngine.service.js';
import { getCache, setCache, setCooldown } from './cacheService.js';
import { analyzeMarketSentiment } from './sentimentEngine.js';
import { sendTelegramAlert } from './telegramService.js';
import { analyzeTrend } from './trendAnalyzer.service.js';
import { calculateIndicators } from '../utils/technicalIndicators.js';

export async function generateSignal(symbol = 'RELIANCE', timeframe = '15m') {
  const cacheKey = `signal:${symbol}:${timeframe}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const candles = await getCandles(symbol, timeframe);
  const higherTimeframeCandles = await getCandles(symbol, '1h');
  const latest = candles.at(-1);
  const indicators = calculateIndicators(candles);
  const higherTimeframe = calculateIndicators(higherTimeframeCandles);
  const news = await analyzeNews(symbol);
  const snapshot = await getMarketSnapshot();
  const marketSentiment = analyzeMarketSentiment(snapshot);
  const trend = analyzeTrend(indicators, getSectorChange(snapshot, symbol));
  const confirmations = {
    volumeSpike: indicators.volumeSpikeConfirmed,
    candle: indicators.candleConfirmation,
    supportResistanceBreakout: indicators.resistanceBreakout || indicators.supportBreakdown,
    higherTimeframeTrend: higherTimeframe.ema9 > higherTimeframe.ema21 ? 'bullish' : higherTimeframe.ema9 < higherTimeframe.ema21 ? 'bearish' : 'sideways'
  };
  const score = scoreSignal({ indicators, news, trend, marketSentiment, confirmations });

  const buyEligible =
    indicators.ema9 > indicators.ema21 &&
    indicators.rsi > 60 &&
    confirmations.volumeSpike &&
    confirmations.candle === 'bullish' &&
    confirmations.higherTimeframeTrend === 'bullish' &&
    marketSentiment.mood !== 'bearish';
  const sellEligible =
    indicators.ema9 < indicators.ema21 &&
    indicators.rsi < 45 &&
    confirmations.candle === 'bearish' &&
    confirmations.higherTimeframeTrend === 'bearish' &&
    marketSentiment.mood !== 'bullish';
  const action = score.rating.includes('Buy') && buyEligible ? 'BUY' : score.rating.includes('Sell') && sellEligible ? 'SELL' : 'HOLD';
  const rating = action === 'HOLD' ? 'Neutral' : score.rating;
  const risk = latest.close * 0.006;
  const reward = latest.close * 0.012;

  const signal = {
    id: `${symbol}-${timeframe}-${Date.now()}`,
    symbol,
    action,
    rating,
    entry: Number(latest.close.toFixed(2)),
    target: Number((action === 'SELL' ? latest.close - reward : latest.close + reward).toFixed(2)),
    stopLoss: Number((action === 'SELL' ? latest.close + risk : latest.close - risk).toFixed(2)),
    confidence: score.confidence,
    timeframe,
    reasons: action === 'HOLD' ? [...score.reasons, 'Signal filtered to avoid low quality breakout'] : score.reasons,
    scoreBreakdown: score.breakdown,
    confirmations,
    indicators,
    news,
    trend,
    marketSentiment,
    createdAt: new Date().toISOString()
  };

  await setCache(cacheKey, signal, 60);
  await setCache(`signals:latest:${symbol}`, signal, 15 * 60);
  await maybeSendSignalAlert(signal);
  return signal;
}

export async function scanSignals(symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY']) {
  const signals = await Promise.all(symbols.map((symbol) => generateSignal(symbol)));
  const filtered = signals
    .filter((signal) => signal.confidence >= 62 || signal.action === 'HOLD')
    .sort((a, b) => b.confidence - a.confidence);
  await setCache('signals:scanner', filtered, 60);
  return filtered;
}

async function maybeSendSignalAlert(signal) {
  if (signal.action === 'HOLD' || signal.confidence < 75) return;
  const cooldownKey = `cooldown:signal:${signal.symbol}:${signal.action}`;
  const allowed = await setCooldown(cooldownKey, 15 * 60);
  if (!allowed) return;

  try {
    await sendTelegramAlert(signal);
  } catch (error) {
    console.error(`Telegram alert skipped for ${signal.symbol}: ${error.message}`);
  }
}

function getSectorChange(snapshot, symbol) {
  const stock = snapshot?.stocks?.find((item) => item.symbol === symbol);
  if (!stock) return 0;
  const sectorStocks = snapshot.stocks.filter((item) => item.sector === stock.sector && typeof item.changePercent === 'number');
  if (!sectorStocks.length) return 0;
  return sectorStocks.reduce((sum, item) => sum + item.changePercent, 0) / sectorStocks.length;
}
