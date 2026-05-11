# Wordwell + Hearthword Games — Roadmap

Goal: low-cost, fast-iteration path from playable prototype to first revenue.
Target: a few thousand USD / month combined across the umbrella within 12–18 months.

## Phase 0 — Prototype (now)

- [x] Playable web prototype with 7 daily themed puzzles
- [x] Daily streak + total solved
- [x] Large-text accessibility mode
- [x] PWA manifest (installable on phones via "Add to Home Screen")
- [ ] Replace placeholder icons (icon-192.png, icon-512.png) — needs real art
- [ ] Replace hand-authored word list with full TWL/SOWPODS dictionary check
- [ ] Generate 30+ puzzles (a month of content)

## Phase 1 — Web launch (free, week 1–2)

- [ ] Deploy to Cloudflare Pages or Vercel (free tier, custom domain optional)
- [ ] Privacy policy page (required for stores later)
- [ ] Add share-result feature ("I solved today's Wordwell — try it")
- [ ] Add basic analytics (PostHog free tier, 10k events/mo)
- [ ] Soft launch via TikTok organic — short clips of solving + theme reveal

## Phase 2 — Android launch ($25, week 3–6)

- [ ] Add Capacitor (`npm i @capacitor/core @capacitor/cli`)
- [ ] Generate Android project (`npx cap add android`)
- [ ] Create signed AAB
- [ ] Register Google Play developer account ($25 one-time)
- [ ] Internal testing track → closed testing → production
- [ ] Add AdMob rewarded video for hints / shuffle (don't over-monetize early)

## Phase 3 — Monetization (week 6–10)

- [ ] Hint system: tap empty slot → costs 1 hint; rewarded ad gives 3 hints
- [ ] Daily hint refill (3 free) or unlimited via $2.99 "Remove Ads" IAP
- [ ] Themed puzzle packs ($1.99 each: "Songs of the 70s", "Classic Films", etc.)
- [ ] Daily reward streak (cosmetic: unlocked cottage decor)
- [ ] Single $4.99 lifetime "Wordwell Premium": no ads, all packs, unlimited hints

## Phase 4 — iOS launch ($99, month 3–4)

- [ ] Apple Developer account ($99/yr)
- [ ] `npx cap add ios`
- [ ] Build via Xcode (requires Mac — borrow, use a cloud Mac, or wait until web/Android revenue covers a Mac mini)
- [ ] TestFlight → App Store review → production
- [ ] Sign up for Apple Small Business Program (15% commission under $1M/yr)

## Phase 5 — Game 2 (month 4–6)

- [ ] Pick the next Hearthword game: candidates are
  - Themed mini-crossword (5x5 with story theme, like NYT mini)
  - Cozy hidden-object scenes
  - Pattern-mahjong with monthly themed boards
- [ ] Reuse: build pipeline, ads/IAP wiring, store account, branding
- [ ] Cross-promote between Wordwell and Game 2 (free UA)

## Phase 6 — Live-ops & content engine (ongoing)

- [ ] Automated daily puzzle generator (Claude API to author themed puzzles overnight)
- [ ] Weekly themed event (e.g., "Beatles Week", "Beach Week")
- [ ] Player leaderboard (optional, requires backend — defer until revenue justifies)
- [ ] Localizations: Spanish, Portuguese, French (Tier-1 EU + LATAM)

## Decision gates

- **After Phase 1 (web only):** if 7-day retention >15% with organic traffic, proceed to Android.
  If not, iterate or kill.
- **After Phase 2 (Android):** if ARPDAU >$0.03 and D7 >12%, monetize harder + iOS.
  If not, iterate the core loop, do not pay UA.
- **After Phase 4 (iOS):** if combined revenue clears $500/mo, begin Game 2 development.
  If not, double down on Wordwell live-ops.

## What we explicitly are NOT doing

- No subscriptions on a no-audience indie game (DOA).
- No paid user acquisition until day-1 ARPU > $0.30.
- No backend/accounts until there's revenue to justify ongoing costs.
- No cloning a specific competitor — original mechanic + theme is non-negotiable
  for App Store approval (Apple 4.3 Spam, Google low-quality AI policy).
