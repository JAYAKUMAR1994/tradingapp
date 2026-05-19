export function analyzeMarketSentiment(snapshot) {
  const nifty = snapshot?.indices?.find((item) => item.symbol === '^NSEI');
  const bankNifty = snapshot?.indices?.find((item) => item.symbol === '^NSEBANK');
  const indexScore = average([nifty?.changePercent, bankNifty?.changePercent]);
  const sectorSentiment = getSectorSentiment(snapshot?.stocks || []);

  const mood = indexScore > 0.35 ? 'bullish' : indexScore < -0.35 ? 'bearish' : 'sideways';
  const buyModifier = mood === 'bearish' ? -10 : mood === 'bullish' ? 5 : 0;
  const sellModifier = mood === 'bullish' ? -10 : mood === 'bearish' ? 5 : 0;

  return {
    mood,
    score: Number(indexScore.toFixed(2)),
    buyModifier,
    sellModifier,
    sectorSentiment,
    indices: { nifty, bankNifty }
  };
}

function getSectorSentiment(stocks) {
  const grouped = stocks.reduce((acc, stock) => {
    if (typeof stock.changePercent !== 'number') return acc;
    const sector = stock.sector || 'Other';
    acc[sector] ||= { sector, total: 0, count: 0 };
    acc[sector].total += stock.changePercent;
    acc[sector].count += 1;
    return acc;
  }, {});

  return Object.values(grouped).map((item) => {
    const change = item.total / item.count;
    return {
      sector: item.sector,
      changePercent: Number(change.toFixed(2)),
      mood: change > 0.4 ? 'bullish' : change < -0.4 ? 'bearish' : 'neutral'
    };
  });
}

function average(values) {
  const valid = values.filter((value) => typeof value === 'number');
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
}
