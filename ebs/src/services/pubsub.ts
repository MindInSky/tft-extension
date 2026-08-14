import jwt from "jsonwebtoken";

export interface PubSubDispatcherOptions {
  twitchClientId: string;
  twitchExtensionSecret: string; // Base64 encoded secret from Twitch dev console
  fetchFn?: typeof fetch;
}

export class TwitchPubSubService {
  private clientId: string;
  private secretBuffer: Buffer;
  private fetchImpl: typeof fetch;

  constructor(options: PubSubDispatcherOptions) {
    this.clientId = options.twitchClientId;
    this.fetchImpl = options.fetchFn || globalThis.fetch;

    // Twitch Extension Secrets are base64-encoded strings
    const rawSecret = options.twitchExtensionSecret || "dGVzdC1zZWNyZXQtZm9yLXRmdC1leHRlbnNpb24=";
    try {
      this.secretBuffer = Buffer.from(rawSecret, "base64");
    } catch {
      this.secretBuffer = Buffer.from(rawSecret, "utf8");
    }
  }

  public generateServerJwt(channelId: string): string {
    const payload = {
      exp: Math.floor(Date.now() / 1000) + 60, // 1 minute expiry
      user_id: "ebs-service",
      role: "external",
      channel_id: channelId,
      pubsub_perms: {
        send: ["broadcast"]
      }
    };

    return jwt.sign(payload, this.secretBuffer, { algorithm: "HS256" });
  }

  public async broadcastToChannel(channelId: string, messagePayloadJson: string): Promise<boolean> {
    const serverJwt = this.generateServerJwt(channelId);
    const endpoint = "https://api.twitch.tv/helix/extensions/pubsub";

    const body = {
      target: ["broadcast"],
      broadcaster_id: channelId,
      is_global_broadcast: false,
      message: messagePayloadJson
    };

    try {
      const response = await this.fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "Client-Id": this.clientId,
          "Authorization": `Bearer ${serverJwt}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      return response.status === 204 || response.status === 200;
    } catch (err) {
      return false;
    }
  }
}
