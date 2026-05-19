export function isMarketOpen(now = new Date()) {
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = ist.getDay();
  const minutes = ist.getHours() * 60 + ist.getMinutes();
  return day >= 1 && day <= 5 && minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 30;
}

export function getMarketState(now = new Date()) {
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = ist.getDay();
  const minutes = ist.getHours() * 60 + ist.getMinutes();

  if (day === 0 || day === 6) return 'closed';
  if (minutes < 9 * 60 + 15) return 'pre-market';
  if (minutes <= 15 * 60 + 30) return 'live';
  return 'closed';
}

export function isOpeningWindow(now = new Date()) {
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const minutes = ist.getHours() * 60 + ist.getMinutes();
  return getMarketState(now) === 'live' && minutes >= 9 * 60 + 15 && minutes <= 9 * 60 + 30;
}
