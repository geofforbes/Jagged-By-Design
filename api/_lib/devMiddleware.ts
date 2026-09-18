import type { Plugin } from "vite";
import { readJsonBody } from "./http";
import { runAsk } from "./ask";
import { runBeforeIVisit } from "./briefing";

/**
 * `vite dev` doesn't run the /api serverless functions Vercel would serve
 * in production. This middleware handles the same two routes locally so
 * `npm run dev` works end-to-end without needing the Vercel CLI.
 */
export function apiDevMiddleware(): Plugin {
  return {
    name: "api-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== "POST" || !req.url) {
          next();
          return;
        }

        try {
          if (req.url.startsWith("/api/ask")) {
            const body = await readJsonBody<Parameters<typeof runAsk>[0]>(req);
            const result = await runAsk(body);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
            return;
          }

          if (req.url.startsWith("/api/before-i-visit")) {
            const body = await readJsonBody<Parameters<typeof runBeforeIVisit>[0]>(req);
            const result = await runBeforeIVisit(body);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
            return;
          }
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }));
          return;
        }

        next();
      });
    },
  };
}
