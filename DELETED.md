# Deleted from the app

Things removed on purpose, in case they turn out to matter. Every one is still in git history:
`git show <commit>:index.html` shows the old page.

## Junkyard page (removed 2026-10-14, last present in df817b3)

The Junkyard tab held two cards that no longer had a better home:

- **Recent orders**: the last 8 orders from `dashboard.json` (`orders`), each with side, shares, symbol,
  price, date and state (filled / cancelled / rejected).
  - Button **Cancel open orders**: ran `bot.yml` with `command: cancel` after a confirm box.
- **Recent runs**: the last 8 runs of `bot.yml`, each linking to GitHub with its result.
  - Button **Dry run**: ran `bot.yml` with `command: dry-run` (a full run that places no orders).

The bot still supports both commands. To use them without the app, open the repo on GitHub:
Actions > Trading bot > Run workflow, then pick `cancel` or `dry-run`.
The order history is also in `dashboard.json` and in Webull itself.

Earlier, the Junkyard also held the **Latest report** card, which was removed before this.

## Unused code cleanup (removed 2026-10-14, last present in fc58f18)

Leftovers from features already gone from the screen. Nothing visible changed (checked with before/after screenshots).

- Styles for the old round-table chat (chat log, answer bubbles, "!!" badges, the half-table/half-chat layout),
  old page tabs, the "more" menu, the compare panel, two-column grids, the trade switch's old pulsing dot, and
  two crowd rows that were never drawn.
- The old team report list on the AI Team page, and a few unused constants and helpers.

## Ask the team / round table (removed 2026-10-14)

The app's chat with the counselors was removed earlier at your request; this removed what still sat behind it
in the `tradingfirm` repo: the `ask.yml` workflow (last present in 2e76230), the ask and save-answer steps of
the agents' script, and their test. Old answers stay on the `answers` branch, which nothing reads now.

## Final cleanup (2026-10-14, last present in 26c7c37)

- Styles for the old list rows (Recent orders, team reports, the first inbox) and four unused element ids.
  Nothing visible changed.
