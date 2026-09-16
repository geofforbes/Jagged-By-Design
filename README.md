# Builder's Table

Project scaffold for [Builder's Table](https://builderstable.net/), a hackathon project.

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) (TypeScript)

This matches the stack Google AI Studio exports, to keep the export/import
round-trip between AI Studio and this repo friction-free.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deployment

This repo deploys to Vercel automatically on every push via Vercel's native
GitHub integration:

1. In the [Vercel dashboard](https://vercel.com/new), import this GitHub repo.
2. Vercel auto-detects the Vite framework — no extra config needed.
3. Every push to `main` deploys to production; every other branch/PR gets a
   preview deployment.
