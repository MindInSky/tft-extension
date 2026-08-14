/**
 * UI Renderer for TFT Twitch Video Overlay.
 */

export function renderHUD(container, state) {
  if (!container) return;

  const isLive = state && state.st === "active" && state.p;

  // Header & Status
  const statusBadge = container.querySelector("#status-badge");
  if (statusBadge) {
    statusBadge.className = `status-badge ${isLive ? "live" : "standby"}`;
    statusBadge.textContent = isLive ? "LIVE" : "STANDBY";
  }

  // Player Summary Bar
  const summaryBar = container.querySelector("#player-summary");
  const standbyView = container.querySelector("#standby-view");

  if (isLive) {
    if (summaryBar) summaryBar.style.display = "grid";
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
  } else {
    if (summaryBar) summaryBar.style.display = "none";
    if (standbyView) standbyView.style.display = "flex";
  }
}
