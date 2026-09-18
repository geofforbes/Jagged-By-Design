import type { VercelRequest, VercelResponse } from "@vercel/node";
import { listLifeStoryItems } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const items = await listLifeStoryItems();
  return res.status(200).json({ items });
}
