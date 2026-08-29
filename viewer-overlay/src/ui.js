import { getItemMetadata } from "./recipes.js";
import { BASE_COMPONENTS } from "./items_data.js";
import { getChampionMeta, getTraitMeta } from "./board.js";
import { formatMetricNumber, sortCombatMetrics } from "./combat.js";

let activeLeftTab = "bench";
let activeRightTab = "damage";

export function setupTooltips(container, tooltipElement) {
  if (!container || !tooltipElement) return;

  const titleElem = tooltipElement.querySelector("#tooltip-title");
  const descElem = tooltipElement.querySelector("#tooltip-desc");

  container.addEventListener("mouseover", (e) => {
    const target = e.target.closest("[data-tooltip-item]");
    if (!target) return;

    const itemId = target.getAttribute("data-tooltip-item");
    const meta = getItemMetadata(itemId);

    if (titleElem) titleElem.textContent = meta.name;
    if (descElem) descElem.textContent = meta.description || "";

    const rect = target.getBoundingClientRect();
    tooltipElement.style.top = `${rect.bottom + 8}px`;
    tooltipElement.style.left = `${Math.max(10, rect.left - 100)}px`;
    tooltipElement.classList.add("visible");
  });

  container.addEventListener("mouseout", (e) => {
    if (e.target.closest("[data-tooltip-item]")) {
      tooltipElement.classList.remove("visible");
    }
  });
}

