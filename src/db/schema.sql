CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NSE',
  sector TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol, exchange)
);

CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL DEFAULT 'NSE',
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  entry NUMERIC(12, 2),
  target NUMERIC(12, 2),
  stop_loss NUMERIC(12, 2),
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  reasons JSONB NOT NULL DEFAULT '[]',
  indicators JSONB NOT NULL DEFAULT '{}',
  timeframe TEXT NOT NULL DEFAULT '15m',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  entry_price NUMERIC(12, 2),
  exit_price NUMERIC(12, 2),
  quantity INTEGER,
  notes TEXT,
  pnl NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signals_symbol_created ON signals(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_user_created ON journal_entries(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS trade_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  sector TEXT,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  entry_price NUMERIC(12, 2),
  exit_price NUMERIC(12, 2),
  quantity INTEGER,
  pnl NUMERIC(12, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signal_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  rating TEXT,
  confidence INTEGER NOT NULL,
  timeframe TEXT NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]',
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  market_mood TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_sentiment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood TEXT NOT NULL,
  score NUMERIC(8, 2),
  indices JSONB NOT NULL DEFAULT '{}',
  sector_sentiment JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  action TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'telegram',
  confidence INTEGER,
  sent BOOLEAN NOT NULL DEFAULT false,
  response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scanner_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scanner_type TEXT NOT NULL,
  symbol TEXT NOT NULL,
  priority INTEGER,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cooldown_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooldown_key TEXT UNIQUE NOT NULL,
  symbol TEXT,
  action TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trade_journal_user_created ON trade_journal(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signal_history_symbol_created ON signal_history(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_sentiment_created ON market_sentiment(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_logs_symbol_created ON alert_logs(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scanner_results_type_created ON scanner_results(scanner_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cooldown_tracking_expires ON cooldown_tracking(expires_at);
