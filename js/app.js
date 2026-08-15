/* ==========================================================================
   Outlands Boating — calculator logic
   ========================================================================== */

function pct(n) {
  if (n === 0) return "0%";
  const s = (Math.round(n * 100) / 100).toString();
  return (n > 0 ? "+" : "") + s + "%";
}

function fmtHP(n) {
  return Math.round(n).toLocaleString();
}

function byId(arr, id) {
  return arr.find(x => x.id === id) || null;
}

function emptyStatTotals() {
  const t = {};
  ALL_STAT_KEYS.forEach(k => (t[k] = 0));
  return t;
}

function addStats(totals, stats) {
  if (!stats) return;
  Object.keys(stats).forEach(k => {
    if (totals[k] === undefined) totals[k] = 0;
    totals[k] += stats[k];
  });
}

/* ---------------- Builder state factory ---------------- */

function createBuilderState() {
  return {
    shipId: SHIPS[0].id,
    outfittingId: "",
    specialtyId: "",
    supplyId: "",
    crew: [] // { professionId, rankId, pips: { statKey: n, ... } }
  };
}

function computeTotals(state) {
  const ship = byId(SHIPS, state.shipId);
  const totals = emptyStatTotals();

  const outfitting = state.outfittingId ? byId(OUTFITTINGS, state.outfittingId) : null;
  const specialty = state.specialtyId ? byId(SPECIALTY_ITEMS, state.specialtyId) : null;
  const supply = state.supplyId ? byId(CREW_SUPPLIES, state.supplyId) : null;

  addStats(totals, outfitting && outfitting.stats);
  addStats(totals, specialty && specialty.stats);
  addStats(totals, supply && supply.stats);

  state.crew.forEach(member => {
    const prof = byId(PROFESSIONS, member.professionId);
    if (!prof) return;
    prof.bonuses.forEach(b => {
      const pips = (member.pips && member.pips[b.stat]) || 0;
      if (pips > 0) {
        totals[b.stat] = (totals[b.stat] || 0) + pips * b.perPip;
      }
    });
  });

  const finalHull = ship.hull * (1 + totals.hull / 100);
  const finalSail = ship.sail * (1 + totals.sail / 100);
  const finalGun = ship.gun * (1 + totals.gun / 100);
  const rawSpeed = ship.speed * (1 + totals.spd / 100);
  const finalSpeed = Math.min(rawSpeed, 6.5);
  const speedCapped = rawSpeed > 6.5;
  const finalWake = Math.max(ship.wake - totals.wake, 25);

  return { ship, totals, finalHull, finalSail, finalGun, finalSpeed, speedCapped, finalWake, rawSpeed };
}

/* ---------------- Rendering ---------------- */

function optionsHTML(list, selectedId, placeholder) {
  let html = "";
  if (placeholder) html += `<option value="">${placeholder}</option>`;
  list.forEach(item => {
    html += `<option value="${item.id}" ${item.id === selectedId ? "selected" : ""}>${item.name}</option>`;
  });
  return html;
}

function professionOptionsHTML(selectedId) {
  return optionsHTML(PROFESSIONS, selectedId, "Choose a profession…");
}

function rankOptionsHTML(selectedId) {
  let html = `<option value="">Choose a rank…</option>`;
  CREW_RANKS.forEach(r => {
    html += `<option value="${r.id}" ${String(r.id) === String(selectedId) ? "selected" : ""}>${r.name} (${r.pipCap} pip${r.pipCap > 1 ? "s" : ""})</option>`;
  });
  return html;
}

