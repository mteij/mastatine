-- The strip at the top of every site page. One row: it follows the latest news post, shows a custom message, or is off.
-- updated_at doubles as the version, so saving a change shows the bar again to people who dismissed the old one.
CREATE TABLE IF NOT EXISTS site_announcement (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  mode TEXT NOT NULL DEFAULT 'latest_news' CHECK (mode IN ('latest_news', 'custom', 'off')),
  title TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO site_announcement (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
