// The page holds a GitHub token that can run the bot, so: nothing from GitHub or the dashboard may run as code, and the token
// may only ever go to api.github.com. Plus the page must fit a small phone.
import test from "node:test";
import assert from "node:assert/strict";
import { openApp, loaded, FakeGitHub } from "./harness.mjs";

const PAYLOAD = `<img src=x onerror="window.__xss=1"><script>window.__xss=2</script><svg onload="window.__xss=3">`;

test("text from GitHub and the dashboard is shown as text, never run", async () => {
  const gh = new FakeGitHub();
  gh.dashboard.team = {};
  gh.issues = [{number: 1, title: PAYLOAD, html_url: "https://github.com/x/issues/1", created_at: "2026-11-06T12:00:00Z", labels: [{name: "agent"}, {name: "market"}],
                body: `${PAYLOAD}\n| a | b |\n|---|---|\n| ${PAYLOAD} | **${PAYLOAD}** |\n- ${PAYLOAD}`}];
  gh.pulls = [{number: 5, title: PAYLOAD, html_url: "https://github.com/x/pull/5", head: {ref: "agent/quant-9", sha: "s"}, body: PAYLOAD}];
  Object.assign(gh.dashboard, {halt: {reason: PAYLOAD}, positions: [{symbol: PAYLOAD, shares: 1, price: 1, cost: 1, value: 1, gain: 0, strategy: PAYLOAD, free_to_sell: null}],
    blocked: [{date: "2026-11-02", symbol: PAYLOAD, side: "BUY", shares: 1, price: 1, why: PAYLOAD}], summary: [{label: PAYLOAD, text: PAYLOAD, tone: null}]});
  const app = await openApp({gh});
  const dialogs = [];
  app.page.on("dialog", d => { dialogs.push(d.message()); d.dismiss(); });
  try {
    const {page} = app;
    await loaded(page);
    for (const view of ["positions", "performance", "trades", "risk", "strategies", "office"]) await page.click(`[data-go="${view}"]`);
    await page.click(".mate[aria-label='Market Watcher']");
    await new Promise(r => setTimeout(r, 300));
    assert.equal(await page.evaluate(() => window.__xss), undefined, "no payload ran");
    assert.deepEqual(dialogs, []);
    assert.equal(await page.locator("main img[src='x'], main script, main svg[onload]").count(), 0, "no injected element exists");
    assert.match(await page.textContent("#inbox"), /<img src=x/, "the text is shown as written");
  } finally { await app.close(); }
});

test("the token only goes to api.github.com", async () => {
  const app = await openApp();
  const seen = [];
  app.page.on("request", r => { if (r.headers()["authorization"]) seen.push(new URL(r.url()).host); });
  try {
    await loaded(app.page);
    await app.page.click("#tradeSwitch");
    await app.page.waitForSelector("#askBox[open]");
    await app.page.click("#askYes");
    await new Promise(r => setTimeout(r, 500));
    assert.ok(seen.length >= 2);
    assert.deepEqual([...new Set(seen)], ["api.github.com"]);
  } finally { await app.close(); }
});

test("every page fits a small phone without sideways scrolling", async () => {
  const app = await openApp({viewport: {width: 360, height: 740}});
  try {
    const {page} = app;
    await loaded(page);
    for (const view of ["positions", "performance", "trades", "risk", "strategies", "office", "competitors", "roadmap"]) {
      await page.click(`[data-go="${view}"]`);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(over <= 1, `${view} is ${over}px wider than the screen`);
    }
    await page.click("#settingsBtn");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 1, "settings");
  } finally { await app.close(); }
});
