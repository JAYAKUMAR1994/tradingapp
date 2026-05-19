export async function fetchYahooQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=5m&range=1d`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Yahoo Finance request failed for ${symbol}`);
  return response.json();
}
