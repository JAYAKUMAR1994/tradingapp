import YahooFinance from 'yahoo-finance2';
import { getCache, setCache } from './cacheService.js';
import { analyzeMarketSentiment } from './sentimentEngine.js';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const MARKET_CACHE_KEY = 'market:snapshot';
const MARKET_CACHE_TTL_MS = 30_000;
const indices = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^NSEBANK', name: 'BANK NIFTY' }
];
const watchlist = [
  { symbol: 'RELIANCE.NS', displaySymbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy' },
  { symbol: 'TCS.NS', displaySymbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT' },
  { symbol: 'HDFCBANK.NS', displaySymbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking' },
  { symbol: 'INFY.NS', displaySymbol: 'INFY', name: 'Infosys', sector: 'IT' },
  { symbol: 'ICICIBANK.NS', displaySymbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking' },
  { symbol: 'LT.NS', displaySymbol: 'LT', name: 'Larsen & Toubro', sector: 'Infrastructure' }
];

let lastGoodSnapshot = null;

export async function getMarketSnapshot() {
  const cached = await getCache(MARKET_CACHE_KEY);
  if (cached) return cached;

  try {
    const [indexQuotes, stockQuotes] = await Promise.all([
      fetchQuotes(indices.map((item) => item.symbol)),
      fetchQuotes(watchlist.map((item) => item.symbol))
    ]);

    const snapshot = {
      status: 'live',
      source: 'Yahoo Finance',
      indices: indices.map((item) => normalizeQuote(indexQuotes.get(item.symbol), item)),
      stocks: watchlist.map((item) => normalizeQuote(stockQuotes.get(item.symbol), item)),
      updatedAt: new Date().toISOString()
    };

    snapshot.topGainers = snapshot.stocks
      .filter((stock) => stock.changePercent !== null && stock.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent);
    snapshot.topLosers = snapshot.stocks
      .filter((stock) => stock.changePercent !== null && stock.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent);
    snapshot.sentiment = analyzeMarketSentiment(snapshot);
    snapshot.sectorHeatmap = snapshot.sentiment.sectorSentiment;

    lastGoodSnapshot = snapshot;
    await Promise.all([
      setCache('market:trends', snapshot.sentiment, 60),
      setCache('market:sector-heatmap', snapshot.sectorHeatmap, 60),
      setCache('market:prices', snapshot.stocks, 30),
      setCache('market:volume', snapshot.stocks.map((stock) => ({ symbol: stock.symbol, volume: stock.volume })), 30)
    ]);
    return setCache(MARKET_CACHE_KEY, snapshot, MARKET_CACHE_TTL_MS / 1000);
  } catch (error) {
    console.error('Yahoo Finance market snapshot failed:', error.message);
    if (lastGoodSnapshot) {
      return {
        ...lastGoodSnapshot,
        status: 'stale',
        error: 'Live market data temporarily unavailable',
        updatedAt: new Date().toISOString()
      };
    }

    return {
      status: 'unavailable',
      source: 'Yahoo Finance',
      indices: indices.map((item) => emptyQuote(item)),
      stocks: watchlist.map((item) => emptyQuote(item)),
      topGainers: [],
      topLosers: [],
      error: 'Live market data temporarily unavailable',
      updatedAt: new Date().toISOString()
    };
  }
}

export async function getCandles(symbol, timeframe = '15m') {
  const key = `candles:${symbol}:${timeframe}`;
  const cached = await getCache(key);
  if (cached) return cached;

  const yahooSymbol = toYahooSymbol(symbol);
  const options = getChartOptions(timeframe);
  const result = await yahooFinance.chart(yahooSymbol, options);
  const candles = (result.quotes || [])
    .filter((quote) => [quote.open, quote.high, quote.low, quote.close].every((value) => typeof value === 'number'))
    .map((quote) => ({
      time: new Date(quote.date).getTime(),
      open: round(quote.open),
      high: round(quote.high),
      low: round(quote.low),
      close: round(quote.close),
      volume: typeof quote.volume === 'number' ? quote.volume : 0
    }));

  if (candles.length < 30) {
    throw new Error(`Insufficient Yahoo candle data for ${yahooSymbol}`);
  }

  return setCache(key, candles, 60);
}

async function fetchQuotes(symbols) {
  const results = await Promise.allSettled(symbols.map((symbol) => yahooFinance.quote(symbol)));
  const quotes = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);

  if (!quotes.length) {
    throw new Error('No Yahoo Finance quotes returned');
  }

  return new Map(quotes.map((quote) => [quote.symbol, quote]));
}

function normalizeQuote(quote, meta) {
  if (!quote) return emptyQuote(meta);

  const price = numberOrNull(quote.regularMarketPrice);
  const previousClose = numberOrNull(quote.regularMarketPreviousClose);
  const changeValue = price !== null && previousClose !== null ? round(price - previousClose) : numberOrNull(quote.regularMarketChange);
  const changePercent =
    price !== null && previousClose
      ? round(((price - previousClose) / previousClose) * 100)
      : numberOrNull(quote.regularMarketChangePercent);

  return {
    symbol: meta.displaySymbol || meta.symbol,
    yahooSymbol: meta.symbol,
    name: meta.name || quote.shortName || quote.longName || meta.name,
    sector: meta.sector,
    value: price,
    price,
    previousClose,
    changeValue,
    changePercent,
    change: changePercent,
    volume: numberOrNull(quote.regularMarketVolume),
    marketState: quote.marketState || 'UNKNOWN',
    currency: quote.currency || 'INR',
    exchange: quote.fullExchangeName || quote.exchange || 'NSE'
  };
}

function emptyQuote(meta) {
  return {
    symbol: meta.displaySymbol || meta.symbol,
    yahooSymbol: meta.symbol,
    name: meta.name,
    sector: meta.sector,
    value: null,
    price: null,
    previousClose: null,
    changeValue: null,
    change: null,
    changePercent: null,
    volume: null,
    marketState: 'UNAVAILABLE',
    currency: 'INR',
    exchange: 'NSE'
  };
}

function numberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? round(value) : null;
}

function round(value) {
  return Number(value.toFixed(2));
}

function toYahooSymbol(symbol) {
  if (symbol.startsWith('^') || symbol.includes('.')) return symbol;
  return `${symbol}.NS`;
}

function getChartOptions(timeframe) {
  const intervalMap = {
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '60m',
    '1d': '1d'
  };
  const lookbackDays = timeframe === '1d' ? 180 : 10;

  return {
    period1: new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000),
    interval: intervalMap[timeframe] || '15m',
    return: 'array'
  };
}