function renderCrewSlot(member, index, maxCrew) {
  const prof = member.professionId ? byId(PROFESSIONS, member.professionId) : null;
  const rank = member.rankId ? byId(CREW_RANKS, Number(member.rankId)) : null;
  const pipCap = rank ? rank.pipCap : 0;

  let pipsHTML = "";
  if (prof) {
    pipsHTML = `<div class="pip-grid">`;
    prof.bonuses.forEach(b => {
      const meta = STAT_META[b.stat];
      const current = (member.pips && member.pips[b.stat]) || 0;
      pipsHTML += `
        <label class="pip-field">
          <span>${meta.label}</span>
          <input type="number" min="0" max="${pipCap || 0}" value="${current}"
            data-role="pip" data-stat="${b.stat}" data-index="${index}" ${pipCap ? "" : "disabled"} />
          <em>per pip: ${b.perPip}${meta.unit === "flat" ? "" : "%"}</em>
        </label>`;
    });
    pipsHTML += `</div>`;
    if (pipCap) {
      pipsHTML += `<p class="pip-note">Allocate up to ${pipCap} pip${pipCap > 1 ? "s" : ""} total across this crewmember's bonuses.</p>`;
    }
  }

  return `
    <div class="crew-slot" data-index="${index}">
      <div class="crew-slot__head">
        <span class="crew-slot__num">Crew ${index + 1}</span>
        <button type="button" class="btn-remove" data-role="remove-crew" data-index="${index}" aria-label="Remove crewmember">&times;</button>
      </div>
      <div class="crew-slot__row">
        <label>Profession
          <select data-role="crew-profession" data-index="${index}">${professionOptionsHTML(member.professionId)}</select>
        </label>
        <label>Rank
          <select data-role="crew-rank" data-index="${index}">${rankOptionsHTML(member.rankId)}</select>
        </label>
      </div>
      ${pipsHTML}
    </div>`;
}

function renderStatLedger(result) {
  const groups = {
    hull: "Hull &amp; Structure",
    sailing: "Sailing",
    combat: "Combat",
    abilities: "Ability Cooldowns",
    repair: "Repair",
    crew: "Crew",
    economy: "Economy"
  };

  let html = "";

  html += `<div class="ledger-group">
    <h4>Hull &amp; Structure</h4>
    <div class="ledger-row"><span class="ledger-label">Hull HP<i></i></span><span class="ledger-value">${fmtHP(result.finalHull)}</span></div>
    <div class="ledger-row"><span class="ledger-label">Sail HP<i></i></span><span class="ledger-value">${fmtHP(result.finalSail)}</span></div>
    <div class="ledger-row"><span class="ledger-label">Gun HP<i></i></span><span class="ledger-value">${fmtHP(result.finalGun)}</span></div>
  </div>`;

  html += `<div class="ledger-group">
    <h4>Sailing</h4>
    <div class="ledger-row"><span class="ledger-label">Forward Speed<i></i></span><span class="ledger-value">${result.finalSpeed.toFixed(2)} t/s${result.speedCapped ? " *" : ""}</span></div>
    <div class="ledger-row"><span class="ledger-label">Wake (search visibility)<i></i></span><span class="ledger-value">${result.finalWake.toFixed(1)}%</span></div>
  </div>`;

  ["combat", "abilities", "repair", "crew", "economy"].forEach(groupKey => {
    const keys = ALL_STAT_KEYS.filter(k => STAT_META[k].group === groupKey && k !== "wake");
    const anyNonZero = keys.some(k => result.totals[k]);
    html += `<div class="ledger-group">
      <h4>${groups[groupKey]}</h4>`;
    keys.forEach(k => {
      const meta = STAT_META[k];
      const val = result.totals[k] || 0;
      const display = meta.unit === "flat" ? (val > 0 ? "+" : "") + (Math.round(val * 10) / 10) : pct(val);
      html += `<div class="ledger-row${val === 0 ? " ledger-row--zero" : ""}"><span class="ledger-label">${meta.label}<i></i></span><span class="ledger-value">${display}</span></div>`;
    });
    html += `</div>`;
    if (!anyNonZero) { /* still show group for consistency */ }
  });

  if (result.speedCapped) {
    html += `<p class="ledger-footnote">* Forward speed is capped at 6.5 tiles/sec baseline; ability bonuses can still push past the cap temporarily.</p>`;
  }

  return html;
}

/* ---------------- Builder controller ---------------- */

