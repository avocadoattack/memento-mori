# ⚰️ Memento Mori — Time Audit

> *After sleep, work, and everything else — here's what's actually left.*

An interactive memento mori that calculates how much of your life is genuinely discretionary after subtracting sleep, work, education, grooming, commuting, and habitual time-wasting. Grounded in real population data. Designed to be uncomfortable.

**[Live Demo →](https://memento-mori-calc.replit.app)**

---

## What It Does

Most "life in weeks" visualizations show you how many weeks remain. This one goes further — it subtracts every hour you've already committed to obligations and habits, then shows you what's actually yours.

- 🟥 A canvas-rendered grid of every week of your life, with past weeks marked
- ⏱️ A real-time countdown to your statistically expected death
- 📊 Stat cards breaking down years lost to sleep, work, school, chores, social media, TV, and streaming
- 🌍 Per-country life expectancy data (UN WPP 2024, 57 countries, male/female)
- 🎛️ Fully adjustable parameters with age-dynamic and sex-dynamic defaults
- 🌗 Auto dark/light mode (geolocation-based sunrise/sunset → `prefers-color-scheme` fallback)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React + Vite (TypeScript) |
| Styling | Tailwind CSS |
| Grid | HTML5 Canvas 2D API |
| Animations | CSS keyframes + `requestAnimationFrame` |
| Icons | lucide-react |
| Fonts | Space Grotesk · Inter · Cormorant Garamond |
| Country detection | `ipapi.co/json/` → Intl timezone fallback |
| Persistence | `sessionStorage` |
| Data | UN World Population Prospects 2024 (hardcoded) |

No backend. No database. No tracking. All state is in-memory.

---

## Data Sources

| Data | Source |
|---|---|
| Life expectancy by country + sex | [UN WPP 2024](https://population.un.org/wpp/) |
| Social media usage by age | [DemandSage 2026](https://www.demandsage.com/average-time-spent-on-social-media/) · [Gallup 2024](https://news.gallup.com/poll/512576/teens-spend-average-hours-social-media-per-day.aspx) |
| TV & household time use | [BLS American Time Use Survey](https://www.bls.gov/tus/) |
| Streaming (SVOD) time | Nielsen Gauge 2025 |
| Commute time | [U.S. Census Bureau ACS](https://www.census.gov/topics/employment/commuting.html) |
| Grooming time | BLS ATUS + Euromonitor Personal Care Survey |

---

## Running Locally

```bash
git clone https://github.com/avocadoattack/memento-mori.git
cd memento-mori
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Key Design Decisions

**Canvas grid, not DOM nodes** — rendering 4,000+ DOM nodes for the week grid caused severe performance issues. The grid is drawn on an HTML5 Canvas and redraws in under 16ms.

**Two-color grid** — proportional category coloring was tried and abandoned. Work dominated 43 years; TV dominated retirement. The result looked like a barcode and conveyed nothing emotionally. Red X marks on a warm beige grid is cleaner and more resonant.

**Education in calendar years** — displaying instruction hours ÷ 8,760 produced confusing outputs like "1.6 years." Education is always shown as calendar years of school.

**Custom stepper sliders** — native `<input type="range">` was broken in the build environment across multiple fix attempts. All sliders use a custom `StepperSlider` component.

---

## Roadmap

- [x] Mobile layout refinements
- [ ] Share / export (shareable link with encoded parameters)
- [ ] Localization (non-US defaults for commute, chores, eating)
- [ ] Healthy life expectancy mode (HALE toggle)
- [ ] Partner/family time category
- [ ] Sleep debt visualization

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

*Built with real data. Use your time wisely.*