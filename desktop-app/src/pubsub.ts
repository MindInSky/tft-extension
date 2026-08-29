import * as jose from "jose";

export interface TwitchPubSubConfig {
  twitchClientId: string;
  twitchExtensionSecret: string;
  channelId: string;
  fetchFn?: typeof fetch;
}

export class DirectTwitchPubSubService {
  private clientId: string;
  private secret: Uint8Array;
  private channelId: string;
  private fetch: typeof fetch;

  constructor(config: TwitchPubSubConfig) {
    this.clientId = config.twitchClientId;
    const base64Secret = config.twitchExtensionSecret;
    this.secret = Buffer.from(base64Secret, "base64");
    this.channelId = config.channelId;
    this.fetch = config.fetchFn || globalThis.fetch;
  }

  async generateSignedJWT(): Promise<string> {
    const payload = {
      exp: Math.floor(Date.now() / 1000) + 60,
      user_id: "desktop_companion",
      role: "external",
      channel_id: this.channelId,
      pubsub_perms: {
        send: ["broadcast"]
      }
    };

    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(this.secret);
  }

  async broadcastToTwitch(jsonPayloadString: string): Promise<boolean> {
    if (!this.clientId || !this.channelId || !this.secret.length) {
      return false;
    }

    try {
      const jwt = await this.generateSignedJWT();
      const res = await this.fetch("https://api.twitch.tv/helix/extensions/pubsub", {
        method: "POST",
        headers: {
          "Client-ID": this.clientId,
          "Authorization": `Bearer ${jwt}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          target: ["broadcast"],
          broadcaster_id: this.channelId,
          is_global_broadcast: false,
          message: jsonPayloadString
        })
      });

      return res.status === 204 || res.status === 200;
    } catch (err) {
      console.error("[DirectPubSub] Broadcast failed:", err);
      return false;
    }
  }
}