function initBuilder(root, opts) {
  opts = opts || {};
  const state = createBuilderState();
  const shipSelect = root.querySelector('[data-role="ship-select"]');
  const outfittingSelect = root.querySelector('[data-role="outfitting-select"]');
  const specialtySelect = root.querySelector('[data-role="specialty-select"]');
  const supplySelect = root.querySelector('[data-role="supply-select"]');
  const crewList = root.querySelector('[data-role="crew-list"]');
  const addCrewBtn = root.querySelector('[data-role="add-crew"]');
  const crewCapNote = root.querySelector('[data-role="crew-cap-note"]');
  const shipMetaEl = root.querySelector('[data-role="ship-meta"]');
  const ledgerEl = root.querySelector('[data-role="ledger"]');

  shipSelect.innerHTML = optionsHTML(SHIPS, state.shipId);
  outfittingSelect.innerHTML = optionsHTML(OUTFITTINGS, state.outfittingId, "None");
  specialtySelect.innerHTML = optionsHTML(SPECIALTY_ITEMS, state.specialtyId, "None");
  supplySelect.innerHTML = optionsHTML(CREW_SUPPLIES, state.supplyId, "None");

  function currentShip() {
    return byId(SHIPS, state.shipId);
  }

  function renderCrew() {
    const ship = currentShip();
    crewList.innerHTML = state.crew.map((m, i) => renderCrewSlot(m, i, ship.maxCrew)).join("");
    addCrewBtn.disabled = state.crew.length >= ship.maxCrew;
    crewCapNote.textContent = `${state.crew.length} / ${ship.maxCrew} crew slots filled`;
  }

  function renderShipMeta() {
    const ship = currentShip();
    shipMetaEl.innerHTML = `
      <span>Base Hull ${fmtHP(ship.hull)}</span>
      <span>Base Sail ${fmtHP(ship.sail)}</span>
      <span>Base Guns ${fmtHP(ship.gun)}</span>
      <span>${ship.cannons} cannons/side</span>
      <span>Max crew ${ship.maxCrew}</span>
      <span>Base speed ${ship.speed.toFixed(2)} t/s</span>
    `;
  }

  function recalc() {
    const result = computeTotals(state);
    ledgerEl.innerHTML = renderStatLedger(result);
    if (opts.onChange) opts.onChange(result);
    return result;
  }

  shipSelect.addEventListener("change", () => {
    state.shipId = shipSelect.value;
    const ship = currentShip();
    if (state.crew.length > ship.maxCrew) state.crew = state.crew.slice(0, ship.maxCrew);
    renderShipMeta();
    renderCrew();
    recalc();
  });

  outfittingSelect.addEventListener("change", () => { state.outfittingId = outfittingSelect.value; recalc(); });
  specialtySelect.addEventListener("change", () => { state.specialtyId = specialtySelect.value; recalc(); });
  supplySelect.addEventListener("change", () => { state.supplyId = supplySelect.value; recalc(); });

  addCrewBtn.addEventListener("click", () => {
    const ship = currentShip();
    if (state.crew.length >= ship.maxCrew) return;
    state.crew.push({ professionId: "", rankId: "", pips: {} });
    renderCrew();
    recalc();
  });

  crewList.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-role="remove-crew"]');
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    state.crew.splice(idx, 1);
    renderCrew();
    recalc();
  });

  crewList.addEventListener("change", (e) => {
    const el = e.target;
    const idx = Number(el.dataset.index);
    if (el.dataset.role === "crew-profession") {
      state.crew[idx].professionId = el.value;
      state.crew[idx].rankId = state.crew[idx].rankId || "";
      state.crew[idx].pips = {};
      renderCrew();
      recalc();
    } else if (el.dataset.role === "crew-rank") {
      state.crew[idx].rankId = el.value;
      const rank = byId(CREW_RANKS, Number(el.value));
      const prof = byId(PROFESSIONS, state.crew[idx].professionId);
      if (prof && rank) {
        prof.bonuses.forEach(b => {
          const cur = state.crew[idx].pips[b.stat] || 0;
          if (cur > rank.pipCap) state.crew[idx].pips[b.stat] = rank.pipCap;
        });
      }
      renderCrew();
      recalc();
    }
  });

  crewList.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.role !== "pip") return;
    const idx = Number(el.dataset.index);
    const stat = el.dataset.stat;
    let val = parseInt(el.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    const rank = byId(CREW_RANKS, Number(state.crew[idx].rankId));
    const cap = rank ? rank.pipCap : 0;
    if (val > cap) val = cap;
    el.value = val;
    if (!state.crew[idx].pips) state.crew[idx].pips = {};
    state.crew[idx].pips[stat] = val;
    recalc();
  });

  renderShipMeta();
  renderCrew();
  const initial = recalc();

  return { state, recalc, getResult: () => computeTotals(state) };
}

