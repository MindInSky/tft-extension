import Fastify from "fastify";
import { LocalRiotClientReader } from "./riot.js";
import { DirectTwitchPubSubService } from "./pubsub.js";

export interface DesktopAppConfig {
  twitchClientId: string;
  twitchExtensionSecret: string;
  channelId: string;
  riotEndpoint?: string;
  pollIntervalMs?: number;
  port?: number;
}

export class TFTDesktopEngine {
  private riotReader: LocalRiotClientReader;
  private pubsubService: DirectTwitchPubSubService;
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;
  private lastHash = "";

  constructor(private config: DesktopAppConfig) {
    this.riotReader = new LocalRiotClientReader(config.riotEndpoint || "https://127.0.0.1:2999");
    this.pubsubService = new DirectTwitchPubSubService({
      twitchClientId: config.twitchClientId,
      twitchExtensionSecret: config.twitchExtensionSecret,
      channelId: config.channelId
    });
  }

  async step(): Promise<{ status: string; broadcasted: boolean }> {
    const rawData = await this.riotReader.fetchAllGameData();
    if (!rawData || !rawData.activePlayer) {
      return { status: "standby", broadcasted: false };
    }

    const activePlayer = rawData.activePlayer || {};
    const payload = {
      st: "active",
      t: Math.floor(Date.now() / 1000),
      p: {
        n: activePlayer.summonerName || "Player",
        l: activePlayer.level || 1,
        g: activePlayer.currentGold || 0,
        h: Math.round((activePlayer.championStats && activePlayer.championStats.currentHealth) || 100),
        s: 0
      },
      b: [],
      u: [],
      tr: [],
      c: []
    };

    const payloadString = JSON.stringify(payload);
    if (payloadString === this.lastHash) {
      return { status: "active", broadcasted: false };
    }

    this.lastHash = payloadString;
    const sent = await this.pubsubService.broadcastToTwitch(payloadString);
    return { status: "active", broadcasted: sent };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const interval = this.config.pollIntervalMs || 1000;
    this.timer = setInterval(async () => {
      await this.step();
    }, interval);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
