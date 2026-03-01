# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 8080
npm run build      # Production build
npm run build:dev  # Dev-mode build
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test suite is configured.

## Environment Variables

Copy `.env.example` to `.env.local`. All variables are prefixed `VITE_` and accessed via `src/config/env.ts` — never use `import.meta.env` directly in components. Required vars:

- `VITE_VAPI_API_KEY` / `VITE_VAPI_ASSISTANT_ID` — Vapi voice AI
- `VITE_N8N_*` — n8n webhook URLs for form submissions, chatbot, call records

## Architecture

### Routing & App Shell (`src/App.tsx`)
All pages are **lazy-loaded** via `React.lazy`. Two global components mount outside the route tree: `Chatbot` and `VoiceCallButton`, each wrapped in an `ErrorBoundary`. Routes: `/`, `/about`, `/services`, `/contact`, `/watch-demo`.

### Homepage (`src/pages/Index.tsx`)
Sections render in fixed order. `SHOW_VIDEO_DEMO = false` flag gates the `VideoDemo` section — flip to `true` when the VSL video is ready.

### Feature Components (`src/components/features/`)
Self-contained feature modules with their own internal structure:
- **`chatbot/`** — AI chat widget powered by n8n webhook, with session persistence in localStorage
- **`voice-call/`** — Vapi AI voice call flow with a multi-step modal sequence (email lookup → lead form → confirmation → call → feedback)

### Services (`src/services/`)
- **`api/client.ts`** — Base fetch wrapper
- **`api/vapi.ts`** — Vapi SDK integration
- **`api/webhooks.ts`** — All n8n webhook calls (eligibility check, profile save, contact form, chatbot)
- **`storage/localStorage.ts`** — Typed wrappers around localStorage using `STORAGE_KEYS` from constants

### Configuration (`src/config/`)
- **`env.ts`** — Single source for all `import.meta.env` access; exports typed `ENV` object
- **`constants.ts`** — App-wide constants: `CALL_CONSTANTS`, `MODAL_STATES`, `STORAGE_KEYS`, `CHATBOT_CONFIG`, `COUNTRY_CODES`, `ROLES`

### Styling
Tailwind with CSS custom properties for theming. Custom brand colors defined as CSS vars and extended in `tailwind.config.ts`: `electric-blue`, `deep-navy`, `slate-blue`. Dark mode uses the `class` strategy. Animations via `tailwindcss-animate` + Framer Motion.

### Path Alias
`@/` maps to `src/` — use this for all internal imports.
