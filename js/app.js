/* ==========================================================================
   Outlands Boating — calculator logic

   Model: each ship type has an internal base value per stat (not shown to
   the player). The player enters only the % they rolled on their ship
   (shown in-game as "Base vs Average"), plus whichever Outfitting,
   Specialty Item, and Crew Supply they've fitted. Final = base stat with
   the roll % and every upgrade % stacked additively on top of it — except
   for stats with no real base (several Crew/Economy bonuses roll from 0),
   where final is just the roll % plus upgrade % added directly, no base
   multiplication involved.
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

/* ---------------- Saved builds (localStorage) ---------------- */

const TEMPLATE_STORAGE_KEY = "outlandsBoating.savedBuilds";

function loadAllTemplates() {
  try { return JSON.parse(localStorage.getItem(TEMPLATE_STORAGE_KEY)) || {}; }
  catch (e) { return {}; }
}

function saveAllTemplates(templates) {
  try { localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates)); return true; }
  catch (e) { return false; }
}

function serializeBuild(state) {
  return {
    shipId: state.shipId,
    roll: Object.assign({}, state.roll),
    outfittingId: state.outfittingId,
    specialtyId: state.specialtyId,
    supplyId: state.supplyId,
    crew: state.crew.map(m => ({ professionId: m.professionId, rankId: m.rankId, pips: Object.assign({}, m.pips || {}) })),
    savedAt: new Date().toISOString()
  };
}

function applyTemplateToState(state, tpl) {
  state.shipId = (tpl.shipId && byId(SHIPS, tpl.shipId)) ? tpl.shipId : SHIPS[0].id;
  state.roll = Object.assign({}, tpl.roll || {});
  state.outfittingId = tpl.outfittingId || "";
  state.specialtyId = tpl.specialtyId || "";
  state.supplyId = tpl.supplyId || "";
  state.crew = (tpl.crew || []).map(m => ({ professionId: m.professionId, rankId: m.rankId, pips: Object.assign({}, m.pips || {}) }));
}

