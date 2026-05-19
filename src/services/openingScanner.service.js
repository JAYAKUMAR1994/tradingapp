import { setCache } from './cacheService.js';

export async function getOpeningScannerResults(snapshot) {
  const stocks = snapshot?.stocks || [];
  const results = stocks
    .map((stock) => {
      const gapPercent = stock.previousClose && stock.price ? ((stock.price - stock.previousClose) / stock.previousClose) * 100 : 0;
      const momentum = Math.abs(stock.changePercent || 0);
      const priority = Math.round(momentum * 20 + Math.abs(gapPercent) * 10 + Math.min((stock.volume || 0) / 1_000_000, 20));

      return {
        symbol: stock.symbol,
        price: stock.price,
        gapPercent: Number(gapPercent.toFixed(2)),
        changePercent: stock.changePercent,
        volume: stock.volume,
        setup:
          gapPercent > 0.5
            ? 'Gap up momentum'
            : momentum > 1
              ? 'High momentum'
              : 'Opening range watch',
        priority
      };
    })
    .filter((item) => item.priority > 10)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);

  await setCache('scanner:opening', results, 60);
  return results;
}
