import { describe, it } from "node:test";
import assert from "node:assert";
import { StreamSyncBuffer } from "../src/sync_buffer.js";

describe("Stream Sync Buffer", () => {
  it("delivers updates immediately in instant mode", () => {
    let deliveredState = null;
    const buffer = new StreamSyncBuffer({
      mode: "instant",
      delayMs: 0,
      onEmit: (state) => {
        deliveredState = state;
      }
    });

    const state = { st: "active", p: { hp: 100, g: 50 } };
    buffer.push(state, 1000);

    assert.deepStrictEqual(deliveredState, state);
  });

  it("buffers updates and releases after configured delay", () => {
    const emitted = [];
    const buffer = new StreamSyncBuffer({
      mode: "stream-sync",
      delayMs: 2000,
      onEmit: (state) => {
        emitted.push(state);
      }
    });

    const state1 = { st: "active", p: { hp: 100, g: 50 } };
    const state2 = { st: "active", p: { hp: 100, g: 46 } };

    // Push at t=0
    buffer.push(state1, 1000);
    // At t=1000, 1000ms has elapsed (delay is 2000ms), so nothing emitted yet
    buffer.tick(2000);
    assert.strictEqual(emitted.length, 0);

    // Push at t=1500
    buffer.push(state2, 2500);

    // At t=3000 (2000ms after state1), state1 should be emitted
    buffer.tick(3000);
    assert.strictEqual(emitted.length, 1);
    assert.deepStrictEqual(emitted[0], state1);

    // At t=4500 (2000ms after state2), state2 should be emitted
    buffer.tick(4500);
    assert.strictEqual(emitted.length, 2);
    assert.deepStrictEqual(emitted[1], state2);
  });
});
