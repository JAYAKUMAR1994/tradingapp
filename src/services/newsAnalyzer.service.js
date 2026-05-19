import YahooFinance from 'yahoo-finance2';
import { getCache, setCache } from './cacheService.js';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const newsQueries = {
  MARKET: 'NIFTY',
  RELIANCE: 'Reliance Industries',
  TCS: 'Tata Consultancy Services',
  HDFCBANK: 'HDFC Bank',
  INFY: 'Infosys',
  ICICIBANK: 'ICICI Bank',
  LT: 'Larsen Toubro'
};

const positiveWords = ['growth', 'gain', 'gains', 'strong', 'stronger', 'buying', 'stable', 'higher', 'profit', 'beats', 'surge', 'upgrade'];
const negativeWords = ['slows', 'fall', 'falls', 'loss', 'weak', 'cautious', 'concerns', 'eases', 'downgrade', 'miss', 'pressure'];

export async function analyzeNews(symbol = 'MARKET') {
  const cacheKey = `news:sentiment:${symbol}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const query = newsQueries[symbol] || symbol.replace('.NS', '');
    const result = await yahooFinance.search(query, {
      newsCount: 10
    });
    const items = (result.news || []).map((article) => scoreHeadline(symbol, article));
    const aggregate = items.reduce((sum, item) => sum + item.score, 0);
    const response = {
      symbol,
      source: 'Yahoo Finance',
      sentiment: aggregate > 1 ? 'Positive' : aggregate < -1 ? 'Negative' : 'Neutral',
      confidence: Math.min(95, 50 + Math.abs(aggregate) * 10),
      items,
      updatedAt: new Date().toISOString()
    };

    return setCache(cacheKey, response, 10 * 60);
  } catch (error) {
    console.error(`Yahoo news analysis failed for ${symbol}: ${error.message}`);
    return {
      symbol,
      source: 'Yahoo Finance',
      sentiment: 'Neutral',
      confidence: 0,
      items: [],
      error: 'Live news temporarily unavailable',
      updatedAt: new Date().toISOString()
    };
  }
}

function scoreHeadline(symbol, article) {
  const headline = article.title || article.headline || 'Untitled market news';
  const text = headline.toLowerCase();
  const positive = positiveWords.filter((word) => text.includes(word)).length;
  const negative = negativeWords.filter((word) => text.includes(word)).length;
  const score = positive - negative;

  return {
    symbol,
    headline,
    publisher: article.publisher,
    link: article.link,
    publishedAt: article.providerPublishTime
      ? new Date(article.providerPublishTime * 1000).toISOString()
      : null,
    sentiment: score > 0 ? 'Positive' : score < 0 ? 'Negative' : 'Neutral',
    score
  };
}
