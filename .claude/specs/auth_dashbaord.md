PRODUCT CONTEXT & VISION: 
Read this carefully to understand exactly WHAT we are building before writing any code.

THE BIG PICTURE:
We are building an "AI-Powered Business Automation Audit" feature embedded directly into my existing Next.js website. The goal of this tool is to act as a virtual high-end business consultant. It will interview business owners, identify their operational bottlenecks, and generate a highly detailed, personalized "Automation Blueprint" report showing them exactly how to save time and money using AI and automation.

THE USER JOURNEY (THE FUNNEL):
1. The Hook (/audit): The user lands on our site, sees the value proposition, and clicks "Start Free Audit".
2. Authentication (/audit/auth): They create an account or log in via Google/Email.
3. The Interview (/audit/session): Instead of a boring form, they enter a sleek, conversational interface. An AI agent asks them one targeted business question at a time (approx. 15-20 questions total) based on their previous answers.
4. The Analysis (/audit/processing): Once the interview is complete, the user sees a "Processing" screen. In the background, our AI pipeline is identifying gaps, matching them to real-world case studies using RAG (pgvector), calculating ROI, and generating Mermaid.js workflow diagrams.
5. The Reveal & Paywall (/audit/report/[id]): The user gets their customized web report.

THE BUSINESS MODEL (THE FREEMIUM GATE):
This is crucial for the UI/UX you will build. 
- FREE TIER: The user gets a high-level summary, sees how many "gaps" we found, but we only reveal ONE full gap, ONE solution, and ONE Mermaid.js diagram as a teaser. The rest is blurred or locked. 
- PREMIUM TIER: If they pay via Stripe, the page unlocks dynamically to reveal the full step-by-step automation roadmap, all Mermaid Before/After diagrams, and exact ROI calculations.
- CTA: Both versions heavily push the user to "Book a Free Strategy Call" via a Cal.com embed/link.

THE AI ARCHITECTURE (BACKGROUND CONTEXT):
Later, we will build 4 distinct AI agents to power this:
- Agent 1 (Question Engine): Drives the conversational UI.
- Agent 2 (Analysis Engine): Finds the bottlenecks.
- Agent 3 (Solution Mapper): Uses vector search to find relevant case studies.
- Agent 4 (Report Builder): Formats the final JSON and writes Mermaid.js diagram code.

YOUR GOAL AS MY AI DEV:
Right now, we are focusing on the FRONTEND UI and SUPABASE DB wire-up. I need you to keep this premium, consulting-firm vibe in mind. Every interaction, loading state, and layout should feel expensive, trustworthy, and highly polished.





Build the authentication page for the audit tool 

FUNCTIONAL REQUIREMENTS:
- Integrate Supabase Auth for both Sign Up and Sign In.
- Include a "Continue with Google" OAuth button.
- Include an Email and Password form (with a toggle to switch between "Sign In" and "Create Account").
- On successful authentication, redirect the user to `/audit/dashboard`.
- Include error handling (e.g., invalid credentials) displayed as subtle toast notifications or red text below the inputs.

DESIGN & UI CONTEXT:
- Vibe: Premium, trustworthy B2B SaaS. It should feel like a high-end enterprise consulting tool.
- Layout: A clean, centered authentication card taking up a max-width of `sm` or `md` on a subtle gray or off-white background (`bg-slate-50` or similar). 
- Components (Use shadcn/ui): Use `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`. Use `Input` and `Label` for the form fields, and `Button` for the submit actions.
- Typography: Keep headings crisp (e.g., "Welcome back", "Start your free automation audit").
- Visuals: Use a `Separator` with "OR" text between the OAuth button and the email form. Make the Google button a secondary/outline style with a Google icon.


Here is the prompt you should give Claude Code before asking it to build the pages. This instructs the agent to actively scan your existing codebase and extract your brand's DNA (colors, typography, component styles) so the new /audit features look native to your app.

Copy & paste this into Claude Code:

code
Text
download
content_copy
expand_less
Before we start building the new /audit pages, I need you to completely adopt the design system and visual style of my existing project. 

Please do the following:
1. Read my `tailwind.config.ts` (or `.js`), `app/globals.css`, and my main landing page (likely `app/page.tsx` or similar) to understand my current color palette, typography, and spacing.
2. Analyze the "Hero Section" of my main landing page specifically. Note the background colors/gradients, heading sizes, font weights, button hover states, border radii, and drop shadows.
3. Understand how my shadcn/ui or existing custom components are styled (e.g., are we using sharp corners or rounded? flat design or soft shadows? muted borders?).

DESIGN RULES FOR ALL NEW AUDIT PAGES:
- Ensure all new pages (`/audit/auth`, `/audit/dashboard`, etc.) feel like a natural extension of my current site's Hero section.
- Do not introduce random new Tailwind colors (like blue-500 or indigo-600) if they aren't in my existing palette. Use my CSS variables (e.g., `bg-primary`, `text-muted-foreground`) or specific Tailwind brand colors.
- Match the exact padding, max-widths, and responsive behavior (mobile-first) used in my main layouts.
- When generating shadcn/ui components (like Cards, Buttons, Inputs), override their default styles if necessary so they perfectly match my site's existing aesthetic.

Reply with a quick summary of the primary colors, font styles, and general "vibe" you detected from my codebase, and confirm you will use these for the new features.
Why this works specifically for Claude Code:

Forces Context Reading: It makes Claude physically open and read your config and landing page files before generating UI code.

Prevents "Default UI" Syndrome: AI agents love defaulting to standard, boring Tailwind colors (like standard blue/gray) and default shadcn styles. This explicitly forbids that.

Validation Step: By asking for a summary at the end, you force Claude to prove it actually understood your brand colors before it starts writing the Next.js pages.


