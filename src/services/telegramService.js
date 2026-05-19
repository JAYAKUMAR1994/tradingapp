export async function sendTelegramAlert(signal) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return { skipped: true, reason: 'Telegram credentials not configured' };
  }

  const icon = signal.action === 'BUY' ? '🚀' : signal.action === 'SELL' ? '🔻' : '⏸️';
  const reasons = signal.reasons?.slice(0, 5).map((reason) => `- ${reason}`).join('\n') || '- Signal generated';
  const text = `${icon} ${signal.rating || signal.action} SIGNAL

Stock: ${signal.symbol}
Entry: ₹${signal.entry}
Target: ₹${signal.target}
Stop Loss: ₹${signal.stopLoss}
Confidence: ${signal.confidence}%

Reasons:
${reasons}`;

  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram alert failed with ${response.status}`);
  }

  return response.json();
}
