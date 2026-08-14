export interface StreamerTelemetryInput {
  status: "active" | "standby";
  timestamp: number;
  player?: {
    name: string;
    level: number;
    gold: number;
    health: number;
    streak: number;
  };
  bench?: string[];
  board?: Array<{
    champion: string;
    stars: number;
    items: string[];
  }>;
  traits?: Array<{
    key: string;
    count: number;
    tier: number;
  }>;
  combat?: Array<{
    champion: string;
    damage: number;
    taken: number;
    healShield: number;
  }>;
}

export interface MinifiedPubSubPayload {
  t: number;
  st: "active" | "standby";
  p?: {
    lvl: number;
    g: number;
    strk: number;
    hp: number;
    name?: string;
  };
  bch?: string[];
  brd?: Array<{
    c: string;
    s: number;
    i: string[];
  }>;
  trt?: Array<{
    k: string;
    n: number;
    t: number;
  }>;
  dmg?: Array<{
    c: string;
    d: number;
    t: number;
    h: number;
  }>;
}

export interface AppConfig {
  port: number;
  twitchClientId: string;
  twitchExtensionSecret: string; // Base64 encoded or raw secret
  streamerSharedSecret: string;
}
