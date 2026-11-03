-- News posts for the homepage card, the announcement bar and /news. Written by admins; the body is plain text where a
-- blank line starts a new paragraph.
CREATE TABLE IF NOT EXISTS news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS news_posts_published_idx ON news_posts (published_at DESC, created_at DESC);

-- The three posts that used to live in the source code.
INSERT INTO news_posts (slug, title, summary, body, published_at) VALUES
  (
    'mastatine-minecraft-server',
    'The Mastatine Minecraft server is live!',
    'Join at aaa.mastatine.nl and explore the world on our live map.',
    $body$Dear members,

S.A. Mastatine now has its own Minecraft server. Join us at aaa.mastatine.nl, build something tall, and check who is online right now at the top of the homepage.

Lost? Our live map at map.mastatine.nl shows the whole world, so you can admire every mast from above.

Op de hoge masten,

The board$body$,
    '2026-10-28'
  ),
  (
    'we-are-sooooo-back',
    'We are sooooo back!',
    'After a well-deserved summer, the towers are climbing again.',
    $body$After a well-deserved summer, S.A. Mastatine is back in full force. New masts, new votes, new Mast of the Month glory: the towers are climbing again and we could not be more hyped for the new academic year.

Get your entries in and rally your housemates. Let's make this the best masting season yet.

Op de hoge masten,

The board$body$,
    '2026-08-28'
  ),
  (
    'mastatine-celebrates-fourth-lustrum',
    'Mastatine celebrates its 4th lustrum',
    'Twenty years of masts. The lustrum theme is, fittingly, Masten.',
    $body$Dear members,

In the academic year 2025–2026, S.A. Mastatine celebrates its 4th lustrum with the theme: Masten. Every 5 years we celebrate a lustrum, a milestone for our association. We hope to see you all at the fantastic activities the lustrum committee has organised.

Op de hoge masten,

The lustrum committee$body$,
    '2026-01-20'
  )
ON CONFLICT (slug) DO NOTHING;
