const items = [
  { id: '1', symbol: 'RELIANCE', exchange: 'NSE', sector: 'Energy' },
  { id: '2', symbol: 'HDFCBANK', exchange: 'NSE', sector: 'Banking' },
  { id: '3', symbol: 'INFY', exchange: 'NSE', sector: 'IT' }
];

export function listWatchlist(_req, res) {
  res.json(items);
}

export function addWatchlist(req, res) {
  const item = { id: String(Date.now()), exchange: 'NSE', ...req.body };
  items.push(item);
  res.status(201).json(item);
}

export function removeWatchlist(req, res) {
  const index = items.findIndex((item) => item.id === req.params.id);
  if (index >= 0) items.splice(index, 1);
  res.status(204).send();
}
