// What each page shows from a dashboard, the settings, and the lock screen.
import test from "node:test";
import assert from "node:assert/strict";
import { openApp, loaded, FakeGitHub, sampleDashboard } from "./harness.mjs";

const VIEWS = ["positions", "performance", "trades", "risk", "strategies", "office", "competitors", "roadmap"];
const money = n => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
const withApp = (options, body) => async () => { const app = await openApp(options); try { await loaded(app.page); await body(app); assert.deepEqual(app.errors, [], "page errors"); } finally { await app.close(); } };

test("not connected: no token means no calls to GitHub and the chip says so", async () => {
  const app = await openApp({storage: {token: ""}});
  try {
    await app.page.waitForFunction(() => /not connected/i.test(document.getElementById("chip").textContent));
    assert.deepEqual(app.gh.calls, []);
  } finally { await app.close(); }
});

test("each page shows only itself, and Settings leaves the page you were on", withApp({}, async ({page}) => {
  for (const view of VIEWS) {
    await page.click(`[data-go="${view}"]`);
    const shown = await page.$$eval("[data-view]", els => [...new Set(els.filter(e => !e.classList.contains("hidden")).map(e => e.dataset.view))]);
    assert.deepEqual(shown, [view], `on ${view}`);
  }
  await page.click("#settingsBtn");
  assert.deepEqual(await page.$$eval("[data-view]", els => [...new Set(els.filter(e => !e.classList.contains("hidden")).map(e => e.dataset.view))]), ["settings"]);
  await page.click("#settingsBtn");
  assert.deepEqual(await page.$$eval("[data-view]", els => [...new Set(els.filter(e => !e.classList.contains("hidden")).map(e => e.dataset.view))]), ["roadmap"]);
}));

test("the account numbers and the positions table match the dashboard", async () => {
  const gh = new FakeGitHub(), d = gh.dashboard;
  d.positions = [{symbol: "AAA", shares: 3, price: 10, cost: 9, value: 30, gain: 3, strategy: "macd+momentum", free_to_sell: "2020-01-01"},
                 {symbol: "BBB", shares: 1, price: 20, cost: 21, value: 20, gain: -1, strategy: "owner", free_to_sell: null}];
  d.account = {total: 250.5, cash: 200.5, settled_cash: 200.5, buying_power: 200.5, today_pl: -5};
  const app = await openApp({gh});
  try {
    const {page} = app;
    await loaded(page);
    assert.equal(await page.textContent("#total"), money(250.5));
    assert.equal(await page.textContent("#cash"), money(200.5));
    assert.equal(await page.textContent("#invested"), money(50));
    assert.match(await page.textContent("#today"), /-\$5\.00/);
    assert.deepEqual(await page.$$eval("#positions tr td.sym", t => t.map(x => x.textContent)), ["AAA", "BBB"]);
    const total = await page.$$eval("#posTotal tr", rows => rows.map(r => r.cells[0].textContent + " " + r.cells[3].textContent));
    assert.deepEqual(total, ["Stocks $50.00", "Cash $200.50", "Total $250.50"]);
    assert.match(await page.textContent("#posCount"), /2 stocks held/i);
    assert.deepEqual(app.errors, []);
  } finally { await app.close(); }
});

test("a dashboard with nothing held says so", async () => {
  const gh = new FakeGitHub();
  gh.dashboard.positions = [];
  const app = await openApp({gh});
  try {
    await loaded(app.page);
    assert.match(await app.page.textContent("#positions"), /No positions/);
    assert.equal((await app.page.textContent("#posCount")).trim(), "");
    assert.deepEqual(app.errors, []);
  } finally { await app.close(); }
});

test("a halt and a buy block each show a banner; a quiet bot shows none", async () => {
  for (const [patch, banner, chip] of [[{halt: {reason: "owner paused it"}}, /Trading is halted: owner paused it/, /halted/i],
                                       [{buy_block: {reason: "down 8% today"}}, /No buys today: down 8% today/, /active/i],
                                       [{}, null, /active/i]]) {
    const gh = new FakeGitHub();
    Object.assign(gh.dashboard, {halt: null, buy_block: null}, patch);
    const app = await openApp({gh});
    try {
      await loaded(app.page);
      assert.match(await app.page.textContent("#chip"), chip);
      if (banner) assert.match(await app.page.textContent("#banner"), banner); else assert.ok(await app.page.isHidden("#banner"));
    } finally { await app.close(); }
  }
});

