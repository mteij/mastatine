-- A meeting is open, done or locked (locked meetings are read-only until an admin reopens them).
-- This replaces the old minutes status (todo / draft / done); unfinished meetings become open.
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_minutes_status_check;
UPDATE meetings SET minutes_status = 'open' WHERE minutes_status IN ('todo', 'draft');
ALTER TABLE meetings ALTER COLUMN minutes_status SET DEFAULT 'open';
ALTER TABLE meetings ADD CONSTRAINT meetings_minutes_status_check CHECK (minutes_status IN ('open', 'done', 'locked'));
