# Memento Mori: Time Audit

A frontend-only life-audit calculator. Given your age, sex, country, and daily habits, it shows a countdown to your expected death, a "life in weeks" grid, and how much discretionary free time you actually have left after sleep, work, and everything else.

## Run & Operate

- The app runs via the `artifacts/memento-mori: web` workflow (Vite). Restart it to verify, don't run root `pnpm dev`.
- `pnpm --filter @workspace/memento-mori run typecheck` — typecheck just this app
- `pnpm run typecheck` — full typecheck across all packages
- No env vars or backend required — the app is pure frontend.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- App: React + Vite (SPA), Tailwind CSS v4, shadcn/ui (Radix) tooltips, lucide-react icons
- No backend, no database — all state is in-memory React state
- Fonts: Space Grotesk (mono/display) + Inter (sans)

## Where things live

- `artifacts/memento-mori/` — the whole app
  - `src/hooks/useLifeCalc.ts` — source of truth for all inputs, age-dynamic defaults, override state, and the derived `stats` totals
  - `src/hooks/useTheme.ts` — theme resolution (geolocation → sunrise/sunset → `prefers-color-scheme`)
  - `src/lib/lifeExpectancy.ts` — UN WPP 2024 life-expectancy table by country/sex (do not alter)
  - `src/components/LifeGrid.tsx` — canvas "life in weeks" grid
  - `src/index.css` — theme tokens (`--accent`, `--cat-*` are hex), fonts, slider styles

## Architecture decisions

- Pure frontend by design; no API or persistence. Refreshing resets everything.
- `LifeGrid` is a single HTML5 canvas (not ~4,000 DOM nodes). It draws the full grid once, then per frame only clears/redraws a small region around the current-week cell to animate the pulse — keeps it cheap on weak devices. Re-runs on window resize.
- Many inputs have age-dynamic research-backed defaults; editing a field marks it "overridden" so age changes stop auto-updating it. "Reset to Defaults" clears overrides.
- `countTo` (number roll-up animation) returns a cancel handle; callers cancel the previous run in the effect cleanup to avoid races/flicker under rapid slider changes.

## User preferences

- Aesthetic: data-journalism editorial — sharp contrast, no gradients, no glassmorphism, no emojis.

## Gotchas

- Verify with `pnpm --filter @workspace/memento-mori run typecheck`, not `build` (build needs workflow-provided `PORT`/`BASE_PATH`).
- Canvas cannot use CSS `var()` for colors — read the computed hex via `getComputedStyle`. See `.agents/memory/canvas-css-vars.md`.
- This repo also contains an `api-server` artifact from the monorepo template; it is unused by this app.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
