import { describe, it, expect, vi } from "vitest";
import { buildServer } from "../src/server.js";
import { minifyTelemetry } from "../src/services/compressor.js";
import { TwitchPubSubService } from "../src/services/pubsub.js";
import { StreamerTelemetryInput } from "../src/types.js";

describe("EBS Compressor", () => {
  it("minifies active game payload to under 5KB", () => {
    const fullState: StreamerTelemetryInput = {
      status: "active",
      timestamp: 1723617000,
      player: {
        name: "DoubleUpKing#NA1",
        level: 9,
        gold: 54,
        health: 82,
        streak: 4
      },
      bench: ["TFT_Item_BFSword", "TFT_Item_ChainVest", "TFT_Item_NeedlesslyLargeRod"],
      board: [
        { champion: "TFT13_Vi", stars: 2, items: ["TFT_Item_Bloodthirster", "TFT_Item_TitansResolve"] },
        { champion: "TFT13_Caitlyn", stars: 2, items: ["TFT_Item_InfinityEdge", "TFT_Item_LastWhisper"] }
      ],
      traits: [
        { key: "TFT13_Enforcer", count: 4, tier: 2 },
        { key: "TFT13_Sniper", count: 2, tier: 1 }
      ],
      combat: [
        { champion: "TFT13_Caitlyn", damage: 12450, taken: 1100, healShield: 0 },
        { champion: "TFT13_Vi", damage: 5200, taken: 8900, healShield: 2300 }
      ]
    };

    const { payload, byteSize } = minifyTelemetry(fullState);
    expect(byteSize).toBeLessThan(5000);
    expect(payload.st).toBe("active");
    expect(payload.p?.g).toBe(54);
    expect(payload.p?.lvl).toBe(9);
    expect(payload.bch?.length).toBe(3);
    expect(payload.brd?.length).toBe(2);
    expect(payload.trt?.length).toBe(2);
    expect(payload.dmg?.length).toBe(2);
  });
});

describe("EBS Fastify Server Endpoints", () => {
  const testSecret = "test_streamer_token_123";

  it("returns 200 on /health", async () => {
    const app = buildServer();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", service: "tft-twitch-ebs" });
  });

  it("rejects unauthorized telemetry request", async () => {
    const app = buildServer({ streamerSharedSecret: testSecret });
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/streamer/telemetry",
      headers: { "x-twitch-channel-id": "12345" },
      payload: { status: "standby" }
    });
    expect(res.statusCode).toBe(401);
  });

  it("rejects invalid streamer secret", async () => {
    const app = buildServer({ streamerSharedSecret: testSecret });
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/streamer/telemetry",
      headers: {
        authorization: "Bearer wrong_token",
        "x-twitch-channel-id": "12345"
      },
      payload: { status: "standby" }
    });
    expect(res.statusCode).toBe(403);
  });

  it("accepts valid telemetry and dispatches to Twitch PubSub", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 204 });
    const mockPubsub = new TwitchPubSubService({
      twitchClientId: "mock_client",
      twitchExtensionSecret: Buffer.from("mock_secret_key_1234567890123456").toString("base64"),
      fetchFn: mockFetch as any
    });

    const app = buildServer({ streamerSharedSecret: testSecret }, mockPubsub);
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/streamer/telemetry",
      headers: {
        authorization: `Bearer ${testSecret}`,
        "x-twitch-channel-id": "999888"
      },
      payload: {
        status: "active",
        timestamp: 1723617100,
        player: {
          name: "StreamerName#1",
          level: 8,
          gold: 32,
          health: 68,
          streak: -2
        }
      }
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.success).toBe(true);
    expect(json.broadcasted).toBe(true);
    expect(json.byteSize).toBeLessThan(5000);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
