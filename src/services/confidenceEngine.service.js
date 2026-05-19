export function scoreSignal({ indicators, news, trend, marketSentiment, confirmations }) {
  const technical = scoreTechnical(indicators, confirmations);
  const volume = indicators.volumeSpikeConfirmed ? 100 : indicators.volumeBreakout ? 70 : 35;
  const trendScore = scoreTrend(trend, marketSentiment);
  const sentiment = news.sentiment === 'Positive' ? 85 : news.sentiment === 'Negative' ? 25 : 55;

  const weighted =
    technical * 0.4 +
    volume * 0.2 +
    trendScore * 0.2 +
    sentiment * 0.2;
  const confidence = Math.round(Math.max(0, Math.min(100, weighted)));
  const directionScore = getDirectionScore({ indicators, news, trend, marketSentiment, confirmations });

  return {
    confidence,
    directionScore,
    rating: getRating(directionScore, confidence),
    breakdown: {
      technical: Math.round(technical),
      volume: Math.round(volume),
      trend: Math.round(trendScore),
      newsSentiment: Math.round(sentiment)
    },
    reasons: getScoringReasons({ indicators, news, trend, marketSentiment, confirmations })
  };
}

function scoreTechnical(indicators, confirmations) {
  let score = 30;
  if (indicators.ema9 > indicators.ema21) score += 25;
  if (indicators.rsi > 60 && indicators.rsi < 75) score += 20;
  if (indicators.macd?.histogram > 0) score += 15;
  if (confirmations.supportResistanceBreakout) score += 10;
  return Math.min(score, 100);
}

function scoreTrend(trend, marketSentiment) {
  let score = trend.trend === 'Bullish' ? 75 : trend.trend === 'Bearish' ? 25 : 50;
  if (marketSentiment.mood === 'bullish') score += 10;
  if (marketSentiment.mood === 'bearish') score -= 10;
  return Math.max(0, Math.min(100, score));
}

function getDirectionScore({ indicators, news, trend, marketSentiment, confirmations }) {
  let score = 0;
  score += indicators.ema9 > indicators.ema21 ? 20 : -20;
  score += indicators.rsi > 60 ? 15 : indicators.rsi < 40 ? -15 : 0;
  score += indicators.macd?.histogram > 0 ? 12 : -12;
  score += confirmations.volumeSpike ? 18 : -8;
  score += confirmations.candle === 'bullish' ? 15 : confirmations.candle === 'bearish' ? -15 : 0;
  score += confirmations.higherTimeframeTrend === 'bullish' ? 12 : confirmations.higherTimeframeTrend === 'bearish' ? -12 : 0;
  score += news.sentiment === 'Positive' ? 10 : news.sentiment === 'Negative' ? -10 : 0;
  score += trend.trend === 'Bullish' ? 10 : trend.trend === 'Bearish' ? -10 : 0;
  score += score >= 0 ? marketSentiment.buyModifier : marketSentiment.sellModifier;
  return score;
}

function getRating(directionScore, confidence) {
  if (directionScore >= 45 && confidence >= 80) return 'Strong Buy';
  if (directionScore >= 20 && confidence >= 65) return 'Buy';
  if (directionScore <= -45 && confidence >= 80) return 'Strong Sell';
  if (directionScore <= -20 && confidence >= 65) return 'Sell';
  return 'Neutral';
}

function getScoringReasons({ indicators, news, trend, marketSentiment, confirmations }) {
  const reasons = [];
  if (indicators.ema9 > indicators.ema21) reasons.push('EMA9 above EMA21');
  if (indicators.rsi > 60) reasons.push('RSI confirms momentum');
  if (confirmations.volumeSpike) reasons.push('Volume spike confirmed');
  if (confirmations.supportResistanceBreakout) reasons.push('Support/resistance breakout confirmed');
  if (confirmations.candle === 'bullish') reasons.push('Bullish candle confirmation');
  if (confirmations.higherTimeframeTrend === 'bullish') reasons.push('Higher timeframe trend bullish');
  if (news.sentiment !== 'Neutral') reasons.push(`${news.sentiment} news sentiment`);
  reasons.push(`Market mood is ${marketSentiment.mood}`);
  if (trend.trend !== 'Sideways') reasons.push(`${trend.trend} trend confirmation`);
  return reasons;
}