/* ---------------- Compare mode diff ---------------- */

function renderCompareDiff(resultA, resultB) {
  const rows = [
    ["Hull HP", resultA.finalHull, resultB.finalHull, "hp"],
    ["Sail HP", resultA.finalSail, resultB.finalSail, "hp"],
    ["Gun HP", resultA.finalGun, resultB.finalGun, "hp"],
    ["Forward Speed", resultA.finalSpeed, resultB.finalSpeed, "speed"],
    ["Wake", resultA.finalWake, resultB.finalWake, "wake"]
  ];
  ALL_STAT_KEYS.forEach(k => {
    if (k === "wake") return;
    const meta = STAT_META[k];
    rows.push([meta.label, resultA.totals[k] || 0, resultB.totals[k] || 0, meta.unit]);
  });

  let html = `<div class="diff-table">`;
  rows.forEach(([label, a, b, unit]) => {
    const diff = b - a;
    let diffLabel = "";
    let diffClass = "diff-equal";
    if (Math.abs(diff) > 0.001) {
      diffClass = diff > 0 ? "diff-up" : "diff-down";
      const arrow = diff > 0 ? "▲" : "▼";
      const d = Math.abs(Math.round(diff * 100) / 100);
      diffLabel = `${arrow} ${d}${unit === "pct" ? "%" : unit === "hp" ? "" : unit === "speed" ? " t/s" : unit === "wake" ? "%" : ""}`;
    } else {
      diffLabel = "—";
    }
    const fmt = (v) => {
      if (unit === "hp") return fmtHP(v);
      if (unit === "speed") return v.toFixed(2) + " t/s";
      if (unit === "wake") return v.toFixed(1) + "%";
      if (unit === "flat") return (Math.round(v * 10) / 10);
      return pct(v);
    };
    html += `
      <div class="diff-row">
        <span class="diff-label">${label}</span>
        <span class="diff-a">${fmt(a)}</span>
        <span class="diff-delta ${diffClass}">${diffLabel}</span>
        <span class="diff-b">${fmt(b)}</span>
      </div>`;
  });
  html += `</div>`;
  return html;
}

/* ---------------- App bootstrap ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  const singleRoot = document.querySelector("#builder-single");
  const modeSingle = document.querySelector("#mode-single");
  const modeCompare = document.querySelector("#mode-compare");
  const singleWrap = document.querySelector("#single-wrap");
  const compareWrap = document.querySelector("#compare-wrap");
  const rootA = document.querySelector("#builder-a");
  const rootB = document.querySelector("#builder-b");
  const diffOutput = document.querySelector("#diff-output");

  let ctrlSingle = initBuilder(singleRoot);

  let ctrlA, ctrlB;
  function refreshDiff() {
    if (!ctrlA || !ctrlB) return;
    diffOutput.innerHTML = renderCompareDiff(ctrlA.getResult(), ctrlB.getResult());
  }

  function setMode(compareOn) {
    singleWrap.hidden = compareOn;
    compareWrap.hidden = !compareOn;
    if (compareOn && !ctrlA) {
      ctrlA = initBuilder(rootA, { onChange: refreshDiff });
      ctrlB = initBuilder(rootB, { onChange: refreshDiff });
      refreshDiff();
    }
  }

  modeSingle.addEventListener("change", () => { if (modeSingle.checked) setMode(false); });
  modeCompare.addEventListener("change", () => { if (modeCompare.checked) setMode(true); });
});