test("the login countdown says days left, one day, or expired", async () => {
  for (const [left, text] of [[12.6, /12 days left/i], [1.2, /1 day left/i], [0.4, /0 days left/i], [-1, /expired/i]]) {
    const gh = new FakeGitHub();
    gh.dashboard.login = {days_left: left, expires: "2026-11-20T00:00:00+00:00"};
    const app = await openApp({gh});
    try { await loaded(app.page); assert.match(await app.page.textContent("#loginInfo"), text, String(left)); }
    finally { await app.close(); }
  }
});

test("every page draws from the sample dashboard without errors", withApp({}, async ({page, gh}) => {
  const d = gh.dashboard;
  await page.click('[data-go="performance"]');
  assert.ok(await page.isVisible("#chart"), "the growth chart");
  assert.ok((await page.locator("#bars .vs").count()) >= 2, "the bot and at least one market in the comparison");
  await page.click('[data-go="trades"]');
  assert.ok((await page.locator("#trades .tr").count()) >= d.sales.length, "every closed sale is listed");
  assert.equal(await page.locator("#tradeTiles > div").count(), 4);
  await page.click('[data-go="risk"]');
  assert.match(await page.textContent("#riskBody"), /If every stock fell 10% at once/);
  await page.click('[data-go="strategies"]');
  assert.ok((await page.textContent("#stratBody")).trim().length > 0);
  await page.click('[data-go="office"]');
  assert.ok((await page.locator(".mate").count()) >= 4, "a conversation per agent");
  await page.click('[data-go="competitors"]');
  await page.click('[data-go="roadmap"]');
}));

test("the Trades page lists a blocked order with its reason and a sale with its profit", async () => {
  const gh = new FakeGitHub();
  gh.dashboard.blocked = [{date: "2026-11-02", symbol: "ZZZ", side: "BUY", shares: 2, price: 10, why: "over the order limit"}];
  gh.dashboard.sales = [{date: "2026-11-03", symbol: "KO", shares: 2, price: 60, profit: 12.34}];
  gh.dashboard.orders = [];
  gh.dashboard.income = [];
  const app = await openApp({gh});
  try {
    await loaded(app.page);
    await app.page.click('[data-go="trades"]');
    const text = await app.page.textContent("#trades");
    assert.match(text, /ZZZ/); assert.match(text, /Over the order limit/);
    assert.match(text, /\+\$12\.34/);
    assert.deepEqual(app.errors, []);
  } finally { await app.close(); }
});

test("saving a token keeps it in the browser and loads the dashboard; Forget removes it", async () => {
  const app = await openApp({storage: {token: ""}});
  try {
    const {page, gh} = app;
    await page.click("#settingsBtn");
    await page.fill("#token", "github_pat_new");
    await page.click("#save");
    assert.equal(await page.evaluate(() => localStorage.getItem("token")), "github_pat_new");
    assert.equal(await page.inputValue("#token"), "", "the box is cleared");
    await loaded(page);
    assert.ok(gh.calls.includes("GET /contents/dashboard.json"));
    await page.click("#settingsBtn");
    await page.click("#forget");
    assert.equal(await page.evaluate(() => localStorage.getItem("token")), null);
    assert.deepEqual(app.errors, []);
  } finally { await app.close(); }
});

test("theme and light/dark choices are remembered", withApp({}, async ({page}) => {
  await page.click("#settingsBtn");
  await page.click('#modeSeg [data-mode="dark"]');
  assert.deepEqual(await page.evaluate(() => [document.documentElement.dataset.mode, localStorage.getItem("mode")]), ["dark", "dark"]);
  await page.click('#themeSw button[data-theme="violet"]');
  assert.equal(await page.evaluate(() => localStorage.getItem("theme")), "violet");
}));

test("the lock screen refuses a wrong password and hides the app", async () => {
  const app = await openApp({storage: {"trading:unlocked": "no"}, enter: false});
  try {
    const {page} = app;
    assert.ok(await page.isVisible("#lock"));
    assert.ok(await page.isHidden("main"));
    await page.fill("#pw", "not the password");
    await page.press("#pw", "Enter");
    await page.waitForFunction(() => /wrong password/i.test(document.getElementById("lockErr").textContent));
    assert.ok(await page.isVisible("#lock"));
    assert.deepEqual(app.errors, []);
  } finally { await app.close(); }
});
