export function getJournalAnalytics(trades = []) {
  const wins = trades.filter((trade) => trade.pnl > 0);
  const losses = trades.filter((trade) => trade.pnl < 0);
  const byHour = groupBy(trades, (trade) => new Date(trade.createdAt).getHours());
  const bySymbol = groupBy(trades, (trade) => trade.symbol);
  const bySector = groupBy(trades, (trade) => trade.sector || 'Other');

  const bestHour = bestGroup(byHour);
  const worstHour = worstGroup(byHour);
  const bestStock = bestGroup(bySymbol);
  const worstStock = worstGroup(bySymbol);
  const bestSector = bestGroup(bySector);

  return {
    winRate: trades.length ? Math.round((wins.length / trades.length) * 100) : 0,
    averageProfit: average(wins.map((trade) => trade.pnl)),
    averageLoss: average(losses.map((trade) => trade.pnl)),
    bestTradingHour: bestHour ? `${bestHour.key}:00` : null,
    worstTradingHour: worstHour ? `${worstHour.key}:00` : null,
    mostProfitableStock: bestStock?.key || null,
    mostLosingStock: worstStock?.key || null,
    insights: [
      worstHour ? `Avoid trading around ${worstHour.key}:00 until performance improves` : 'Add more trades to identify weak hours',
      bestSector ? `Best performance currently comes from ${bestSector.key} sector` : 'Sector edge will appear after more journal entries',
      trades.length === 0
        ? 'Start journaling real trades to generate personalized insights'
        : losses.length > wins.length
          ? 'Reduce position size until win rate improves'
          : 'Current journal shows positive execution discipline'
    ]
  };
}

function groupBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] ||= [];
    acc[key].push(item);
    return acc;
  }, {});
}

function bestGroup(groups) {
  return Object.entries(groups)
    .map(([key, items]) => ({ key, pnl: sum(items) }))
    .sort((a, b) => b.pnl - a.pnl)[0];
}

function worstGroup(groups) {
  return Object.entries(groups)
    .map(([key, items]) => ({ key, pnl: sum(items) }))
    .sort((a, b) => a.pnl - b.pnl)[0];
}

function sum(items) {
  return items.reduce((total, item) => total + Number(item.pnl || 0), 0);
}

function average(values) {
  if (!values.length) return 0;
  return Number((values.reduce((sumValue, value) => sumValue + Number(value), 0) / values.length).toFixed(2));
}
