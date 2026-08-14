import { StreamerTelemetryInput, MinifiedPubSubPayload } from "../types.js";

export const MAX_PUBSUB_BYTES = 5000;

export function minifyTelemetry(input: StreamerTelemetryInput): {
  payload: MinifiedPubSubPayload;
  jsonString: string;
  byteSize: number;
} {
  const minified: MinifiedPubSubPayload = {
    t: input.timestamp || Math.floor(Date.now() / 1000),
    st: input.status
  };

  if (input.status === "active" && input.player) {
    minified.p = {
      lvl: input.player.level,
      g: input.player.gold,
      strk: input.player.streak,
      hp: input.player.health,
      name: input.player.name
    };
  }

  if (input.bench && input.bench.length > 0) {
    minified.bch = input.bench;
  }

  if (input.board && input.board.length > 0) {
    minified.brd = input.board.map(b => ({
      c: b.champion,
      s: b.stars,
      i: b.items || []
    }));
  }

  if (input.traits && input.traits.length > 0) {
    minified.trt = input.traits.map(tr => ({
      k: tr.key,
      n: tr.count,
      t: tr.tier
    }));
  }

  if (input.combat && input.combat.length > 0) {
    minified.dmg = input.combat.map(c => ({
      c: c.champion,
      d: c.damage,
      t: c.taken,
      h: c.healShield
    }));
  }

  const jsonString = JSON.stringify(minified);
  const byteSize = Buffer.byteLength(jsonString, "utf8");

  if (byteSize > MAX_PUBSUB_BYTES) {
    throw new Error(`Minified payload exceeds Twitch 5KB limit: ${byteSize} bytes`);
  }

  return { payload: minified, jsonString, byteSize };
}
