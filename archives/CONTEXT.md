# AgentBlue Website — Project Context

## What it is
Marketing/landing page for **AgentBlue** — an AI automation agency targeting **Solar & HVAC** companies. Goal: convert visitors into leads via demo bookings and contact forms.

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- Framer Motion (animations)
- React Hook Form + Zod (forms)
- Cal.com `@calcom/atoms` (booking)
- Vapi AI `@vapi-ai/web` (voice calls)
- React Router v6, TanStack Query

## Current Branch
`claude/redesign-agentblue-homepage-01Qui5g3h8AsJaJtbbVAjGkQ`

## Pages
| File | Route |
|------|-------|
| `Index.tsx` | `/` — Main homepage |
| `Services.tsx` | `/services` |
| `Contact.tsx` | `/contact` |
| `About.tsx` | `/about` |
| `WatchDemo.tsx` | `/watch-demo` |

## Homepage Section Order
1. `Navigation`
2. `NewHero` — primary hero
3. `LaunchVideo`
4. `HowItWorks` — three service tiers
5. `WhyDifferent`
6. `VideoDemo` — **hidden** (`SHOW_VIDEO_DEMO = false`, enable when VSL ready)
7. `FAQ`
8. `FinalCTA`
9. `AssessmentForm`
10. `Footer`

## Other Components
`Chatbot`, `CalendarBooking`, `VoiceCallButton`, `MiniCaseStudies`, `Testimonials`, `WhoItsFor`, `WhyNotDIY`, `ProblemSection`, `ScrollIndicator`, `ScrollToTop`

## Key Notes
- `VideoDemo` is toggled off via `SHOW_VIDEO_DEMO` flag in `Index.tsx` — flip to `true` when VSL is ready
- Form required fields use `*` asterisk labels
- Cal.com handles the booking/scheduling flow
- Positioning: Solar/HVAC focused, AI automation agency
