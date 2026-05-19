import { generateSignal, scanSignals } from '../services/signalEngine.service.js';
import { sendTelegramAlert } from '../services/telegram.service.js';

export async function signalForSymbol(req, res) {
  res.json(await generateSignal(req.params.symbol, req.query.timeframe || '15m'));
}

export async function scanner(req, res) {
  const symbols = req.query.symbols?.split(',').map((s) => s.trim()).filter(Boolean);
  res.json(await scanSignals(symbols));
}

export async function alert(req, res) {
  const result = await sendTelegramAlert(req.body.signal);
  res.json(result);
}
