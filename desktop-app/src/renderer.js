document.addEventListener("DOMContentLoaded", async () => {
  if (!window.api) return;

  const channelIdInput = document.getElementById("channelId");
  const clientIdInput = document.getElementById("twitchClientId");
  const secretInput = document.getElementById("twitchExtensionSecret");
  const saveBtn = document.getElementById("save-btn");
  const statusBadge = document.getElementById("status-badge");
  const diagText = document.getElementById("diag-text");
  
  const togglePreviewBtn = document.getElementById("toggle-preview-btn");
  const previewBox = document.getElementById("preview-box");
  let isPreviewOpen = false;

  togglePreviewBtn.addEventListener("click", () => {
    isPreviewOpen = !isPreviewOpen;
    previewBox.style.display = isPreviewOpen ? "block" : "none";
    togglePreviewBtn.textContent = isPreviewOpen ? "Hide Overlay Preview" : "Toggle Streamer Overlay Preview";
  });

  const config = await window.api.getConfig();
  if (config) {
    channelIdInput.value = config.channelId || "";
    clientIdInput.value = config.twitchClientId || "";
    secretInput.value = config.twitchExtensionSecret || "";
  }

  saveBtn.addEventListener("click", async () => {
    const newConfig = {
      channelId: channelIdInput.value.trim(),
      twitchClientId: clientIdInput.value.trim(),
      twitchExtensionSecret: secretInput.value.trim(),
      pollIntervalMs: 1000
    };

    await window.api.saveConfig(newConfig);
    diagText.textContent = "Settings saved! TFT Engine re-started.";
  });

  // Diagnostics polling loop
  setInterval(async () => {
    try {
      const res = await window.api.getEngineStatus();
      if (res && res.status === "active") {
        statusBadge.textContent = "Live & Syncing";
        statusBadge.className = "badge active";
        diagText.textContent = `Active game detected. Telemetry broadcast status: ${res.broadcasted ? "Sent to Twitch" : "No diff / Heartbeat idle"}`;
      } else {
        statusBadge.textContent = "Standby";
        statusBadge.className = "badge standby";
        diagText.textContent = "Standby mode: Searching for TFT client on port 2999...";
      }
    } catch (e) {
      statusBadge.textContent = "Error";
      statusBadge.className = "badge";
    }
  }, 1000);
});