function sortedByName(arr) {
  return arr.slice().sort((a, b) => a.name.localeCompare(b.name));
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
  return {
    shipId: SHIPS[0].id,
    name: "",
    roll: {},         // stat key -> player-entered roll % (or flat, for fishing)
    outfittingId: "",
    specialtyId: "",
    supplyId: "",
    crew: []
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

function computeFinals(state) {
  const ship = byId(SHIPS, state.shipId);
  const shipAvg = getShipDefaults(ship);
  const bonusTotals = computeBonusTotals(state);
  const finals = {};

  BASE_STAT_GROUPS.forEach(g => g.stats.forEach(s => {
    const rollRaw = Number(state.roll[s.key]) || 0;
    const roll = s.negativeOnly ? -Math.abs(rollRaw) : rollRaw;
    let upgrade = bonusTotals[s.bonusKey] || 0;
    if (s.negativeOnly) upgrade = -Math.abs(upgrade); // upgrade data is stored positive ("beneficial"); these stats always reduce

    if (s.mode === "add") {
      finals[s.key] = roll + upgrade;
    } else {
      const base = shipAvg[s.key];
      finals[s.key] = base * (1 + (roll + upgrade) / 100);
      if (s.key === "wake") finals[s.key] = Math.max(finals[s.key], 25);
      if (s.unit === "time") finals[s.key] = Math.max(finals[s.key], 0);
    }
  }));

  return { ship, bonusTotals, finals };
}

function fmtByUnit(unit, value) {
  if (unit === "flat") return (value > 0 ? "+" : "") + fmt1(value);
  if (unit === "speed") return fmt2(value) + " t/s";
  if (unit === "time") return fmtTime(value);
  return fmt1(value) + "%"; // pct
}

/* ---------------- Rendering: static option lists ---------------- */

function optionsHTML(list, selectedId, placeholder, alphabetize) {
  let html = "";
  if (placeholder) html += `<option value="">${placeholder}</option>`;
  const items = alphabetize ? sortedByName(list) : list;
  items.forEach(item => {
    html += `<option value="${item.id}" ${item.id === selectedId ? "selected" : ""}>${item.name}</option>`;
  });
  return html;
}

function professionOptionsHTML(selectedId) {
  let html = `<option value="">Choose a profession…</option>`;
  sortedByName(PROFESSIONS).forEach(item => {
    html += `<option value="${item.id}" ${item.id === selectedId ? "selected" : ""}>${item.name}</option>`;
  });
  return html;
}

function rankOptionsHTML(selectedId) {
  let html = `<option value="">Choose a rank…</option>`;
  CREW_RANKS.forEach(r => { // rank order is deliberately Novice -> Legendary, not alphabetical
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
    <span>Stat</span><span>Roll %</span><span>Final</span>
  </div>`;
  BASE_STAT_GROUPS.forEach(g => {
    html += `<div class="ledger-group"><h4>${g.label}</h4>`;
    g.stats.forEach(s => {
      html += `
        <div class="stat-row">
          <span class="ledger-label">${s.label}</span>
          <span class="stat-roll-cell ${s.negativeOnly ? "stat-roll-cell--neg" : ""}">
            ${s.negativeOnly ? `<span class="stat-sign">−</span>` : ""}
            <input type="number" step="any" min="0" class="stat-input" placeholder="0" data-role="roll-stat" data-stat="${s.key}" />
          </span>
          <span class="ledger-value final-box" data-role="final-stat" data-stat="${s.key}">—</span>
        </div>`;
    });
    html += `</div>`;
  });
  ledgerEl.innerHTML = html;
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
  const ledgerTableEl = root.querySelector('[data-role="ledger-table"]');
  const templateSelect = root.querySelector('[data-role="template-select"]');
  const newBuildBtn = root.querySelector('[data-role="new-build"]');
  const deleteTemplateBtn = root.querySelector('[data-role="delete-template"]');
  const boatNameInput = root.querySelector('[data-role="boat-name"]');
  const shipBadgeEl = root.querySelector('[data-role="ship-badge"]');
  const saveTemplateBtn = root.querySelector('[data-role="save-template"]');
  const statusMsgEl = root.querySelector('[data-role="status-msg"]');

  shipSelect.innerHTML = optionsHTML(SHIPS, state.shipId, null, false); // ship type stays smallest -> largest
  outfittingSelect.innerHTML = optionsHTML(OUTFITTINGS, state.outfittingId, "None", true);
  specialtySelect.innerHTML = optionsHTML(SPECIALTY_ITEMS, state.specialtyId, "None", true);
  supplySelect.innerHTML = optionsHTML(CREW_SUPPLIES, state.supplyId, "None", true);
  renderBaseStatsTable(ledgerTableEl);

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
    shipBadgeEl.textContent = ship.name;
  }

  function recalc() {
    const computed = computeFinals(state);
    updateFinalValues(ledgerTableEl, computed);
    if (opts.onChange) opts.onChange(computed);
    return computed;
  }

  function showStatus(msg) {
    statusMsgEl.textContent = msg;
    statusMsgEl.classList.add("show");
    setTimeout(() => statusMsgEl.classList.remove("show"), 2200);
  }

  function refreshTemplateList(selectName) {
    const templates = loadAllTemplates();
    const names = Object.keys(templates).sort((a, b) => a.localeCompare(b));
    templateSelect.innerHTML = '<option value="">Load a saved build…</option>' +
      names.map(n => `<option value="${n}" ${n === selectName ? "selected" : ""}>${n} (${byId(SHIPS, templates[n].shipId) ? byId(SHIPS, templates[n].shipId).name : "?"})</option>`).join("");
    deleteTemplateBtn.disabled = !templateSelect.value;
  }

  function syncControlsToState() {
    shipSelect.value = state.shipId;
    outfittingSelect.value = state.outfittingId;
    specialtySelect.value = state.specialtyId;
    supplySelect.value = state.supplyId;
    boatNameInput.value = state.name;
    renderShipMeta();
    renderCrew();
    BASE_STAT_GROUPS.forEach(g => g.stats.forEach(s => {
      const input = ledgerTableEl.querySelector(`[data-role="roll-stat"][data-stat="${s.key}"]`);
      if (input) input.value = (state.roll[s.key] !== undefined && state.roll[s.key] !== 0) ? Math.abs(state.roll[s.key]) : "";
    }));
    recalc();
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

  ledgerTableEl.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.role !== "roll-stat") return;
    const val = parseFloat(el.value);
    state.roll[el.dataset.stat] = isNaN(val) ? 0 : val;
    recalc();
  });

  boatNameInput.addEventListener("input", () => { state.name = boatNameInput.value; });

  saveTemplateBtn.addEventListener("click", () => {
    const name = boatNameInput.value.trim() || "Untitled Build";
    boatNameInput.value = name;
    state.name = name;
    const templates = loadAllTemplates();
    templates[name] = serializeBuild(state);
    const ok = saveAllTemplates(templates);
    refreshTemplateList(name);
    showStatus(ok ? `Saved "${name}" to this browser.` : "Couldn't save — your browser may be blocking local storage.");
  });

  templateSelect.addEventListener("change", () => {
    const name = templateSelect.value;
    deleteTemplateBtn.disabled = !name;
    if (!name) return;
    const templates = loadAllTemplates();
    const tpl = templates[name];
    if (!tpl) return;
    applyTemplateToState(state, tpl);
    state.name = name;
    syncControlsToState();
    showStatus(`Loaded "${name}".`);
  });

  deleteTemplateBtn.addEventListener("click", () => {
    const name = templateSelect.value;
    if (!name) return;
    const templates = loadAllTemplates();
    delete templates[name];
    saveAllTemplates(templates);
    refreshTemplateList();
    showStatus(`Deleted "${name}".`);
  });

  newBuildBtn.addEventListener("click", () => {
    Object.assign(state, createBuilderState());
    templateSelect.value = "";
    deleteTemplateBtn.disabled = true;
    syncControlsToState();
    showStatus("Started a new build.");
  });

  renderShipMeta();
  renderCrew();
  refreshTemplateList();
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
