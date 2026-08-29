import https from "https";
import http from "http";
import { URL } from "url";

export class LocalRiotClientReader {
  private endpoint: string;

  constructor(endpoint = "https://127.0.0.1:2999") {
    this.endpoint = endpoint.replace(/\/$/, "");
  }

  async fetchAllGameData(): Promise<any | null> {
    const targetUrl = `${this.endpoint}/liveclientdata/allgamedata`;
    
    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(targetUrl);
        const req = https.get(
          parsedUrl,
          {
            rejectUnauthorized: false,
            timeout: 1500,
            headers: {
              "User-Agent": "TFT-Desktop-Companion/1.0",
              "Accept": "application/json"
            }
          },
          (res) => {
            if (res.statusCode !== 200) {
              resolve(null);
              return;
            }
            let body = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => (body += chunk));
            res.on("end", () => {
              try {
                resolve(JSON.parse(body));
              } catch {
                resolve(null);
              }
            });
          }
        );

        req.on("error", () => resolve(null));
        req.on("timeout", () => {
          req.destroy();
          resolve(null);
        });
      } catch {
        resolve(null);
      }
    });
  }
}
