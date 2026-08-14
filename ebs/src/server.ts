import Fastify, { FastifyInstance } from "fastify";
import { StreamerTelemetryInput, AppConfig } from "./types.js";
import { minifyTelemetry } from "./services/compressor.js";
import { TwitchPubSubService } from "./services/pubsub.js";

export function buildServer(config?: Partial<AppConfig>, pubsubOverride?: TwitchPubSubService): FastifyInstance {
  const app = Fastify({ logger: false });

  const resolvedConfig: AppConfig = {
    port: Number(process.env.PORT) || 8080,
    twitchClientId: process.env.TWITCH_CLIENT_ID || "mock_client_id",
    twitchExtensionSecret: process.env.TWITCH_EXTENSION_SECRET || "dGVzdC1zZWNyZXQtZm9yLXRmdC1leHRlbnNpb24=",
    streamerSharedSecret: process.env.STREAMER_SHARED_SECRET || "default_streamer_secret",
    ...config
  };

  const pubsubService = pubsubOverride || new TwitchPubSubService({
    twitchClientId: resolvedConfig.twitchClientId,
    twitchExtensionSecret: resolvedConfig.twitchExtensionSecret
  });

  // Health check
  app.get("/health", async () => {
    return { status: "ok", service: "tft-twitch-ebs" };
  });

  // Streamer Ingestion endpoint
  app.post<{
    Body: StreamerTelemetryInput;
    Headers: {
      authorization?: string;
      "x-twitch-channel-id"?: string;
    };
  }>("/api/v1/streamer/telemetry", async (request, reply) => {
    const authHeader = request.headers.authorization;
    const channelId = request.headers["x-twitch-channel-id"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (token !== resolvedConfig.streamerSharedSecret) {
      return reply.status(403).send({ error: "Invalid streamer credentials" });
    }

    if (!channelId) {
      return reply.status(400).send({ error: "Missing X-Twitch-Channel-Id header" });
    }

    const body = request.body;
    if (!body || !body.status) {
      return reply.status(400).send({ error: "Invalid telemetry payload format" });
    }

    try {
      const { payload, jsonString, byteSize } = minifyTelemetry(body);
      const dispatched = await pubsubService.broadcastToChannel(channelId, jsonString);

      return reply.status(200).send({
        success: true,
        broadcasted: dispatched,
        byteSize,
        timestamp: payload.t
      });
    } catch (err: any) {
      return reply.status(422).send({ error: err.message || "Failed to process telemetry" });
    }
  });

  return app;
}

if (process.env.NODE_ENV !== "test" && process.env.RUN_SERVER === "true") {
  const server = buildServer();
  const port = Number(process.env.PORT) || 8080;
  server.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`[EBS] Server listening at ${address}`);
  });
}
