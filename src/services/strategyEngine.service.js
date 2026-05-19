export function runStrategy({ indicators, news, trend }) {
  const reasons = [];
  let score = 0;

  if (indicators.ema9 > indicators.ema21) {
    score += 20;
    reasons.push('EMA 9 crossed above EMA 21');
  } else {
    score -= 20;
    reasons.push('EMA 9 below EMA 21');
  }

  if (indicators.rsi >= 45 && indicators.rsi <= 68) {
    score += 12;
    reasons.push('RSI in bullish range');
  } else if (indicators.rsi > 75) {
    score -= 12;
    reasons.push('RSI overbought');
  }

  if (indicators.macd?.histogram > 0) {
    score += 15;
    reasons.push('MACD momentum positive');
  } else {
    score -= 10;
    reasons.push('MACD momentum weak');
  }

  if (indicators.volumeBreakout) {
    score += 18;
    reasons.push('Volume breakout detected');
  }

  if (news.sentiment === 'Positive') {
    score += 12;
    reasons.push('Positive news sentiment');
  } else if (news.sentiment === 'Negative') {
    score -= 12;
    reasons.push('Negative news sentiment');
  }

  score += trend.score * 8;
  reasons.push(`${trend.trend} price trend with ${trend.sectorBias.toLowerCase()} sector bias`);

  return { score, reasons };
}
