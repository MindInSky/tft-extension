import {
  findCraftableRecipes,
  getComponentCombinations,
  getItemMetadata,
  normalizeItemId
} from "./recipes.js";
import { BASE_COMPONENTS } from "./items_data.js";

let activeComponentFilter = null;

export function setupTooltips(container, tooltipElement) {
  if (!container || !tooltipElement) return;

  const titleElem = tooltipElement.querySelector("#tooltip-title");
  const iconElem = tooltipElement.querySelector("#tooltip-icon");
  const statsElem = tooltipElement.querySelector("#tooltip-stats");
  const descElem = tooltipElement.querySelector("#tooltip-desc");

  container.addEventListener("mouseover", (e) => {
    const target = e.target.closest("[data-tooltip-item]");
    if (!target) return;

    const itemId = target.getAttribute("data-tooltip-item");
    const meta = getItemMetadata(itemId);

    if (titleElem) titleElem.textContent = meta.name;
    if (iconElem) {
      iconElem.src = meta.iconUrl;
      iconElem.alt = meta.name;
    }
    if (statsElem) {
      const statsList = Object.entries(meta.stats || {})
        .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
        .join(" | ");
      statsElem.textContent = statsList || "Standard item";
    }
    if (descElem) descElem.textContent = meta.description || "";

    const rect = target.getBoundingClientRect();
    const tooltipHeight = 110;
    const tooltipWidth = 240;

    let top = rect.top - tooltipHeight - 8;
    if (top < 10) top = rect.bottom + 8;
    let left = rect.left - tooltipWidth + rect.width;
    if (left < 10) left = 10;

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
    tooltipElement.classList.add("visible");
  });

  container.addEventListener("mouseout", (e) => {
    const target = e.target.closest("[data-tooltip-item]");
    if (target) {
      tooltipElement.classList.remove("visible");
    }
  });
}

export function renderRecipeHelper(container, benchItems) {
  const recipeList = container.querySelector("#recipe-list");
  const filterContainer = container.querySelector("#component-chips-container");
  const recipeBadge = container.querySelector("#recipe-tab-badge");

  if (!recipeList || !filterContainer) return;

  const doc = container.ownerDocument || (typeof document !== "undefined" ? document : null);
  if (!doc) return;

  const rawList = Array.isArray(benchItems) ? benchItems : [];
  
  // Count available base components
  const counts = {};
  for (const raw of rawList) {
    const norm = normalizeItemId(raw);
    if (BASE_COMPONENTS[norm]) {
      counts[norm] = (counts[norm] || 0) + 1;
    }
  }

  // Render Component Filter Chips
  filterContainer.innerHTML = "";
  const componentKeys = Object.keys(counts);

  if (componentKeys.length === 0) {
    filterContainer.innerHTML = `<span style="font-size: 10px; color: var(--text-muted);">No components</span>`;
  } else {
    for (const key of componentKeys) {
      const meta = BASE_COMPONENTS[key];
      const chip = doc.createElement("div");
      chip.className = `component-chip ${activeComponentFilter === key ? "active" : ""}`;
      chip.setAttribute("data-tooltip-item", key);
      chip.setAttribute("data-component-key", key);
      chip.innerHTML = `
        <img src="${meta.iconUrl}" alt="${meta.name}" />
        <span class="chip-count">${counts[key]}</span>
      `;

      chip.addEventListener("click", () => {
        if (activeComponentFilter === key) {
          activeComponentFilter = null;
        } else {
          activeComponentFilter = key;
        }
        renderRecipeHelper(container, benchItems);
      });

      filterContainer.appendChild(chip);
    }
  }

  // Calculate recipes to display
  let itemsToDisplay = [];
  if (activeComponentFilter) {
    const combos = getComponentCombinations(activeComponentFilter);
    itemsToDisplay = combos.map(c => c.resultItem);
  } else {
    itemsToDisplay = findCraftableRecipes(rawList);
  }

  if (recipeBadge) {
    recipeBadge.textContent = itemsToDisplay.length;
  }

  recipeList.innerHTML = "";
  if (itemsToDisplay.length === 0) {
    recipeList.innerHTML = `
      <div class="empty-recipe-state">
        ${activeComponentFilter ? "No combinations found for selected item." : "No craftable completed items with current inventory."}
      </div>
    `;
    return;
  }

  for (const item of itemsToDisplay) {
    const [c1, c2] = item.recipe || [];
    const meta1 = BASE_COMPONENTS[c1];
    const meta2 = BASE_COMPONENTS[c2];

    const card = doc.createElement("div");
    card.className = "recipe-card";
    card.setAttribute("data-tooltip-item", item.id);
    card.innerHTML = `
      <img class="recipe-item-icon" src="${item.iconUrl}" alt="${item.name}" />
      <div class="recipe-info">
        <span class="recipe-name">${item.name}</span>
        <span class="recipe-desc-preview">${item.description}</span>
      </div>
      <div class="recipe-formula">
        ${meta1 ? `<img class="formula-icon" src="${meta1.iconUrl}" alt="${meta1.name}" data-tooltip-item="${meta1.id}" />` : ""}
        <span class="formula-plus">+</span>
        ${meta2 ? `<img class="formula-icon" src="${meta2.iconUrl}" alt="${meta2.name}" data-tooltip-item="${meta2.id}" />` : ""}
      </div>
    `;
    recipeList.appendChild(card);
  }
}

export function renderHUD(container, state) {
  if (!container) return;

  const isLive = state && state.st === "active" && state.p;

  // Header & Status
  const statusBadge = container.querySelector("#status-badge");
  if (statusBadge) {
    statusBadge.className = `status-badge ${isLive ? "live" : "standby"}`;
    statusBadge.textContent = isLive ? "LIVE" : "STANDBY";
  }

  // Player Summary Bar & Tabs
  const summaryBar = container.querySelector("#player-summary");
  const tabsBar = container.querySelector("#hud-tabs");
  const recipesTab = container.querySelector("#tab-recipes");
  const standbyView = container.querySelector("#standby-view");

  if (isLive) {
    if (summaryBar) summaryBar.style.display = "grid";
    if (tabsBar) tabsBar.style.display = "flex";
    if (recipesTab) recipesTab.style.display = "block";
    if (standbyView) standbyView.style.display = "none";

    const p = state.p;
    const hpElem = container.querySelector("#stat-health");
    const lvlElem = container.querySelector("#stat-level");
    const goldElem = container.querySelector("#stat-gold");
    const streakElem = container.querySelector("#stat-streak");

    if (hpElem) hpElem.textContent = p.hp !== undefined ? p.hp : "-";
    if (lvlElem) lvlElem.textContent = p.lvl !== undefined ? `Lvl ${p.lvl}` : "-";
    if (goldElem) goldElem.textContent = p.g !== undefined ? `${p.g}g` : "-";

    if (streakElem) {
      const streak = p.strk || 0;
      if (streak > 0) {
        streakElem.textContent = `+${streak}W`;
        streakElem.className = "stat-value win-streak";
      } else if (streak < 0) {
        streakElem.textContent = `${Math.abs(streak)}L`;
        streakElem.className = "stat-value loss-streak";
      } else {
        streakElem.textContent = "0";
        streakElem.className = "stat-value";
      }
    }

    // Render Recipe helper
    renderRecipeHelper(container, state.bch || []);
  } else {
    if (summaryBar) summaryBar.style.display = "none";
    if (tabsBar) tabsBar.style.display = "none";
    if (recipesTab) recipesTab.style.display = "none";
    if (standbyView) standbyView.style.display = "flex";
  }
}