export function renderHUD(container, state) {
  if (!container) return;
  const doc = container.ownerDocument || document;

  // Left Panel Bindings & Tab Toggle
  const leftBenchTab = container.querySelector('#tab-bench-content');
  const leftTraitsTab = container.querySelector('#tab-traits-content');
  const leftBtns = container.querySelectorAll('[data-left-tab]');

  leftBtns.forEach(btn => {
    btn.onclick = () => {
      activeLeftTab = btn.getAttribute('data-left-tab');
      leftBtns.forEach(b => b.classList.toggle('active', b === btn));
      if (leftBenchTab) leftBenchTab.style.display = activeLeftTab === 'bench' ? 'grid' : 'none';
      if (leftTraitsTab) leftTraitsTab.style.display = activeLeftTab === 'traits' ? 'flex' : 'none';
    };
  });

  // Right Panel Bindings & Tab Toggle
  const rightDamageTab = container.querySelector('#tab-damage-content');
  const rightLobbyTab = container.querySelector('#tab-lobby-content');
  const rightBtns = container.querySelectorAll('[data-right-tab]');

  rightBtns.forEach(btn => {
    btn.onclick = () => {
      activeRightTab = btn.getAttribute('data-right-tab');
      rightBtns.forEach(b => b.classList.toggle('active', b === btn));
      if (rightDamageTab) rightDamageTab.style.display = activeRightTab === 'damage' ? 'flex' : 'none';
      if (rightLobbyTab) rightLobbyTab.style.display = activeRightTab === 'lobby' ? 'block' : 'none';
    };
  });

  // Render Bench Items
  if (leftBenchTab) {
    leftBenchTab.innerHTML = '';
    const benchList = state?.bch || state?.bench || [];
    if (benchList.length === 0) {
      leftBenchTab.innerHTML = `<div style="grid-column: 1/-1; color:var(--text-muted); font-size:11px;">No items on bench</div>`;
    } else {
      for (const item of benchList) {
        const meta = getItemMetadata(item);
        const slot = doc.createElement('div');
        slot.className = 'bench-item-slot';
        slot.setAttribute('data-tooltip-item', meta.id);
        slot.innerHTML = `<img src="${meta.iconUrl}" alt="${meta.name}" />`;
        leftBenchTab.appendChild(slot);
      }
    }
  }

  // Render Traits
  if (leftTraitsTab) {
    leftTraitsTab.innerHTML = '';
    const traitsList = state?.trt || state?.traits || [];
    if (traitsList.length === 0) {
      leftTraitsTab.innerHTML = `<div style="color:var(--text-muted); font-size:11px;">No active traits</div>`;
    } else {
      for (const tr of traitsList) {
        const meta = getTraitMeta(tr.k || tr.key, tr.n || tr.count, tr.t || tr.tierStyle);
        const row = doc.createElement('div');
        row.className = 'trait-row';
        row.style.background = meta.tierBg;
        row.innerHTML = `
          <img class="trait-icon" src="${meta.iconUrl}" onerror="this.style.display='none'" alt="${meta.cleanName}" />
          <div class="trait-info">
            <span class="trait-name">${meta.cleanName}</span>
            <span class="trait-count" style="color:${meta.tierColor}">${meta.count}</span>
          </div>
        `;
        leftTraitsTab.appendChild(row);
      }
    }
  }

  // Render Damage Meter (Physical = Red, Magic = Blue, True = White)
  if (rightDamageTab) {
    rightDamageTab.innerHTML = '';
    const combatList = state?.dmg || state?.combat || [];
    const sorted = sortCombatMetrics(combatList, 'damage');

    if (sorted.length === 0 || sorted.every(s => s.totalDmg === 0)) {
      rightDamageTab.innerHTML = `<div style="color:var(--text-muted); font-size:11px;">Waiting for combat round...</div>`;
    } else {
      const maxDmg = Math.max(...sorted.map(s => s.totalDmg || 1), 1);

      for (const item of sorted) {
        const physPct = Math.round((item.physical / maxDmg) * 100);
        const magicPct = Math.round((item.magic / maxDmg) * 100);
        const truePct = Math.round((item.trueDmg / maxDmg) * 100);
        const totalPct = Math.min(100, Math.max(5, Math.round((item.totalDmg / maxDmg) * 100)));

        const row = doc.createElement('div');
        row.className = 'combat-row';
        row.innerHTML = `
          <img class="combat-champ-icon" src="${item.iconUrl}" onerror="this.src='${item.fallbackIconUrl}'" alt="${item.cleanName}" />
          <div class="combat-bar-wrapper">
            <div class="combat-row-header">
              <span class="combat-champ-name">${item.cleanName}</span>
              <span class="combat-val-text">${formatMetricNumber(item.totalDmg)}</span>
            </div>
            <div class="combat-stacked-progress" style="width: ${totalPct}%;">
              ${physPct > 0 ? `<div class="segment-physical" style="flex:${physPct};"></div>` : ''}
              ${magicPct > 0 ? `<div class="segment-magic" style="flex:${magicPct};"></div>` : ''}
              ${truePct > 0 ? `<div class="segment-true" style="flex:${truePct};"></div>` : ''}
              ${physPct === 0 && magicPct === 0 && truePct === 0 ? `<div class="segment-physical" style="flex:1;"></div>` : ''}
            </div>
          </div>
        `;
        rightDamageTab.appendChild(row);
      }
    }
  }

  // Render Lobby Scoreboard
  if (rightLobbyTab) {
    rightLobbyTab.innerHTML = '';
    const players = state?.players || [
      { name: state?.p?.n || "Player", hp: state?.p?.h || 100, lvl: state?.p?.l || 1 }
    ];

    for (const p of players) {
      const hp = p.hp !== undefined ? p.hp : 100;
      const hpClass = hp > 50 ? '' : hp > 25 ? 'mid' : 'low';

      const row = doc.createElement('div');
      row.className = 'player-row';
      row.innerHTML = `
        <div class="player-name-group">
          <span class="player-name">${p.name || p.n || 'Player'}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="player-hp-bar">
            <div class="player-hp-fill ${hpClass}" style="width:${Math.max(0, Math.min(100, hp))}%;"></div>
          </div>
          <span style="font-size:11px; font-weight:800; width:24px; text-align:right;">${hp}</span>
        </div>
      `;
      rightLobbyTab.appendChild(row);
    }
  }
}
