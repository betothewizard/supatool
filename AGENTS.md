# Supatool — AI Agent Instructions & Architecture

`supatool` is a browser developer tools & productivity extension built with **WXT** (Manifest V3) and **React 19** (Material UI v9).

---

## 1. Workspace Context & Relations

- `supatool` is an independent sibling repository located at `../supatool`.
- Shared operational memory, conventions, and infrastructure port tables live in `../flow`.
- Dev Server Port: **`3204`**

---

## 2. Tech Stack & Architecture

- **Extension Framework**: [WXT](https://wxt.dev/) v0.20+
- **UI Framework**: React 19 (`@mui/material` v9, Emotion)
- **Package Manager**: pnpm workspace (`apps/extension`)

```text
supatool/
├── package.json
├── pnpm-workspace.yaml
└── apps/
    └── extension/
        ├── wxt.config.ts             # WXT manifest, modules & build configuration
        └── src/
            ├── entrypoints/
            │   ├── background.ts     # MV3 service worker (coordinates tabs & domain whitelist)
            │   ├── focus-anti-detect.content.ts # MAIN-world injected script for visibility / focus emulation
            │   └── popup/            # Extension popup React app (MUI)
            ├── features/
            │   ├── focus-anti-detect/ # Focus emulation engine, storage state, and UI card
            │   └── clear-site-data/  # Domain data purge card UI
            └── utils/                # Active tab query helpers
```

---

## 3. Development Commands

Always run commands inside `apps/extension` or from the repository root:

```bash
cd apps/extension

# Start dev server with hot-reload (auto-launches Chrome)
pnpm dev

# Build production bundle (outputs to .output/chrome-mv3)
pnpm build

# Run TypeScript compiler checks
pnpm compile
```

---

## 4. Key Engineering Invariants

1. **MAIN World Execution**:
   - Tab focus/visibility keep-alive hooks (`document.hidden`, `document.visibilityState`, `document.hasFocus`, `blur`, `visibilitychange`) **must** be executed in the `MAIN` world so webpage scripts receive the emulated focus state directly.
2. **Jira Task Prefix**:
   - Jira issues for Supatool use prefix `[s]` (e.g. `[s] Add domain whitelist export`). Do not use `[s]` in Git commit messages; use standard ticket keys (e.g. `[WB-xxx]`).
