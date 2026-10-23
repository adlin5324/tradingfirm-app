# ADLIN Investments app

Dashboard for a private trading bot. This page holds no data or keys: it asks for a GitHub token, keeps it in the browser, and reads a private repository.

Live numbers update only when you press **Refresh live numbers** (on Positions) during market hours, weekdays
9:25 AM to 4:10 PM New York time. It starts the bot repository's "Live data" workflow the same way the Desk's
Yes and No buttons start theirs, so the token needs no extra permission and still can't change code.

**Token safety:** the token can start the bot's workflows, so it can run `halt`, `deposit`, `run` and `sell ALL`. Use a
fine-grained token for the bot repository only (Actions: read and write; Contents, Issues, Pull requests: read) with an
expiry date. It lives in this browser's `localStorage`, which every GitHub Pages site on the same `github.io` account
shares, so host no other Pages site on this account.
