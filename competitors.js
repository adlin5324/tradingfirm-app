// Competitors tab. Builds every page from competitors-data.js: nav, repo cards, the Adlin's Investments card, leaderboard and group places.
(() => {
  const D = window.DATA, $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const BASE = 5;  // Adlin's Investments scores 5 in every category by definition
  const catNames = D.groups.flatMap(g => g.cats.map(c => c[0]));
  const repos = [...D.repos].sort((a, b) => a.nav.localeCompare(b.nav, undefined, { sensitivity: "base" }));
  const n = repos.length + 1;
  repos.forEach(r => {
    r.id = r.nav.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const miss = catNames.filter(c => !(c in r.scores));
    if (miss.length) console.warn(r.nav, "is missing scores for:", miss.join(", "));
  });
  const sc = (r, c) => r.scores[c] ?? 0;
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const nth = k => k + (k % 100 > 10 && k % 100 < 14 ? "th" : ["th", "st", "nd", "rd"][k % 10 < 4 ? k % 10 : 0]);
  const place = (a, all) => all.filter(x => x >= a - 1e-9).length;  // ties go to the lowest place
  const gAvg = (r, g) => mean(g.cats.map(c => sc(r, c[0])));
  const gPlace = (r, gi) => place(gAvg(r, D.groups[gi]), [BASE, ...repos.map(x => gAvg(x, D.groups[gi]))]);
  const myGPlace = gi => place(BASE, [BASE, ...repos.map(x => gAvg(x, D.groups[gi]))]);
  const myRank = c => 1 + repos.filter(r => sc(r, c) >= BASE).length;
  const overall = r => mean(catNames.map(c => sc(r, c)));
  const gIndex = name => D.groups.findIndex(g => g.name === name);

  // {tokens} in the text become live numbers; r is a repo, or null for the Adlin's Investments card
  const fill = (text, r) => text.replace(/\{(\w+)(?::([^}]+))?\}/g, (m, k, a) => {
    if (k === "n") return n;
    if (k === "n6") return catNames.filter(c => sc(r, c) >= 6).length;
    if (k === "bestrank") return nth(Math.min(...catNames.map(myRank)));
    if (k === "rank") return nth(myRank(a));
    if (k === "score") return sc(r, a);
    if ((k === "place" || k === "avg") && gIndex(a) >= 0) {
      const gi = gIndex(a);
      return k === "avg" ? gAvg(r, D.groups[gi]).toFixed(1) : nth(r ? gPlace(r, gi) : myGPlace(gi));
    }
    console.warn("Unknown token", m); return m;
  });

  const EXP = '<button type="button" class="expand" aria-label="Expand all groups">Expand all</button>';
  const urlText = u => u.replace(/^https?:\/\//, "");
  const key = '<span class="key" aria-label="Key: 0 to 4 terrible, 5 even, 6 to 10 better"><span><b>0&ndash;4</b> Terrible</span><span><b>5</b> Even</span><span><b>6&ndash;10</b> Better</span></span>';
  const row = (c, def, value, width, cls = "") =>
    `<li><span class="lbl">${esc(c)}<small>${esc(def)}</small></span><span class="track"><i style="width:${width}%"></i></span><span class="val num ${cls}">${value}</span></li>`;

  const groupsHtml = (r) => D.groups.map((g, gi) => {
    const label = r ? gAvg(r, g).toFixed(1) + "/10" : nth(myGPlace(gi));
    const rows = g.cats.map(([c, def]) => r ? row(c, def, sc(r, c), sc(r, c) * 10) : row(c, def, "#" + myRank(c), (n - myRank(c) + 1) / n * 100)).join("");
    return `<details class="grp"><summary>${esc(g.name)} <span>${label}</span></summary><ul class="cbars${r ? "" : " rank"}">${rows}</ul></details>`;
  }).join("");

  const repoSection = r => {
    return `<section class="card glow page" data-page="${r.id}" hidden>
    <h2><a class="ttl" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(urlText(r.url))} &#8599;</a></h2>
    <p class="desc">${esc(r.desc)}</p>
    <h3 class="sub">Summary</h3>
    <p class="sum">${esc(fill(r.summary, r))}</p>
    <h3 class="sub">Comparison ${EXP} ${key}</h3>
    <div class="groups">${groupsHtml(r)}</div>
  </section>`;
  };

  const boardSection = () => {
    const board = [...repos.map(r => [r.nav, overall(r), false]), [D.me.name, BASE, true]].sort((a, b) => b[1] - a[1]);
    const scoresAll = board.map(b => b[1]);
    const boardHtml = board.map(([name, v, me]) =>
      `<li class="${me ? "me" : ""}"><span class="pl num">${nth(place(v, scoresAll))}</span><span class="nm">${esc(name)}</span><span class="track"><i style="width:${v * 10}%"></i></span><span class="val num">${v.toFixed(1)}</span></li>`).join("");
    return `<section class="card glow page" data-page="leaderboard" hidden>
    <h2>Leaderboard</h2>
    <ol class="board">${boardHtml}</ol>
  </section>`;
  };

  const meSection = () => {
    return `<section class="card glow page" data-page="tf" hidden>
    <h2>${esc(D.me.name)}</h2>
    <p class="desc">${esc(D.me.desc)}</p>
    <h3 class="sub">What it lacks</h3>
    <ul class="lack">${D.me.lacks.map(t => `<li>${esc(fill(t, null))}</li>`).join("")}</ul>
    <h3 class="sub">Ranking <span>out of ${n}</span> ${EXP}</h3>
    <div class="groups">${groupsHtml(null)}</div>
  </section>`;
  };

  $("cmpPages").innerHTML = repos.map(repoSection).join("") + meSection() + boardSection();
  const TROPHY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';
  const CLIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>';
  $("cmpNav").innerHTML = `<button data-page="tf">Investments</button>` + repos.map(r => `<button data-page="${r.id}">${esc(r.nav)}</button>`).join("") +
    `<button class="lb" data-page="leaderboard" aria-label="Leaderboard">${TROPHY}<span>Leaderboard</span></button><span class="sp"></span>` +
    `<button class="lb" id="copyPrompt" type="button" title="Copy the agent prompt, then paste it into Claude" aria-label="Copy agent prompt">${CLIP}<span id="copyLabel">Agent prompt</span></button>`;

  // "Agent prompt": copies an instruction to paste into Claude to re-check the competitors and refresh the scores and text.
  const PROMPT = "Refresh the Competitors scores. Open competitors-data.js in the adlin5324/tradingfirm-app repo. For each competitor listed, check what has changed in its GitHub repo since the last review (new releases, brokers, data sources, tests, features, last commit). Update any scores that moved (0 to 10, where 5 means the same as Adlin's Investments), keep the 30 categories and their order, update each description and summary so it matches the scores, and keep private details such as the broker's name out. Then raise the ?v= numbers in index.html, test the Competitors tab in a browser, and commit and push to main.";
  const cp = $("copyPrompt"), cl = $("copyLabel");
  const flash = t => { cl.textContent = t; setTimeout(() => { cl.textContent = "Agent prompt"; }, 2000); };
  cp.onclick = async () => {
    try { await navigator.clipboard.writeText(PROMPT); flash("Copied"); }
    catch { const t = document.createElement("textarea"); t.value = PROMPT; t.style.cssText = "position:fixed;opacity:0"; document.body.append(t); t.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {} t.remove(); flash(ok ? "Copied" : "Copy failed"); }
  };

  const showPage = id => {
    document.querySelectorAll("#cmpNav button[data-page]").forEach(b => b.classList.toggle("on", b.dataset.page === id));
    const nav = $("cmpNav"), on = nav.querySelector("button.on");
    if (on) on.scrollIntoView({ inline: "center", block: "nearest" });
    document.querySelectorAll("#cmp section.page").forEach(s => { s.hidden = s.dataset.page !== id; });
  };
  document.querySelectorAll("#cmpNav button[data-page]").forEach(b => b.onclick = () => showPage(b.dataset.page));
  showPage("tf");

  // expand or collapse every group in a card; the label follows what the groups are doing
  const syncExpand = s => {
    const ds = [...s.querySelectorAll("details.grp")], all = ds.every(d => d.open);
    s.querySelectorAll("button.expand").forEach(b => { b.textContent = all ? "Collapse all" : "Expand all"; b.setAttribute("aria-label", all ? "Collapse all groups" : "Expand all groups"); });
  };
  document.querySelectorAll("button.expand").forEach(b => b.onclick = () => {
    const s = b.closest("section"), ds = [...s.querySelectorAll("details.grp")], all = ds.every(d => d.open);
    ds.forEach(d => { d.open = !all; });
    syncExpand(s);
  });
  document.addEventListener("toggle", e => { const s = e.target.closest && e.target.closest("section.page"); if (s) syncExpand(s); }, true);

  // cards fade in as they scroll into view
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("in")), { threshold: .05 });
  document.querySelectorAll(".card").forEach(c => {
    io.observe(c);
    c.addEventListener("pointermove", e => {
      const b = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - b.left + "px"); c.style.setProperty("--my", e.clientY - b.top + "px");
    });
  });
})();
