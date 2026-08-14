/**
 * Stream Delay Synchronization Buffer for Viewer Overlay
 * Smooths out and synchronizes overlay state changes with Twitch broadcast video delay.
 */

export class StreamSyncBuffer {
  constructor(options = {}) {
    this.mode = options.mode || "stream-sync"; // "stream-sync" or "instant"
    this.delayMs = options.delayMs !== undefined ? options.delayMs : 2500; // default 2.5s
    this.onEmit = options.onEmit || (() => {});
    this.queue = [];
    this.timerId = null;

    if (typeof window !== "undefined") {
      this.startInternalTimer();
    }
  }

  setMode(mode) {
    this.mode = mode;
    if (this.mode === "instant" && this.queue.length > 0) {
      // Flush latest state immediately
      const latest = this.queue[this.queue.length - 1];
      this.queue = [];
      this.onEmit(latest.state);
    }
  }

  setDelayMs(delayMs) {
    this.delayMs = Math.max(0, Math.min(6000, Number(delayMs) || 0));
  }

  push(state, timestamp = Date.now()) {
    if (this.mode === "instant" || this.delayMs === 0) {
      this.onEmit(state);
      return;
    }

    this.queue.push({
      state,
      receivedAt: timestamp,
      emitAt: timestamp + this.delayMs
    });
  }

  tick(currentTime = Date.now()) {
    if (this.queue.length === 0) return;

    let emittedState = null;
    while (this.queue.length > 0 && this.queue[0].emitAt <= currentTime) {
      const item = this.queue.shift();
      emittedState = item.state;
    }

    if (emittedState) {
      this.onEmit(emittedState);
    }
  }

  startInternalTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.tick();
    }, 100);
  }

  destroy() {
    if (this.timerId) clearInterval(this.timerId);
  }
}
