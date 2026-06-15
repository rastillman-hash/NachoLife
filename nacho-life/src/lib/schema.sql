-- Run this in your Neon SQL editor to set up the saves table

CREATE TABLE IF NOT EXISTS saves (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_id    TEXT UNIQUE NOT NULL,
  player_data   JSONB NOT NULL,
  job_history   JSONB NOT NULL DEFAULT '[]',
  emergency_expenses NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_revenue      NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saves_browser_id_idx ON saves(browser_id);
