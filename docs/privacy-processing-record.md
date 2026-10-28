# Record of processing activities (GDPR art. 30)

Internal document. Keep it up to date whenever the site stores something new. Not published.

- **Controller:** fill in `LEGAL_NAME` / `LEGAL_ADDRESS` / `KVK_NUMBER` (see `.env.example`), contact `CONTACT_EMAIL`.
- **Data protection officer:** not required (small, non-commercial, no large-scale or special-category processing).
- **Last reviewed:** _(date)_ by _(name)_

| # | Activity | Data | Subjects | Purpose | Legal basis | Recipients | Retention | Where |
|---|----------|------|----------|---------|-------------|------------|-----------|-------|
| 1 | Mast gallery | submitter name, title, description, height, photo (EXIF removed) | people who submit masts; people who happen to be photographed | run the public gallery | legitimate interest | public | until removed on request or by an admin | `towers`, `/data/uploads` |
| 2 | Mast votes | random browser ID, mast, direction | visitors | prevent double voting, rank masts | legitimate interest | none | as long as the vote exists | `votes`, browser local storage |
| 3 | Quotes | quote text, name of person quoted, date, adding account | people quoted (third parties); members | run the quote board | legitimate interest (balanced against the quoted person's interests; removal on request) | public | until removed on request, by the author or an admin | `quotes` |
| 4 | Quote ratings | score, account ID or random cookie ID | members, visitors | rank quotes, prevent double voting | legitimate interest | none | as long as the rating exists; cascade-deleted with the account | `quote_votes`, `quote_voter` cookie (1 year) |
| 5 | Accounts | email, display name, role, ban flag | members | sign-in, admin access | contract (service requested) | mail provider (sign-in emails) | until the account is deleted | `user`, `account` |
| 6 | Sessions | session token, IP address, browser type | members | keep signed in, security | contract / legitimate interest | none | auto-deleted when expired (max 30 days) by the daily purge | `session` |
| 7 | Sign-in links | hashed token, email | members | passwordless sign-in | contract | none | auto-deleted when expired (10 min) by the daily purge | `verification` |
| 8 | Newsletter | email, status, confirm/unsubscribe timestamps | subscribers | send the newsletter | consent (double opt-in, or the sign-in form's newsletter box, shown ticked and verified by the sign-in link; `signup_preferences` holds the choice for at most a day) | mail provider | confirmed: until unsubscribe + removal request; unconfirmed: 7 days (purge); unsubscribed addresses kept only as a suppression list | `newsletter_subscribers`, `newsletter_sends` |
| 9 | Rate limiting | IP address | all visitors | stop abuse | legitimate interest | none | in memory only, minutes | server process |

## Processors and transfers

| Processor | What | Location | Safeguard | Action |
|-----------|------|----------|-----------|--------|
| Purelymail (SMTP) | email addresses, email content | United States (verify) | confirm DPA and a transfer mechanism (EU-US Data Privacy Framework certification or SCCs) | _(record link to terms / DPA)_ |
| Hosting provider | whole database and uploads | _(fill in)_ | DPA with the host; prefer EU region | _(fill in)_ |

## Data subject requests

Answer within one month (art. 12). Verify identity first (reply from the account's email address).

- **Access / portability:** signed-in users: `/account` → "Download my data". Others: search by email in the admin pages and the tables above.
- **Erasure:** accounts: `/account` → delete (also removes the newsletter row). Masts and quotes: admin pages, or SQL on `towers` / `quotes` (also delete the photo file from the uploads volume).
- **Objection to a quote or photo:** remove it, then reply to confirm.
- **Withdraw newsletter consent:** unsubscribe link, or delete the row in admin.
- Keep a short log: date received, what was asked, what was done.

## Review checklist (every 6 months or when features change)

- [ ] New tables, cookies, local storage keys or third-party services added? Update this record and `/privacy`.
- [ ] Any analytics, embeds or external fonts added? A consent banner may become necessary.
- [ ] Purge job still running? Look for `[purge] removed` in the container logs.
- [ ] Processor terms and locations still correct?
