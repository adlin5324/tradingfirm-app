// Every button that starts the bot: what it asks, what it sends to GitHub, and what it does when GitHub says no.
import test from "node:test";
import assert from "node:assert/strict";
import { openApp, loaded, FakeGitHub } from "./harness.mjs";

const until = async (check, what = "condition") => {
  for (let i = 0; i < 200; i++) { if (await check()) return; await new Promise(r => setTimeout(r, 25)); }
  throw new Error("timed out waiting for " + what);
};
const asking = page => page.waitForSelector("#askBox[open]");
const answer = async (page, text) => { await asking(page); if (text !== undefined) await page.fill("#askInput", text); await page.click("#askYes"); };
const idle = page => page.waitForFunction(() => !document.querySelector("#tradeSwitch").disabled);
const withApp = (options, body) => async () => { const app = await openApp(options); try { await loaded(app.page); await body(app); assert.deepEqual(app.errors, [], "page errors"); } finally { await app.close(); } };

test("halting asks for a reason and starts only the bot's halt command", withApp({}, async ({page, gh}) => {
  assert.equal(await page.getAttribute("#tradeSwitch", "aria-checked"), "true");
  await page.click("#tradeSwitch");
  assert.match(await page.textContent("#askTitle"), /halt trading/i);
  assert.equal(await page.inputValue("#askInput"), "Paused from the app");
  await answer(page, "checking something");
  await until(() => gh.dispatches.length === 1, "the halt dispatch");
  assert.deepEqual(gh.dispatches, [{workflow: "bot.yml", ref: "main", inputs: {command: "halt", reason: "checking something"}}]);
  await idle(page);
  assert.equal(gh.calls.filter(c => c === "GET /contents/dashboard.json").length, 2, "the dashboard is read again after the run ends");
}));

test("cancelling the question starts nothing", withApp({}, async ({page, gh}) => {
  await page.click("#tradeSwitch");
  await asking(page);
  await page.click("#askNo");
  await page.waitForSelector("#askBox", {state: "hidden"});
  assert.equal(gh.dispatches.length, 0);
}));

test("a halt or resume with no reason is refused in the box", withApp({}, async ({page, gh}) => {
  await page.click("#tradeSwitch");
  await answer(page, "");
  assert.notEqual((await page.textContent("#askErr")).trim(), "");
  assert.ok(await page.isVisible("#askBox"), "the box stays open");
  assert.equal(gh.dispatches.length, 0);
}));

test("a halted bot shows the banner and the switch resumes it", async () => {
  const gh = new FakeGitHub();
  gh.dashboard.halt = {reason: "owner paused it", by: "owner"};
  const app = await openApp({gh});
  try {
    await loaded(app.page);
    assert.equal(await app.page.textContent("#chip"), "Halted");
    assert.equal(await app.page.getAttribute("#tradeSwitch", "aria-checked"), "false");
    assert.match(await app.page.textContent("#banner"), /Trading is halted: owner paused it/);
    await app.page.click("#tradeSwitch");
    assert.match(await app.page.textContent("#askTitle"), /resume trading/i);
    await answer(app.page, "all clear");
    await until(() => gh.dispatches.length === 1);
    assert.deepEqual(gh.started("bot.yml"), [{command: "resume", reason: "all clear"}]);
  } finally { await app.close(); }
});

test("a deposit must be a number, and the text goes to the bot as typed", withApp({}, async ({page, gh}) => {
  await page.click('[data-go="performance"]');
  await page.click('[data-cmd="deposit"]');
  await answer(page, "lots");
  assert.match(await page.textContent("#askErr"), /Enter a number/);
  await page.fill("#askInput", "-50");
  await page.click("#askYes");
  await until(() => gh.dispatches.length === 1);
  assert.deepEqual(gh.started("bot.yml"), [{command: "deposit", reason: "-50"}]);
}));

