# Data breach response (GDPR art. 33–34)

Internal document. A personal data breach is any loss, leak, unauthorised access or unavailability of personal data: a leaked database dump or `.env`, a compromised admin account or mailbox, a misdirected email to the subscriber list, a stolen laptop with access, a server break-in.

## The clock

**72 hours** from the moment you become aware to report to the Autoriteit Persoonsgegevens, **unless** the breach is unlikely to put people's rights and freedoms at risk. Decide quickly, and write down the reasoning either way.

## Steps

1. **Contain.** Rotate whatever may be exposed: `BETTER_AUTH_SECRET` (signs everyone out), `SMTP_PASS`, `POSTGRES_PASSWORD`, server and registry credentials. Revoke access of anyone affected. Take the site offline if that is the safest way to stop it.
2. **Write down the facts** (start a log now, keep it): when and how it was discovered, what happened, which data (emails, names, IP addresses, quotes, photos), how many people, whether data was only unavailable or actually accessed/copied.
3. **Assess risk.** Email addresses plus names leaking is usually reportable; a few hashed, expired tokens usually is not. Unsure: report.
4. **Report to the AP** (within 72 h) via the data breach form on autoriteitpersoonsgegevens.nl. Include: nature of the breach, categories and rough numbers, contact person, likely consequences, measures taken. Missing details can follow later.
5. **Tell the people affected** without undue delay if the risk is high (art. 34): plain language, what happened, what data, what to do (for example, beware of phishing), who to contact. Use the newsletter list or sign-in emails only for the people actually affected.
6. **Inform processors/partners** where relevant (mail provider, host).
7. **Fix the cause** and update `docs/privacy-processing-record.md` and the code. Review what could have prevented it.

## Always record (even if not reported)

Keep an internal register: date, summary, data and people affected, decision (reported / not reported and why), measures. Art. 33(5) requires this for every breach.

## Contacts

- Controller contact: _(name, phone)_
- Backup person: _(name, phone)_
- Hosting provider support: _(link)_
- AP breach form: https://autoriteitpersoonsgegevens.nl (search "melden datalek")
