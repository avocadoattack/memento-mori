# Threat Model

## Project Overview

Memento Mori: Time Audit is primarily a static React + Vite single-page application that runs entirely in the browser. Its core function is to calculate and visualize estimated lifetime, remaining discretionary time, and related statistics from user-provided age, sex, country, and habit inputs. The main production artifact is `artifacts/memento-mori/`, which serves static assets only and has no backend, database, authentication, or persistent storage.

This repository also contains two template artifacts that affect scan scope:
- `artifacts/api-server/` is a separate Express artifact with a production artifact definition, but its current exposed surface is only `/api/healthz`.
- `artifacts/mockup-sandbox/` is development-only and, per platform assumptions, is never deployed to production.

There is no active deployment at the time of this scan. For production analysis, assume `NODE_ENV=production` and that only production artifact definitions and reachable routes matter.

## Assets

- **User-entered life-audit inputs** — age, sex, country, education/work/habit selections, and derived statistics. These are potentially sensitive personal preference and lifestyle data, even though they are kept in browser memory only.
- **Browser-local transient state** — session-only quiz completion state in `sessionStorage`. It is low sensitivity but still part of the user experience and should not create security assumptions.
- **Client-side integrity of calculations and rendering** — the calculations, countdown, and canvas rendering must not expose script execution or unsafe DOM behavior from untrusted input.
- **Visitor privacy metadata** — IP-based country detection and optional browser geolocation touch location-related data, even though no first-party backend stores it.
- **Repository production artifacts** — the static web artifact and the template API artifact definitions. Even a minimal API route can become an attack surface if expanded in future changes.

## Trust Boundaries

- **Browser input to client application code** — all quiz/form values, URL state, and browser APIs are untrusted and must be treated as attacker-controlled for DOM and rendering safety.
- **Browser to third-party services** — the frontend makes a direct request to `https://ipapi.co/json/` for country auto-detection. That crosses from local client state to an external service outside project control.
- **Browser permission boundary** — `navigator.geolocation.getCurrentPosition` requests privileged location access from the browser. The app must remain safe whether permission is granted or denied.
- **Static asset boundary** — `artifacts/memento-mori/` is a static web artifact; there is no trusted server-side enforcement layer backing the SPA.
- **Optional API boundary** — `artifacts/api-server/` is a distinct Express service with a separate production artifact definition. Its current reachable surface is minimal, but any new route would create a conventional server-side trust boundary.
- **Internal/dev-only boundary** — `artifacts/mockup-sandbox/` is explicitly non-production and should be ignored unless future evidence shows production reachability.

## Scan Anchors

- Primary production entry point: `artifacts/memento-mori/src/App.tsx` and `artifacts/memento-mori/src/pages/Home.tsx`
- Highest-risk client logic: `artifacts/memento-mori/src/hooks/useLifeCalc.ts`, `src/hooks/useTheme.ts`, and DOM-writing display components under `src/components/`
- External/network-touching client code: `artifacts/memento-mori/src/hooks/useLifeCalc.ts` (`ipapi.co`) and `src/hooks/useTheme.ts` (browser geolocation)
- Secondary production artifact to re-check on future scans: `artifacts/api-server/src/` (currently health-check only)
- Dev-only area to skip unless proven reachable: `artifacts/mockup-sandbox/`

## Threat Categories

### Information Disclosure

The most relevant disclosure risk in this project is leakage of user-related or visitor-related data from the browser to places outside the user’s expectation. Because there is no first-party backend, the main concern is direct client disclosure to third parties or exposure through unsafe rendering. The application must ensure that personal inputs and derived statistics stay local to the browser unless the user intentionally follows an external link, and that any external requests are limited to the minimum data needed.

The project must preserve these guarantees:
- User-entered life-audit inputs and derived statistics MUST remain client-side only unless a future feature explicitly sends them elsewhere.
- Browser-visible values rendered into the DOM MUST NOT permit script injection from attacker-controlled input.
- External requests from the frontend MUST NOT include more user data than required for the feature.

### Tampering

Because all business logic is client-side, an attacker can always change their own local state and calculations. That is acceptable for this product because there is no server-side asset being protected from client tampering. The relevant tampering risk is instead whether attacker-controlled values can manipulate rendering paths or dynamic imports in a way that changes code execution or page behavior beyond the user’s own browser session.

The project must preserve these guarantees:
- Untrusted values MUST be treated as data, not executable HTML, script, CSS selectors, or module paths.
- Dynamic rendering helpers MUST only consume code-defined configuration or validated constants, not direct user input.

### Denial of Service

This app is mostly static and local, so classic server-side DoS is minimal. The realistic risk is client-side performance degradation from unbounded rendering or browser API usage. The canvas-based grid and animation loops should remain bounded so that public visitors cannot trigger pathological browser workload with simple inputs.

The project must preserve these guarantees:
- Publicly reachable client features MUST avoid unbounded DOM growth or excessive animation loops from ordinary user input.
- Browser API fallbacks and external fetches MUST time out or degrade safely when unavailable.
- Any future API routes added under `artifacts/api-server/` MUST add normal server-side DoS controls appropriate to their function.

### Elevation of Privilege

There is no authentication, authorization, or role separation in the current product, so traditional privilege escalation does not apply to the SPA itself. The only relevant future-facing concern is the optional Express artifact: if it grows beyond a health check, new routes could introduce injection or access-control risks quickly.

The project must preserve these guarantees:
- The current static SPA MUST NOT assume any protected server-side state exists.
- Any future expansion of `artifacts/api-server/` beyond `/api/healthz` MUST re-establish this threat model with explicit authentication, authorization, and input-handling guarantees before deployment.

### Spoofing

There is no account system or trusted user identity in the current application. The only spoofing-adjacent behavior is country/theme auto-detection from browser-provided or third-party-derived signals, which should influence presentation only and must not be treated as a trusted identity or authorization input.

The project must preserve these guarantees:
- Geolocation, timezone, and IP-derived country information MUST be treated as convenience hints only.
- No security decision or privileged behavior MUST depend on client-provided location or environment signals.
