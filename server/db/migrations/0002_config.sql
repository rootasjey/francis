CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  is_secret INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS app_config_updated_at_idx ON app_config(updated_at);
