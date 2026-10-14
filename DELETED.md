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
