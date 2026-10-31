// Weekly "gap scout": reads the Adlin's Competitors scores and adds new suggestions to proposals.json.
// Plain rules, no AI: a category becomes a suggestion when Adlin's Investments ranks near the bottom of it and a competitor scores 8 or more.
// Wording comes from the table below. Existing proposals are never changed or removed.
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const DATA_FILE = process.env.DATA_FILE || new URL("../competitors-data.js", import.meta.url);
const PROPOSALS = process.env.PROPOSALS_FILE || new URL("../proposals.json", import.meta.url);
const MAX_NEW = 5;
// House rules: no ETFs, cash account, no margin, AI only advises. These categories would push against them, so they are never suggested.
const SKIP = new Set(["Real trading", "Markets covered", "Fits stock trading", "Broker and exchange support"]);
const SAFETY = new Set(["Risk controls", "Emergency controls", "Practice mode", "AI safety limits"]);
const WORDS = {
  "Backtesting": ["Backtest with costs and stops", "Replay the strategies with fees, slippage and trailing stops at portfolio level."],
  "Practice mode": ["Make the practice mode behave like the real run", "Run the paper lane through the same order and risk checks as live trading."],
  "Risk controls": ["Add a drawdown guard", "Pause trading after the account falls a set amount from its peak."],
  "Position sizing": ["Size positions from the risk budget", "Pick share counts from the stop distance and a fixed percent of cash at risk."],
  "Strategy variety": ["Add one more strategy to the vote", "Test a new rule-based strategy in the paper lane before it votes."],
  "Strategy optimization": ["Add significance tests for strategies", "Check that a good backtest is not luck, with Monte Carlo or shuffled-trade tests."],
  "Data sources": ["Add a backup free data source", "Fall back to a second free price source so one outage does not stop the run."],
  "Fundamentals and filings": ["Use more company data", "Add earnings dates and basic financial ratios next to the insider-buying filings."],
  "News and sentiment": ["Score the news more closely", "Give each stock a simple news score and show it in the daily report."],
  "Technical indicators": ["Widen the indicator library", "Add more standard indicators so new strategies are quick to write."],
  "Performance tracking": ["Track more performance numbers", "Add drawdown, profit factor and win rate to the scorecard next to the S&P comparison."],
  "AI and ML depth": ["Give the advisers more tools", "Let the advisory agents read more data. They still never place orders."],
  "AI safety limits": ["Log every adviser decision", "Keep a record of what each adviser flagged or halted, and why."],
  "Reports and explanations": ["Write richer reports", "Save one readable report per run with the reasoning behind each decision."],
  "Alerts and notifications": ["Add more alert types", "Send a phone alert for failed runs, large moves and unusual fills."],
  "Dashboard and control": ["Add more to the dashboard", "Show open orders, the next run time and each strategy's recent picks."],
  "Mobile and remote access": ["Make the phone app work offline", "Show the last known balances and positions when there is no signal."],
  "Automated daily run": ["Make the daily run more dependable", "Retry a failed run once and send an alert if it still fails."],
  "Emergency controls": ["Add a one-tap flat button", "Add a single control that halts trading and sells everything held, with a confirm."],
  "Ease of setup": ["Write a quick-start in the README", "Add a step-by-step setup guide with the secrets and workflows listed in order."],
  "Running cost": ["Cut the running cost", "Run the heavy jobs less often so the free minutes last the whole month."],
  "Docs and community": ["Document how each role works", "Write one short page per role: what it reads, decides and writes."],
  "Maturity": ["Stop depending on free Actions minutes", "Run less often, or move the heavy jobs elsewhere, so schedules never pause."],
  "Testing and code quality": ["Add more automated tests", "Start with the order and risk code, then the strategies."],
  "Update frequency": ["Keep a changelog", "Write down each change so it is clear how the bot is improving."],
  "Customizability": ["Move more settings into the rules file", "Make thresholds and limits editable in one place."],
};

const readJson = f => { try { return JSON.parse(readFileSync(f, "utf8")); } catch { return null; } };
const text = readFileSync(DATA_FILE, "utf8");
const ctx = { window: {} }; vm.runInNewContext(text, ctx); const D = ctx.window.DATA;
if (!D || !Array.isArray(D.repos) || !D.groups) throw new Error("The competitors data could not be read");

const file = readJson(PROPOSALS) || { updated: "", proposals: [] };
const list = Array.isArray(file) ? file : file.proposals || [];
const covered = new Set(list.map(p => p.tag));
const ids = new Set(list.map(p => p.id));
const cats = D.groups.flatMap(g => g.cats.map(c => c[0]));

const cand = cats.filter(c => !SKIP.has(c) && !covered.has(c) && WORDS[c]).map(c => {
  const rows = D.repos.map(r => [r.nav, r.scores[c] ?? 0]).sort((a, b) => b[1] - a[1]);
  const rank = 1 + rows.filter(r => r[1] >= 5).length;   // Adlin's Investments is the 5 baseline
  return { c, rank, best: rows[0][1], lead: rows.slice(0, 2) };
}).filter(x => x.best >= 8 && x.rank >= 6).sort((a, b) => b.rank - a.rank || b.best - a.best).slice(0, MAX_NEW);

const added = [];
for (const x of cand) {
  const [title, note] = WORDS[x.c]; let id = "gap-" + x.c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); if (ids.has(id)) continue;
  added.push({ id, title, note: `${note} ${x.lead[0][0]} scores ${x.lead[0][1]} here.`, tag: x.c, prio: SAFETY.has(x.c) ? 1 : x.best >= 9 ? 2 : 3, source: x.lead.map(r => `${r[0]} ${r[1]}`).join(", ") });
}
const out = { updated: new Date().toISOString().slice(0, 10), proposals: [...list, ...added] };
writeFileSync(PROPOSALS, JSON.stringify(out, null, 2) + "\n");
console.log(`added ${added.length}: ${added.map(a => a.id).join(", ") || "nothing new"}`);
