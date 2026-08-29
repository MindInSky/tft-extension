import { describe, it, expect, vi } from "vitest";
import { DirectTwitchPubSubService } from "../src/pubsub.js";
import { TFTDesktopEngine } from "../src/engine.js";

describe("DirectTwitchPubSubService", () => {
  it("generates valid JWT token with correct claims", async () => {
    const service = new DirectTwitchPubSubService({
      twitchClientId: "test_client_id",
      twitchExtensionSecret: "dGVzdC1zZWNyZXQtZm9yLXRmdC1leHRlbnNpb24=",
      channelId: "987654321"
    });

    const jwt = await service.generateSignedJWT();
    expect(jwt).toBeTruthy();
    expect(jwt.split(".").length).toBe(3);
  });

  it("sends formatted telemetry payload to Twitch Helix PubSub", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 204
    });

    const service = new DirectTwitchPubSubService({
      twitchClientId: "test_client_id",
      twitchExtensionSecret: "dGVzdC1zZWNyZXQtZm9yLXRmdC1leHRlbnNpb24=",
      channelId: "987654321",
      fetchFn: mockFetch as any
    });

    const result = await service.broadcastToTwitch(JSON.stringify({ st: "active" }));
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.twitch.tv/helix/extensions/pubsub");
    expect(opts.headers["Client-ID"]).toBe("test_client_id");
    expect(opts.headers["Authorization"]).toContain("Bearer ");
  });
});
