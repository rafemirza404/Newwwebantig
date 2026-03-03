// ─────────────────────────────────────────────────────
// Central mock data for demo mode (NEXT_PUBLIC_DEMO_MODE=true)
// ─────────────────────────────────────────────────────

export const DEMO_USER = {
    id: "demo-user-001",
    email: "mirza@agentblue.ai",
    user_metadata: { full_name: "Mirza Rafe", company_name: "AgentBlue" },
};

export const DEMO_PROFILE = {
    id: "demo-user-001",
    full_name: "Mirza Rafe",
    company_name: "AgentBlue",
    email: "mirza@agentblue.ai",
    user_type: "agency_owner" as const,
    has_agency: true,
    industry: "solar",
    plan: "growth",
    stripe_id: "cus_demo_123",
};

export const DEMO_WORKSPACE = {
    id: "ws-demo-001",
    name: "AgentBlue Agency",
    owner_id: "demo-user-001",
    plan: "growth",
    stripe_customer_id: "cus_ws_demo",
    logo_url: null,
    brand_color: "#4D88FF",
};

export const DEMO_CLIENTS = [
    { id: "cl-001", business_name: "Greenlight Solar", contact_email: "tom@greenlightsolar.com", industry: "solar", company_size: "11-50", created_at: "2026-01-15T10:00:00Z" },
    { id: "cl-002", business_name: "Arctic HVAC Solutions", contact_email: "sarah@arctichvac.com", industry: "hvac", company_size: "51-200", created_at: "2026-01-20T10:00:00Z" },
    { id: "cl-003", business_name: "SunPeak Energy", contact_email: "raj@sunpeak.io", industry: "solar", company_size: "1-10", created_at: "2026-01-28T10:00:00Z" },
    { id: "cl-004", business_name: "ClearAir Comfort", contact_email: "lisa@clearair.com", industry: "hvac", company_size: "11-50", created_at: "2026-02-02T10:00:00Z" },
    { id: "cl-005", business_name: "BrightWatt Installs", contact_email: "daniel@brightwatt.co", industry: "solar", company_size: "51-200", created_at: "2026-02-05T10:00:00Z" },
    { id: "cl-006", business_name: "ProTemp Services", contact_email: "jen@protemp.com", industry: "hvac", company_size: "11-50", created_at: "2026-02-10T10:00:00Z" },
    { id: "cl-007", business_name: "SolarEdge Pros", contact_email: "mike@solaredge.pro", industry: "solar_hvac", company_size: "200+", created_at: "2026-02-15T10:00:00Z" },
    { id: "cl-008", business_name: "HomeTech HVAC", contact_email: "anita@hometech.com", industry: "home_services", company_size: "1-10", created_at: "2026-02-22T10:00:00Z" },
];

// Direct user audits — no workspace, tied to user_id only
export const DEMO_DIRECT_AUDITS = [
    { id: "au-dir-001", business_name: "AgentBlue", status: "complete", mode: "saas", started_at: "2026-01-10T10:00:00Z", completed_at: "2026-01-10T11:00:00Z", question_count: 15, workspace_id: null, user_id: "demo-user-001" },
    { id: "au-dir-002", business_name: "AgentBlue", status: "in_progress", mode: "saas", started_at: "2026-02-20T10:00:00Z", completed_at: null, question_count: 7, workspace_id: null, user_id: "demo-user-001" },
];

// Agency audits — tied to workspace_id, run for clients
export const DEMO_AGENCY_AUDITS = [
    { id: "au-001", business_name: "Greenlight Solar", status: "complete", mode: "solar", started_at: "2026-01-16T10:00:00Z", completed_at: "2026-01-16T11:00:00Z", question_count: 15, workspace_id: "ws-demo-001", user_id: "demo-user-001" },
    { id: "au-002", business_name: "Arctic HVAC Solutions", status: "complete", mode: "hvac", started_at: "2026-01-22T10:00:00Z", completed_at: "2026-01-22T11:30:00Z", question_count: 15, workspace_id: "ws-demo-001", user_id: "demo-user-001" },
    { id: "au-003", business_name: "SunPeak Energy", status: "in_progress", mode: "solar", started_at: "2026-02-01T10:00:00Z", completed_at: null, question_count: 8, workspace_id: "ws-demo-001", user_id: "demo-user-001" },
    { id: "au-004", business_name: "ClearAir Comfort", status: "complete", mode: "hvac", started_at: "2026-02-05T10:00:00Z", completed_at: "2026-02-05T12:00:00Z", question_count: 15, workspace_id: "ws-demo-001", user_id: "demo-user-001" },
    { id: "au-005", business_name: "BrightWatt Installs", status: "processing", mode: "solar", started_at: "2026-02-18T10:00:00Z", completed_at: null, question_count: 15, workspace_id: "ws-demo-001", user_id: "demo-user-001" },
    { id: "au-006", business_name: "ProTemp Services", status: "in_progress", mode: "hvac", started_at: "2026-02-25T10:00:00Z", completed_at: null, question_count: 4, workspace_id: "ws-demo-001", user_id: "demo-user-001" },
];

// Combined — for pages that don't need to differentiate (e.g. analytics)
export const DEMO_AUDITS = [...DEMO_DIRECT_AUDITS, ...DEMO_AGENCY_AUDITS];

