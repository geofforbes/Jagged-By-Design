import type { IncomingMessage, ServerResponse } from "node:http";
import { readJsonBody } from "./_lib/http";
import { runAsk } from "./_lib/ask";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  try {
    const body = await readJsonBody<Parameters<typeof runAsk>[0]>(req);
    const result = await runAsk(body);
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }));
  }
}
