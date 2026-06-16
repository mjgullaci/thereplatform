# Driftless

Calm, short-session focus games and gentle structure tools, made for adults with ADHD brains.

This is the **landing / waitlist** site, built on the Driftless Design System (Phase A).
The actual product games (Focus Loop, etc.) are Phase B and ship later.

## What this is

- A standalone React + Vite + PWA web app.
- Lives as a sibling to Wordwell inside the same repo. Wordwell stays untouched at the repo root; Driftless lives in `driftless/`.
- Deployed as a **separate** Cloudflare project (project name `driftless`).

## Design system

This site consumes the design system at `src/styles/tokens/` verbatim from the Driftless Design System bundle exported by Claude Design. The token cascade is loaded by `src/styles/tokens.css`, which `src/styles/app.css` imports first.

When the design system updates:

1. Replace `src/styles/tokens/*.css` and `src/assets/logo/*.svg` with the new bundle's files.
2. Re-run icon generation if the icon SVG changed (see below).
3. Do not edit token files in this app — they are the source of truth from the design system.

## Run / build

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # dist/
npm run preview  # serve dist/ locally
```

Requires Node 22 (see `.nvmrc`).

## Icons

The SVG icon at `src/assets/logo/driftless-icon.svg` is the source of truth.
The PNGs in `public/` (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon-32.png`) are rendered from it via @resvg/resvg-js. To regenerate when the SVG changes, run a script like:

```js
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
const svg = readFileSync('src/assets/logo/driftless-icon.svg', 'utf-8');
for (const size of [192, 512, 180, 32]) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  const name = size === 180 ? 'apple-touch-icon.png' : size === 32 ? 'favicon-32.png' : `icon-${size}.png`;
  writeFileSync(`public/${name}`, png);
}
```

## Deploy to Cloudflare Workers / Pages

See `wrangler.jsonc` — the project name is `driftless`, with SPA fallback enabled.
Configure a new Cloudflare project pointed at this subdirectory:

- **Root directory:** `driftless`
- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Production branch:** the working branch (or `main` once merged)
- **Env var:** `NODE_VERSION=22`

## Legal posture (read once, never forget)

- Describe **who** the app is for. Never describe what it medically **does**.
- OK: "made for ADHD brains", "ADHD-friendly", "for distractible minds".
- Not OK: "treats / improves / trains / clinically proven / reduces symptoms / therapy / brain training".
- 18+ only. No under-13 path (avoids COPPA).
- No exclamation marks in product copy. No streak shaming. No gamification chrome (XP/badges/streaks/leaderboards/confetti/countdowns).