test("verify login asks to confirm, without a text box, and sends no reason", withApp({}, async ({page, gh}) => {
  await page.click('[data-cmd="login"]');
  await asking(page);
  assert.ok(await page.isHidden("#askInput"));
  await page.click("#askYes");
  await until(() => gh.dispatches.length === 1);
  assert.deepEqual(gh.started("bot.yml"), [{command: "login", reason: ""}]);
}));

test("Refresh reads the account when the market is closed", withApp({now: new Date("2026-11-07T15:00:00Z")}, async ({page, gh}) => {  // a Saturday
  await page.click("#liveBtn");
  await until(() => gh.dispatches.length === 1);
  assert.deepEqual(gh.dispatches.map(d => [d.workflow, d.inputs]), [["bot.yml", {command: "account", reason: ""}]]);
}));

test("Refresh starts the quick live update while the market is open", withApp({now: new Date("2026-11-09T16:00:00Z")}, async ({page, gh}) => {  // Monday 11:00 New York
  await page.click("#liveBtn");
  await until(() => gh.dispatches.length === 1);
  assert.deepEqual(gh.dispatches.map(d => [d.workflow, d.inputs]), [["live.yml", undefined]]);
}));

const positions = () => [
  {symbol: "AAA", shares: 3, price: 10, cost: 9, value: 30, gain: 3, strategy: "macd", free_to_sell: "2020-01-01"},
  {symbol: "BBB", shares: 1, price: 20, cost: 21, value: 20, gain: -1, strategy: "macd", free_to_sell: "2099-01-01"},  // not settled yet
  {symbol: "CCC", shares: 2, price: 5, cost: 5, value: 10, gain: 0, strategy: "owner", free_to_sell: null}];

test("emergency sell locks unsettled stocks and sells only what is ticked, after a second question", async () => {
  const gh = new FakeGitHub();
  gh.dashboard.positions = positions();
  const app = await openApp({gh});
  try {
    const {page} = app;
    await loaded(page);
    await page.click("#sellBtn");
    assert.equal(await page.locator("#sellList input").count(), 3);
    assert.ok(await page.locator('#sellList input[value="BBB"]').isDisabled(), "a stock bought too recently is locked");
    assert.ok(await page.isDisabled("#sellGo"));
    await page.check("#sellAll");  // only the stocks that can be sold
    assert.deepEqual(await page.locator("#sellList input:checked").evaluateAll(l => l.map(i => i.value)), ["AAA", "CCC"]);
    assert.match(await page.textContent("#sellGo"), /sell 2 selected/i);
    await page.click("#sellGo");
    await asking(page);
    assert.match(await page.textContent("#askText"), /AAA, CCC/);
    await page.click("#askNo");
    assert.equal(gh.dispatches.length, 0, "cancelling the second question sells nothing");
    await page.click("#sellBtn");
    await page.check('#sellList input[value="AAA"]');
    await page.click("#sellGo");
    await answer(page);
    await until(() => gh.dispatches.length === 1);
    assert.deepEqual(gh.started("bot.yml"), [{command: "sell", reason: "AAA"}]);
    assert.deepEqual(app.errors, []);
  } finally { await app.close(); }
});

test("with nothing held the sell box says so and cannot sell", withApp({}, async ({page}) => {
  await page.evaluate(() => { positions = []; });
  await page.click("#sellBtn");
  assert.match(await page.textContent("#sellList"), /No positions to sell/);
  assert.ok(await page.isDisabled("#sellGo") && await page.isDisabled("#sellAll"));
}));

test("freeze and sell all halts first, then sells everything, and only after confirming", withApp({}, async ({page, gh}) => {
  await page.click("#freezeBtn");
  await asking(page);
  await page.click("#askNo");
  assert.equal(gh.dispatches.length, 0);
  await page.click("#freezeBtn");
  await answer(page);
  await until(() => gh.dispatches.length === 2, "both dispatches");
  assert.deepEqual(gh.started("bot.yml"), [{command: "halt", reason: "Freeze and sell from the app"}, {command: "sell", reason: "ALL"}]);
}));

