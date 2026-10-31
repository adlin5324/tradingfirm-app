// Roadmap tab: a to-do board for improving Adlin's Investments. Tasks live in this browser only (localStorage).
(() => {
  const $ = id => document.getElementById(id);
  const NS = "roadmap:", KEY = NS + "tasks";
  // The short-lived sync version stored a token and a cache on this device; clear them. Tasks and choices are kept.
  for (const k of ["token", "state", "queue", "inflight", "migrated"]) { try { localStorage.removeItem(NS + k); } catch {} }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const STATUS = [["todo", "To do"], ["doing", "Doing"]];  // finished tasks are removed, so there is no Done list
  const PRIO = { 1: "High", 2: "Medium", 3: "Low" };

  // Starts empty. Starter tasks from an earlier version (ids s0-s8) are removed from this device on load.
  let tasks = [];
  try { tasks = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (!Array.isArray(tasks)) tasks = [];
  const kept = tasks.filter(t => !/^s\d$/.test(t.id) && t.status !== "done");
  if (kept.length !== tasks.length) { tasks = kept; save(); }
  // Proposals come from proposals.json (written by the gap-scout agent). Approving one adds it to the board; both choices are remembered.
  let proposals = [], seen = [], updated = "";
  try { seen = JSON.parse(localStorage.getItem(NS + "seen")); } catch {}
  if (!Array.isArray(seen)) seen = [];
  const saveSeen = () => { try { localStorage.setItem(NS + "seen", JSON.stringify(seen)); } catch {} };
  const fmtDate = d => { const t = new Date(d + "T12:00:00"); return isNaN(t) ? d : t.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); };
  const pending = () => proposals.filter(p => !seen.includes(p.id) && !tasks.some(t => t.id === p.id));
  const proposalHtml = p => `<li class="task proposal" data-pid="${esc(p.id)}">
    <div class="t-main"><span class="t-title">${esc(p.title)}</span>
      <span class="t-meta"><span class="prio p${p.prio}">${PRIO[p.prio] || "Medium"}</span>${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ""}</span></div>
    ${p.note ? `<p class="t-note">${esc(p.note)}</p>` : ""}
    ${p.source ? `<p class="t-src">Leaders: ${esc(p.source)}</p>` : ""}
    <div class="t-actions"><button type="button" data-approve class="primary">Approve</button><button type="button" data-dismiss>Dismiss</button></div></li>`;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {} }

  let filter = "all";
  const counts = () => Object.fromEntries(STATUS.map(([k]) => [k, tasks.filter(t => t.status === k).length]));

  const taskHtml = t => `<li class="task ${t.status}" data-id="${esc(t.id)}">
    <div class="t-main"><span class="t-title">${esc(t.title)}</span>
      <span class="t-meta"><span class="prio p${t.prio}">${PRIO[t.prio]}</span>${t.tag ? `<span class="tag">${esc(t.tag)}</span>` : ""}</span></div>
    ${t.note ? `<p class="t-note">${esc(t.note)}</p>` : ""}
    <div class="t-actions">
      ${STATUS.map(([k, label]) => `<button type="button" data-set="${k}" class="${t.status === k ? "on" : ""}" aria-pressed="${t.status === k}">${label}</button>`).join("")}
      <button type="button" data-done class="fin" aria-label="Mark done and remove">Done</button>
    </div></li>`;

  function render() {
    const c = counts(), total = tasks.length;
    $("rmPills").innerHTML = [["all", "All", total], ...STATUS.map(([k, l]) => [k, l, c[k]])]
      .map(([k, l, n]) => `<button type="button" data-filter="${k}" class="${filter === k ? "on" : ""}">${l} <span>${n}</span></button>`).join("");
    const groups = STATUS.filter(([k]) => filter === "all" || filter === k);
    const pend = pending();
    $("board").innerHTML = (pend.length && filter === "all" ? `<section class="card glow"><h2>Proposed <span>${pend.length} to review</span></h2>${updated ? `<p class="t-src agent-date">Agent last ran ${esc(fmtDate(updated))}</p>` : ""}<ul class="tasks">${pend.map(proposalHtml).join("")}</ul>` + (pend.length > 1 ? '<div class="t-actions"><button type="button" data-approve-all>Approve all</button><button type="button" data-dismiss-all>Dismiss all</button></div>' : "") + "</section>" : "") +
      groups.map(([k, label]) => {
        const list = tasks.filter(t => t.status === k).sort((a, b) => a.prio - b.prio);
        return `<section class="card"><h2>${label} <span>${list.length}</span></h2>${list.length ? `<ul class="tasks">${list.map(taskHtml).join("")}</ul>` : '<p class="empty">Nothing here.</p>'}</section>`;
      }).join("");
    document.querySelectorAll("#board .card").forEach(c => c.classList.add("in"));
  }

  document.addEventListener("click", e => {
    if (!e.target.closest("#rm")) return;
    const f = e.target.closest("[data-filter]"); if (f) { filter = f.dataset.filter; render(); return; }
    const pe = e.target.closest("[data-approve-all],[data-dismiss-all]");
    if (pe) { const all = pending(); if (pe.hasAttribute("data-approve-all")) all.forEach(p => tasks.push({ id: p.id, title: p.title, note: p.note || "", tag: p.tag || "", prio: p.prio || 2, status: "todo" })); all.forEach(p => seen.push(p.id)); save(); saveSeen(); render(); return; }
    const pli = e.target.closest(".proposal");
    if (pli) {
      const p = proposals.find(x => x.id === pli.dataset.pid); if (!p) return;
      if (e.target.closest("[data-approve]")) tasks.push({ id: p.id, title: p.title, note: p.note || "", tag: p.tag || "", prio: p.prio || 2, status: "todo" });
      else if (!e.target.closest("[data-dismiss]")) return;
      seen.push(p.id); save(); saveSeen(); render(); return;
    }
    const li = e.target.closest(".task"); if (!li) return;
    const t = tasks.find(x => x.id === li.dataset.id); if (!t) return;
    const s = e.target.closest("[data-set]");
    if (s) t.status = s.dataset.set;
    else if (e.target.closest("[data-done]")) tasks = tasks.filter(x => x !== t);
    else return;
    save(); render();
  });

  render();
  fetch("proposals.json?v=" + Date.now(), { cache: "no-store" }).then(r => r.ok ? r.json() : {}).then(data => { const list = Array.isArray(data) ? data : data.proposals; updated = (!Array.isArray(data) && data.updated) || ""; if (Array.isArray(list)) { proposals = list.filter(p => p && p.id && p.title); render(); } }).catch(() => {});
})();

// "Agent prompt": copies the instruction for the gap-scout agent, to paste into Claude.
(() => {
  const PROMPT = "Run the gap-scout agent for my Roadmap tab. Read the latest scores and the \"What it lacks\" list from competitors-data.js, add up to 5 new suggestions to proposals.json in the adlin5324/tradingfirm-app repo (keep every existing one and never change their ids), set updated to today's date, then commit and push to main.";
  const btn = document.getElementById("rmCopy"), label = document.getElementById("rmCopyLabel"); if (!btn) return;
  const done = t => { label.textContent = t; setTimeout(() => { label.textContent = "Agent prompt"; }, 2000); };
  btn.onclick = async () => {
    try { await navigator.clipboard.writeText(PROMPT); done("Copied"); }
    catch { const t = document.createElement("textarea"); t.value = PROMPT; t.style.cssText = "position:fixed;opacity:0"; document.body.append(t); t.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {} t.remove(); done(ok ? "Copied" : "Copy failed"); }
  };
})();
