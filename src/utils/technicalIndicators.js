import { EMA, MACD, RSI, VWAP } from 'technicalindicators';

export function calculateIndicators(candles) {
  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const volumes = candles.map((c) => c.volume);

  const ema9 = EMA.calculate({ period: 9, values: closes });
  const ema21 = EMA.calculate({ period: 21, values: closes });
  const rsi = RSI.calculate({ period: 14, values: closes });
  const macd = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  const vwap = VWAP.calculate({ high: highs, low: lows, close: closes, volume: volumes });
  const recentVolumes = volumes.slice(-20);
  const avgVolume = recentVolumes.reduce((sum, value) => sum + value, 0) / recentVolumes.length;
  const latestVolume = volumes.at(-1);
  const latest = candles.at(-1);
  const previous = candles.at(-2);
  const recentHigh = Math.max(...highs.slice(-20, -1));
  const recentLow = Math.min(...lows.slice(-20, -1));
  const bullishCandle = latest.close > latest.open && latest.close > previous.close;
  const bearishCandle = latest.close < latest.open && latest.close < previous.close;

  return {
    ema9: last(ema9),
    ema21: last(ema21),
    rsi: last(rsi),
    macd: last(macd),
    vwap: last(vwap),
    volumeBreakout: latestVolume > avgVolume * 1.5,
    volumeSpikeConfirmed: latestVolume > avgVolume * 1.8,
    support: Math.min(...lows.slice(-20)),
    resistance: Math.max(...highs.slice(-20)),
    supportBreakdown: latest.close < recentLow,
    resistanceBreakout: latest.close > recentHigh,
    candleConfirmation: bullishCandle ? 'bullish' : bearishCandle ? 'bearish' : 'neutral',
    avgVolume: Math.round(avgVolume),
    latestVolume
  };
}

function last(values) {
  return values.length ? values[values.length - 1] : null;
}