export const DEMO_REPORTS = [
    {
        id: "rp-001",
        user_id: "demo-user-001",
        session_id: "au-001",
        overall_score: 72,
        function_scores: { sales: 80, marketing: 65, operations: 70, finance: 75, hr: 60, customer_service: 82, technology: 68, strategy: 74 },
        gaps_preview: ["No CRM automation", "Manual lead routing", "No follow-up sequences"],
        full_gaps: [
            { name: "No CRM automation", severity: "high" },
            { name: "Manual lead routing", severity: "high" },
            { name: "No follow-up sequences", severity: "medium" },
            { name: "Paper-based invoicing", severity: "medium" },
        ],
        business_summary: "Greenlight Solar is a fast-growing solar installation company with strong customer service but significant gaps in sales automation.",
        solutions: [
            { name: "Deploy HubSpot with automated pipeline stages and deal tracking.", hrs: 12, type: "quick_win", locked: false },
            { name: "Set up round-robin lead assignment with instant SMS notifications.", hrs: 8, type: "quick_win", locked: false },
        ],
        roi_analysis: { total_hrs_saved: 20, total_cost_saved_usd: 3200, payback_months: 2, automation_score_improvement: 15 },
        created_at: "2026-01-16T12:00:00Z",
        audit_sessions: { id: "au-001", business_name: "Greenlight Solar", industry: "solar" },
    },
    {
        id: "rp-002",
        user_id: "demo-user-001",
        overall_score: 58,
        function_scores: { sales: 50, marketing: 45, operations: 65, finance: 70, hr: 55, customer_service: 60, technology: 48, strategy: 52 },
        gaps_preview: ["Manual scheduling", "No customer portal", "Outdated CRM"],
        full_gaps: [
            { name: "Manual scheduling", severity: "high" },
            { name: "No customer portal", severity: "high" },
            { name: "Outdated CRM", severity: "medium" },
            { name: "No automated dispatching", severity: "high" },
            { name: "Manual quote generation", severity: "medium" },
        ],
        created_at: "2026-01-22T12:00:00Z",
        audit_sessions: { id: "au-002", business_name: "Arctic HVAC Solutions", industry: "hvac" },
    },
    {
        id: "rp-003",
        user_id: "demo-user-001",
        overall_score: 81,
        function_scores: { sales: 85, marketing: 78, operations: 82, finance: 80, hr: 75, customer_service: 88, technology: 82, strategy: 79 },
        gaps_preview: ["No AI chatbot", "Manual onboarding"],
        full_gaps: [
            { name: "No AI chatbot", severity: "medium" },
            { name: "Manual onboarding", severity: "low" },
        ],
        created_at: "2026-02-05T12:00:00Z",
        audit_sessions: { id: "au-004", business_name: "ClearAir Comfort", industry: "hvac" },
    },
    {
        id: "rp-004",
        user_id: "demo-user-001",
        overall_score: 45,
        function_scores: { sales: 35, marketing: 40, operations: 55, finance: 50, hr: 38, customer_service: 42, technology: 30, strategy: 48 },
        gaps_preview: ["No digital presence", "No automation tools", "Manual everything"],
        full_gaps: [
            { name: "No digital presence", severity: "high" },
            { name: "No automation tools", severity: "high" },
            { name: "Manual everything", severity: "high" },
            { name: "No data analytics", severity: "high" },
            { name: "Spreadsheet-based accounting", severity: "medium" },
            { name: "No employee training program", severity: "medium" },
        ],
        created_at: "2026-02-20T12:00:00Z",
        audit_sessions: { id: "au-005", business_name: "BrightWatt Installs", industry: "solar" },
    },
];

export const DEMO_IMPL_ITEMS = [
    { id: "impl-001", gap_name: "Implement CRM automation (HubSpot/Salesforce)", priority: "quick_win", time_saved_hrs: 12, status: "done" },
    { id: "impl-002", gap_name: "Set up automated lead routing workflow", priority: "quick_win", time_saved_hrs: 8, status: "done" },
    { id: "impl-003", gap_name: "Deploy AI-powered follow-up email sequences", priority: "medium", time_saved_hrs: 6, status: "in_progress" },
    { id: "impl-004", gap_name: "Migrate invoicing to automated platform", priority: "medium", time_saved_hrs: 5, status: "pending" },
    { id: "impl-005", gap_name: "Build customer self-service portal", priority: "strategic", time_saved_hrs: 15, status: "pending" },
];

export const DEMO_TEAM_MEMBERS = [
    { id: "tm-001", role: "owner", created_at: "2025-12-01T10:00:00Z", profiles: { full_name: "Mirza Rafe", email: "mirza@agentblue.ai" } },
    { id: "tm-002", role: "admin", created_at: "2026-01-10T10:00:00Z", profiles: { full_name: "Sophia Chen", email: "sophia@agentblue.ai" } },
    { id: "tm-003", role: "member", created_at: "2026-02-05T10:00:00Z", profiles: { full_name: "Alex Johnson", email: "alex@agentblue.ai" } },
];

export const DEMO_PENDING_INVITES = [
    { id: "inv-001", email: "newhire@agentblue.ai", role: "member", created_at: "2026-02-20T10:00:00Z", expires_at: "2026-03-20T10:00:00Z" },
    { id: "inv-002", email: "partner@solaragency.com", role: "admin", created_at: "2026-02-25T10:00:00Z", expires_at: "2026-03-25T10:00:00Z" },
];

// Helper: is demo mode on?
export const isDemoMode = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";
