/* ==========================================================================
   Outlands Boating — calculator logic

   A ship's base stats are rolled per-crafted-ship (RNG around a type
   average), not fixed by ship type. The player enters their own ship's
   actual base stats; upgrades and crew then apply on top of those.
   ========================================================================== */

function fmt2(n) { return (Math.round(n * 100) / 100).toString(); }
function fmt1(n) { return (Math.round(n * 10) / 10).toString(); }
function fmtInt(n) { return Math.round(n).toLocaleString(); }

function fmtTime(seconds) {
  seconds = Math.max(0, seconds);
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function byId(arr, id) {
  return arr.find(x => x.id === id) || null;
}

function emptyBonusTotals() {
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

/* ---------------- Builder state ---------------- */

function createBuilderState() {
  const ship = SHIPS[0];
  return {
    shipId: ship.id,
    base: getShipDefaults(ship),
    outfittingId: "",
    specialtyId: "",
    supplyId: "",
    crew: [] // { professionId, rankId, pips: { statKey: n, ... } }
  };
}

function computeBonusTotals(state) {
  const totals = emptyBonusTotals();
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
      if (pips > 0) totals[b.stat] = (totals[b.stat] || 0) + pips * b.perPip;
    });
  });

  return totals;
}

function applyBonus(baseValue, bonusPct, mode) {
  switch (mode) {
    case "mult-pct": return baseValue * (1 + bonusPct / 100);
    case "add-pct": return baseValue + bonusPct;
    case "add-flat": return baseValue + bonusPct;
    case "reduce-time": return Math.max(baseValue * (1 - bonusPct / 100), 0);
    case "reduce-time-div": return baseValue / (1 + bonusPct / 100);
    case "reduce-pct": return Math.max(baseValue - bonusPct, 25);
    default: return baseValue;
  }
}

function computeFinals(state) {
  const ship = byId(SHIPS, state.shipId);
  const bonusTotals = computeBonusTotals(state);
  const finals = {};
  BASE_STAT_GROUPS.forEach(g => g.stats.forEach(s => {
    const baseVal = Number(state.base[s.key]) || 0;
    const bonus = bonusTotals[s.bonusKey] || 0;
    finals[s.key] = applyBonus(baseVal, bonus, s.bonusMode);
  }));
  return { ship, bonusTotals, finals };
}

function fmtByUnit(unit, value) {
  if (unit === "flat") return fmtInt(value);
  if (unit === "speed") return fmt2(value) + " t/s";
  if (unit === "time") return fmtTime(value);
  return fmt1(value) + "%"; // pct
}

/* ---------------- Rendering: static option lists ---------------- */

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

function renderCrewSlot(member, index) {
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

/* ---------------- Rendering: base-stats table (stable DOM) ---------------- */
/* Rendered fresh only on ship change; inputs otherwise persist so typing
   never loses focus. Final-value cells are updated in place on recalc. */

function renderBaseStatsTable(ledgerEl) {
  let html = `<div class="stat-table-head">
    <span>Stat</span><span>Your Base</span><span>Final</span>
  </div>`;
  BASE_STAT_GROUPS.forEach(g => {
    html += `<div class="ledger-group"><h4>${g.label}</h4>`;
    g.stats.forEach(s => {
      html += `
        <div class="stat-row">
          <span class="ledger-label">${s.label}</span>
          <input type="number" step="any" class="stat-input" data-role="base-stat" data-stat="${s.key}" />
          <span class="ledger-value" data-role="final-stat" data-stat="${s.key}">—</span>
        </div>`;
    });
    html += `</div>`;
  });
  ledgerEl.innerHTML = html;
}

function fillBaseStatsFromState(ledgerEl, state) {
  BASE_STAT_GROUPS.forEach(g => g.stats.forEach(s => {
    const input = ledgerEl.querySelector(`[data-role="base-stat"][data-stat="${s.key}"]`);
    if (input) input.value = state.base[s.key];
  }));
}

function updateFinalValues(ledgerEl, computed) {
  BASE_STAT_GROUPS.forEach(g => g.stats.forEach(s => {
    const el = ledgerEl.querySelector(`[data-role="final-stat"][data-stat="${s.key}"]`);
    if (el) el.textContent = fmtByUnit(s.unit, computed.finals[s.key]);
  }));
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

  function currentShip() { return byId(SHIPS, state.shipId); }

  function renderCrew() {
    const ship = currentShip();
    crewList.innerHTML = state.crew.map((m, i) => renderCrewSlot(m, i)).join("");
    addCrewBtn.disabled = state.crew.length >= ship.maxCrew;
    crewCapNote.textContent = `${state.crew.length} / ${ship.maxCrew} crew slots filled`;
  }

  function renderShipMeta() {
    const ship = currentShip();
    shipMetaEl.innerHTML = `
      <span>Max crew ${ship.maxCrew}</span>
      <span>${ship.cannons} cannons/side</span>
      <span>Cannon range ${ship.cannonRange}</span>
      <span>Registration ${fmtInt(ship.registrationCost)}</span>
    `;
  }

  function recalc() {
    const computed = computeFinals(state);
    updateFinalValues(ledgerEl, computed);
    if (opts.onChange) opts.onChange(computed);
    return computed;
  }

  function resetBaseStatsForNewShip() {
    const ship = currentShip();
    state.base = getShipDefaults(ship);
    fillBaseStatsFromState(ledgerEl, state);
  }

  shipSelect.addEventListener("change", () => {
    state.shipId = shipSelect.value;
    const ship = currentShip();
    if (state.crew.length > ship.maxCrew) state.crew = state.crew.slice(0, ship.maxCrew);
    renderShipMeta();
    renderCrew();
    resetBaseStatsForNewShip();
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

  ledgerEl.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.role !== "base-stat") return;
    const val = parseFloat(el.value);
    state.base[el.dataset.stat] = isNaN(val) ? 0 : val;
    recalc();
  });

  renderShipMeta();
  renderCrew();
  renderBaseStatsTable(ledgerEl);
  fillBaseStatsFromState(ledgerEl, state);
  recalc();

  return { state, recalc, getResult: () => computeFinals(state) };
}

/* ---------------- Compare mode diff ---------------- */

function renderCompareDiff(computedA, computedB) {
  let html = `<div class="diff-table">
    <div class="diff-row diff-row--head"><span class="diff-label">Stat</span><span class="diff-a">Build A</span><span class="diff-delta"></span><span class="diff-b">Build B</span></div>`;
  BASE_STAT_GROUPS.forEach(g => {
    g.stats.forEach(s => {
      const a = computedA.finals[s.key];
      const b = computedB.finals[s.key];
      const lowerIsBetter = (s.unit === "time") || s.key === "wake";
      const diff = b - a;
      let diffClass = "diff-equal", diffLabel = "—";
      if (Math.abs(diff) > 0.005) {
        const improved = lowerIsBetter ? diff < 0 : diff > 0;
        diffClass = improved ? "diff-up" : "diff-down";
        const arrow = diff > 0 ? "▲" : "▼";
        diffLabel = `${arrow} ${fmtByUnit(s.unit === "time" ? "flat" : s.unit, Math.abs(diff))}`;
      }
      html += `
        <div class="diff-row">
          <span class="diff-label">${s.label}</span>
          <span class="diff-a">${fmtByUnit(s.unit, a)}</span>
          <span class="diff-delta ${diffClass}">${diffLabel}</span>
          <span class="diff-b">${fmtByUnit(s.unit, b)}</span>
        </div>`;
    });
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

  initBuilder(singleRoot);

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
