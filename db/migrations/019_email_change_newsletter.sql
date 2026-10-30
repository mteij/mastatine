-- When someone changes the email address of their account, their newsletter subscription follows it.
-- If the new address is already subscribed on its own, that subscription wins and the old one is dropped.
CREATE OR REPLACE FUNCTION sync_subscriber_email() RETURNS trigger AS $$
BEGIN
  IF lower(NEW.email) <> lower(OLD.email) THEN
    IF EXISTS (SELECT 1 FROM newsletter_subscribers WHERE lower(email) = lower(NEW.email)) THEN
      DELETE FROM newsletter_subscribers WHERE lower(email) = lower(OLD.email);
    ELSE
      UPDATE newsletter_subscribers SET email = NEW.email WHERE lower(email) = lower(OLD.email);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_email_changed ON "user";
CREATE TRIGGER user_email_changed AFTER UPDATE OF email ON "user"
  FOR EACH ROW EXECUTE FUNCTION sync_subscriber_email();
