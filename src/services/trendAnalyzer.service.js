export function analyzeTrend(indicators, sectorChange = 0) {
  const bullish = indicators.ema9 > indicators.ema21 && indicators.rsi < 70 && indicators.macd?.histogram > 0;
  const bearish = indicators.ema9 < indicators.ema21 && indicators.rsi > 30 && indicators.macd?.histogram < 0;
  const trend = bullish ? 'Bullish' : bearish ? 'Bearish' : 'Sideways';
  const sectorBias = sectorChange > 0.4 ? 'Bullish' : sectorChange < -0.4 ? 'Bearish' : 'Neutral';

  return {
    trend,
    sectorBias,
    score: (bullish ? 2 : bearish ? -2 : 0) + (sectorBias === 'Bullish' ? 1 : sectorBias === 'Bearish' ? -1 : 0)
  };
}
