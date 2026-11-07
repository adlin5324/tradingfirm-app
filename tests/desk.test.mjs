// The Desk: Yes and No on proposals from the Mechanic, Quant and evolution engine.
import test from "node:test";
import assert from "node:assert/strict";
import { openApp, loaded, FakeGitHub } from "./harness.mjs";

const until = async (check, what = "condition") => {
  for (let i = 0; i < 200; i++) { if (await check()) return; await new Promise(r => setTimeout(r, 25)); }
  throw new Error("timed out waiting for " + what);
};
const pr = (number, branch, extra = {}) => ({number, title: `Proposal ${number}`, html_url: `https://github.com/x/pull/${number}`,
  head: {ref: branch, sha: `sha${number}`}, body: "A small change.", ...extra});
const passed = [{name: "Checks", status: "completed", conclusion: "success"}];

async function desk(setup) {
  const gh = new FakeGitHub();
  gh.dashboard.team = {};  // the app reads the live issues and pull requests only when the dashboard has a team section
  setup(gh);
  const app = await openApp({gh});
  await loaded(app.page);
  await app.page.click('[data-go="office"]');
  return app;
}
const open = (page, name) => page.click(`.mate[aria-label="${name}"]`);
const buttons = page => page.locator(".bubble .acts button");  // in order: Yes, No
const talk = (page, name) => page.click(`.mate[aria-label="${name}"]`);

test("an evolution card can be answered Yes only when its tests passed, and it takes two taps", async () => {
  const app = await desk(gh => { gh.pulls = [pr(7, "agent/evolve-1-0")]; gh.checks.sha7 = passed; });
  try {
    const {page, gh} = app;
    await talk(page, "Evolution engine");
    const [yes] = [buttons(page).nth(0)];
    assert.equal((await yes.textContent()).trim(), "Yes");
    assert.ok(await yes.isEnabled());
    await yes.click();
    assert.match(await yes.textContent(), /tap again to confirm/i);
    assert.equal(gh.dispatches.length, 0, "the first tap only arms the button");
    await yes.click();
    await until(() => gh.dispatches.length === 1);
    assert.deepEqual(gh.started("decide.yml"), [{pr: "7", answer: "yes"}]);
    assert.equal(gh.dispatches.length, 1);
    assert.deepEqual(app.errors, []);
  } finally { await app.close(); }
});

test("an evolution card whose tests have not passed cannot be answered Yes", async () => {
  for (const checks of [[], [{name: "Checks", status: "completed", conclusion: "failure"}],
                        [{name: "Checks", status: "in_progress", conclusion: null}],
                        [...passed, {name: "Checks", status: "completed", conclusion: "failure"}]]) {
    const app = await desk(gh => { gh.pulls = [pr(7, "agent/evolve-1-0")]; gh.checks.sha7 = checks; });
    try {
      await talk(app.page, "Evolution engine");
      const yes = buttons(app.page).nth(0);
      assert.ok(await yes.isDisabled(), JSON.stringify(checks));
      assert.match(await yes.textContent(), /tests not passed/i);
      assert.match(await app.page.textContent(".bubble"), /Tests not passed, so Yes is off/);
    } finally { await app.close(); }
  }
});

test("a run GitHub holds at action required never ran, so it does not count against an evolution card", async () => {
  const app = await desk(gh => { gh.pulls = [pr(7, "agent/evolve-1-0")]; gh.checks.sha7 = [...passed, {name: "Checks", status: "completed", conclusion: "action_required"}]; });
  try {
    await talk(app.page, "Evolution engine");
    assert.ok(await buttons(app.page).nth(0).isEnabled());
  } finally { await app.close(); }
});

test("No takes two taps as well, and an armed button falls back after five seconds", async () => {
  const app = await desk(gh => { gh.pulls = [pr(7, "agent/evolve-1-0")]; gh.checks.sha7 = passed; });
  try {
    const {page, gh} = app;
    await talk(page, "Evolution engine");
    const no = buttons(page).nth(1);
    await no.click();
    assert.match(await no.textContent(), /tap again/i);
    await page.waitForFunction(() => /^No$/i.test(document.querySelectorAll(".bubble .acts button")[1].textContent.trim()), null, {timeout: 8000});
    assert.equal(gh.dispatches.length, 0, "an armed button that was left alone sends nothing");
    await no.click();
    await no.click();
    await until(() => gh.dispatches.length === 1);
    assert.deepEqual(gh.started("decide.yml"), [{pr: "7", answer: "no"}]);
  } finally { await app.close(); }
});

test("a change to a safety limit is flagged on the card", async () => {
  const app = await desk(gh => { gh.pulls = [pr(7, "agent/evolve-1-0", {body: "**RED BANNER: this changes a safety limit.**\nLower max per stock."})]; gh.checks.sha7 = passed; });
  try {
    await talk(app.page, "Evolution engine");
    assert.match(await app.page.textContent(".bubble"), /Safety limit: Proposal 7/i);
    assert.match(await app.page.textContent(".bubble"), /This changes a safety limit/);
  } finally { await app.close(); }
});

test("Mechanic and Quant proposals are answered from their own conversations", async () => {
  const app = await desk(gh => { gh.pulls = [pr(11, "agent/mechanic-5"), pr(12, "agent/quant-6"), pr(13, "someone/else")]; });
  try {
    const {page, gh} = app;
    await talk(page, "Quant researcher");
    assert.match(await page.textContent(".bubble"), /Waiting on you: #12/);
    await buttons(page).nth(0).click();
    await buttons(page).nth(0).click();
    await until(() => gh.dispatches.length === 1);
    assert.deepEqual(gh.started("decide.yml"), [{pr: "12", answer: "yes"}]);
    await page.click(".mail-back");
    await talk(page, "Mechanic");
    assert.match(await page.textContent(".bubble"), /#11/);
    assert.doesNotMatch(await page.textContent("#inbox"), /#13/, "a pull request from outside the agents never shows a Yes button");
  } finally { await app.close(); }
});

test("a refused decision is reported on the Desk", async () => {
  const app = await desk(gh => { gh.pulls = [pr(7, "agent/evolve-1-0")]; gh.checks.sha7 = passed; gh.dispatchStatus = 422; });
  try {
    const yes = buttons(app.page).nth(0);
    await talk(app.page, "Evolution engine");
    await yes.click();
    await yes.click();
    await app.page.waitForFunction(() => /Your yes on #7 failed: GitHub didn't start it \(422\)/.test(document.body.textContent));
    assert.equal(app.gh.dispatches.length, 0);
    assert.ok(await yes.isEnabled(), "the button comes back");
  } finally { await app.close(); }
});
