# Wordwell

A daily themed word puzzle. The first title under **Hearthword Games** — a planned umbrella
of cozy brain games aimed at the 40+ casual demographic (word, crossword, sudoku, solitaire,
mahjong, hidden object).

## Status

- v0.1 — playable web prototype with 7 daily seed puzzles, daily streak, accessibility
  (large-text mode), PWA installable.
- No accounts, no tracking, no ads, no IAP wired yet. Local-only persistence.

## Run it

```bash
npm install
npm run dev      # opens http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

Tested on Node 22.

## Tech stack

- Vite + React + TypeScript
- Tailwind (cozy palette, accessibility-first font sizes)
- Zustand for state, localStorage for persistence
- Framer Motion for the win modal + toasts
- vite-plugin-pwa for installable PWA + offline cache
- No server. No database. Everything lives on the device.

## Project layout

```
src/
  main.tsx              app entry
  App.tsx               router shell
  index.css             tailwind entry + globals
  lib/
    store.ts            zustand game state
    storage.ts          localStorage wrapper
    words.ts            normalize / canSpell / dates
    puzzles.ts          daily puzzle selection + guess validation
  components/
    LetterWheel.tsx     SVG drag-to-trace input
    FoundWordsList.tsx  required-words grid
    ProgressBar.tsx     completion meter
  screens/
    Home.tsx            today's theme + streak
    DailyPuzzle.tsx     gameplay screen
    Settings.tsx        large-text toggle + stats
  data/
    puzzles.json        seed puzzles (1 week of content)
```

## Distribution sequence (zero-budget path)

1. **Web** — deploy `dist/` to Cloudflare Pages, Vercel, or Netlify free tier.
   Shareable URL → TikTok/Reels organic posts → first players. No store fees.
2. **Google Play** ($25 one-time) — wrap with Capacitor, ship internal track,
   then closed testing, then production.
3. **Apple App Store** ($99/yr) — same Capacitor build, paid only after Android
   shows traction.

## Roadmap

See `docs/ROADMAP.md`.

## License

Proprietary. All rights reserved. Word lists are hand-authored from common English.
