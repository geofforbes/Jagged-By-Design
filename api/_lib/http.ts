import type { IncomingMessage } from "node:http";

type RequestWithBody = IncomingMessage & { body?: unknown };

/**
 * Vercel's Node.js runtime pre-parses JSON bodies onto `req.body`. The Vite
 * dev-server middleware we use for local development doesn't, so this reads
 * the raw stream in that case. Works for both without depending on either
 * platform's request helpers.
 */
export async function readJsonBody<T>(req: RequestWithBody): Promise<T> {
  if (req.body !== undefined) {
    return typeof req.body === "string" ? JSON.parse(req.body) : (req.body as T);
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? JSON.parse(raw) : ({} as T);
}