test("a GitHub refusal to start the run is shown on the card and the buttons come back", withApp({}, async ({page, gh}) => {
  gh.dispatchStatus = 422;
  await page.click('[data-cmd="login"]');
  await answer(page);
  await page.waitForFunction(() => /GitHub didn't start it \(422\)/.test(document.body.textContent));
  await idle(page);
  assert.equal(gh.dispatches.length, 0);
}));

test("a run that fails says which job and step broke", withApp({}, async ({page, gh}) => {
  gh.conclusion = "failure";
  await page.click('[data-cmd="login"]');
  await answer(page);
  await page.waitForFunction(() => /Failed in job "bot", step "Run the bot"/.test(document.body.textContent));
  await idle(page);
}));

test("tightening a limit shows today's value cleanly and refuses a looser or equal one", withApp({}, async ({page, gh}) => {
  await page.click("#settingsBtn");
  const row = page.locator('[data-limit="max_daily_loss"]');
  assert.match(await row.textContent(), /7%/);
  await row.click();
  await asking(page);
  assert.match(await page.textContent("#askText"), /Now 7%\./, "the current value, not 7.000000000000001%");
  for (const refused of ["7", "8", "0", "abc"]) {
    await page.fill("#askInput", refused);
    await page.click("#askYes");
    assert.match(await page.textContent("#askErr"), /Enter a lower number than 7/, `"${refused}" should be refused`);
  }
  assert.equal(gh.dispatches.length, 0);
  await page.fill("#askInput", "5");
  await page.click("#askYes");
  await until(() => gh.dispatches.length === 1);
  assert.deepEqual(gh.started("bot.yml"), [{command: "tighten", reason: "max_daily_loss 0.05"}]);
}));

test("votes needed may only go up, and whole-number limits are sent as whole numbers", withApp({}, async ({page, gh}) => {
  const now = gh.dashboard.limits.min_strategies_agree;
  await page.click("#settingsBtn");
  await page.locator('[data-limit="min_strategies_agree"]').click();
  await page.fill("#askInput", String(now - 1));
  await page.click("#askYes");
  assert.match(await page.textContent("#askErr"), /higher number/);
  await page.fill("#askInput", String(now + 1));
  await page.click("#askYes");
  await until(() => gh.dispatches.length === 1);
  assert.deepEqual(gh.started("bot.yml"), [{command: "tighten", reason: `min_strategies_agree ${now + 1}`}]);
}));

const shown = (page, pattern) => page.waitForFunction(p => new RegExp(p, "i").test(document.getElementById("problem").textContent) && !document.getElementById("problem").classList.contains("hidden"), pattern.source);

test("a halt that GitHub refuses is shown, not swallowed (the title switch has no status line of its own)", withApp({}, async ({page, gh}) => {
  gh.dispatchStatus = 422;
  await page.click("#tradeSwitch");
  await answer(page);
  await shown(page, /Halt Trading failed: GitHub didn't start it \(422\)/);
  await idle(page);
}));

test("a refused Verify login is shown too", withApp({}, async ({page, gh}) => {
  gh.dispatchStatus = 422;
  await page.click("#loginBtn");
  await answer(page);
  await shown(page, /GitHub didn't start it \(422\)/);
}));

test("a token GitHub refuses (expired or revoked) says so instead of staying on Loading", async () => {
  const gh = new FakeGitHub();
  gh.status["/contents/dashboard.json"] = 403;
  const app = await openApp({gh});
  try {
    await shown(app.page, /GitHub refused the token \(403\)/);
    assert.match(await app.page.textContent("#chip"), /can't load/i);
    gh.status = {};  // a new token, then a refresh: the message goes away
    await app.page.evaluate(() => refresh());
    await loaded(app.page);
    await app.page.waitForFunction(() => document.getElementById("problem").classList.contains("hidden"));
    assert.equal(await app.page.textContent("#chip"), "Active");
  } finally { await app.close(); }
});
