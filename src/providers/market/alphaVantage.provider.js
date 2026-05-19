export async function fetchAlphaVantageDaily(symbol) {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY || 'demo';
  const url = new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function', 'TIME_SERIES_DAILY');
  url.searchParams.set('symbol', `${symbol}.BSE`);
  url.searchParams.set('apikey', apiKey);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`AlphaVantage request failed for ${symbol}`);
  return response.json();
}
