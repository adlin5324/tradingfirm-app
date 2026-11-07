import test from "node:test";
import assert from "node:assert/strict";
import { openApp, loaded, FakeGitHub } from "./harness.mjs";

test("the app loads the dashboard and shows the account", async () => {
  const app = await openApp();
  try {
    await loaded(app.page);
    const total = await app.page.textContent("#total");
    assert.match(total, /^\$[\d,]+\.\d\d$/);
    assert.equal(await app.page.textContent("#chip"), "Active");
    assert.deepEqual(app.errors, []);
  } finally { await app.close(); }
});
