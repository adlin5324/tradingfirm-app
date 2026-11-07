# Adlin Investments app

Dashboard for a private trading bot. This page holds no data or keys: it asks for a GitHub token, keeps it in the browser, and reads a private repository.

Live numbers update only when you press **Refresh live numbers** (on Positions) during market hours, weekdays
9:25 AM to 4:10 PM New York time. It starts the bot repository's "Live data" workflow the same way the Desk's
Yes and No buttons start theirs, so the token needs no extra permission and still can't change code.

**Token safety:** the token can start the bot's workflows, so it can run `halt`, `deposit`, `run` and `sell ALL`. Use a
fine-grained token for the bot repository only (Actions: read and write; Contents, Issues, Pull requests: read) with an
expiry date. It lives in this browser's `localStorage`, which every GitHub Pages site on the same `github.io` account
shares, so host no other Pages site on this account.

## Tests

`npm install` once, then `npm test`. The tests open the real `index.html` in headless Chromium against a fake GitHub (no network, no real token) and check every button that can start the bot (halt, resume, sell, freeze, tighten, deposit, verify login, Yes and No on The Desk), what each page shows from the dashboard, what happens when GitHub refuses, that text from GitHub is never run as code, and that every page fits a small phone. `tests/fixtures/dashboard.json` was made by the bot's own dashboard code; see `tests/fixtures/README.md`.
