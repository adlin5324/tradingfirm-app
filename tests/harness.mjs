// Runs the real index.html in headless Chromium against a fake GitHub API. No network, no real token.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const REPO = "adlin5324/tradingfirm";
const LOCK_HASH = /hash: "([0-9a-f]{64})"/.exec(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"))[1];
const TYPES = {".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".webmanifest": "application/manifest+json"};
const CORS = {"access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*"};

// A dashboard.json made by the bot's own dashboard.write on its fake brokerage (see tests/fixtures/README.md).
export const sampleDashboard = () => JSON.parse(fs.readFileSync(path.join(ROOT, "tests/fixtures/dashboard.json"), "utf8"));

export class FakeGitHub {
  constructor() {
    this.dashboard = sampleDashboard();
    this.issues = [];
    this.pulls = [];
    this.checks = {};         // head sha -> the "Checks" workflow runs GitHub reports for it
    this.dispatches = [];     // every workflow started: {workflow, ref, inputs}
    this.calls = [];          // every request: "METHOD /path"
    this.dispatchStatus = 204;
    this.conclusion = "success";  // how the started run ends
    this.status = {};         // path -> forced HTTP status, e.g. {"/contents/dashboard.json": 403}
  }

  async attach(context) {
    await context.route("https://api.github.com/**", route => this.handle(route));
    await context.route(/fonts\.(googleapis|gstatic)\.com/, route => route.fulfill({status: 200, contentType: "text/css", body: ""}));
  }

  json(route, body, status = 200) {
    return route.fulfill({status, headers: {...CORS, "content-type": "application/json"}, body: status === 204 ? "" : JSON.stringify(body)});
  }

  handle(route) {
    const req = route.request(), url = new URL(req.url()), method = req.method();
    if (method === "OPTIONS") return route.fulfill({status: 204, headers: CORS});
    const at = url.pathname.replace(`/repos/${REPO}`, "");
    this.calls.push(`${method} ${at}`);
    if (this.status[at]) return this.json(route, {message: "forced"}, this.status[at]);
    let m;
    if (at === "/contents/dashboard.json") return this.json(route, this.dashboard);
    if (at === "/issues") return this.json(route, this.issues);
    if (at === "/pulls") return this.json(route, this.pulls);
    if (at === "/actions/runs") return this.json(route, {workflow_runs: this.checks[url.searchParams.get("head_sha")] || []});
    if ((m = /^\/actions\/workflows\/([^/]+)\/dispatches$/.exec(at)) && method === "POST") {
      if (this.dispatchStatus === 204) this.dispatches.push({workflow: m[1], ...JSON.parse(req.postData() || "{}")});
      return this.json(route, {message: "dispatch"}, this.dispatchStatus);
    }
    if ((m = /^\/actions\/workflows\/([^/]+)\/runs$/.exec(at))) {
      const started = this.dispatches.some(d => d.workflow === m[1]);
      return this.json(route, {workflow_runs: started ? [{id: 1, event: "workflow_dispatch", status: "completed",
        conclusion: this.conclusion, created_at: "2099-01-01T00:00:00Z", html_url: "https://github.com/run/1"}] : []});
    }
    if (/^\/actions\/runs\/\d+\/jobs$/.test(at)) {
      return this.json(route, {jobs: [{name: "bot", conclusion: "failure", steps: [{name: "Run the bot", conclusion: "failure"}]}]});
    }
    return this.json(route, {message: "not faked: " + at}, 404);
  }

  /** The dispatches for one workflow, as [inputs, ...]. */
  started(workflow) { return this.dispatches.filter(d => d.workflow === workflow).map(d => d.inputs); }
}

function serveFiles() {
  return http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/$/, "/index.html"));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, {"content-type": TYPES[path.extname(file)] || "application/octet-stream"});
    fs.createReadStream(file).pipe(res);
  });
}

/**
 * Opens the app signed in. Returns {page, gh, errors, close}. `storage` adds to what the app finds in localStorage
 * (use token: "" for not connected). The app waits 6 to 10 seconds between checks on a started workflow; those waits are cut to
 * 30 ms (fast: false keeps them). `now` fixes the page's date, e.g. new Date("2026-11-07T15:00:00Z"). enter: false stays on the
 * splash or lock screen.
 */
export async function openApp({gh = new FakeGitHub(), storage = {}, fast = true, now = null, enter = true, viewport = {width: 430, height: 900}} = {}) {
  const server = serveFiles();
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch();
  const context = await browser.newContext({viewport, serviceWorkers: "block"});
  await gh.attach(context);
  const saved = {token: "github_pat_test", repo: REPO, "trading:unlocked": LOCK_HASH, "trading:reset": "1", ...storage};
  await context.addInitScript(items => { for (const [k, v] of Object.entries(items)) if (v !== "") localStorage.setItem(k, v); }, saved);
  if (fast) await context.addInitScript(() => {
    const wait = window.setTimeout.bind(window);
    window.setTimeout = (fn, ms, ...args) => wait(fn, ms >= 6000 && ms <= 10000 ? 30 : ms, ...args);
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  if (now) await page.clock.setFixedTime(now);
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  if (enter) {
    await page.click("#welcome");  // the splash screen: any tap goes in
    await page.waitForFunction(() => !document.documentElement.classList.contains("welcome"));
  }
  return {page, gh, errors, async close() { await browser.close(); server.close(); }};
}

/** Waits for the dashboard to be drawn (the status line under the title says "Updated …"). */
export const loaded = page => page.waitForFunction(() => /^Updated/.test(document.getElementById("updated").textContent));
