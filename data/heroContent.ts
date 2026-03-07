export const heroContent = {
    h1: {
        start: "Find Automation Gaps",
        end: "Costing You Thousands",
    },
    subtitle: "Stop leaving money on the table with gaps you can't see.",
    paragraph: "The only AI audit for growing businesses — 8 functions diagnosed, solutions mapped, ROI calculated, in under 10 minutes.",
    checklist: [
        "Diagnose 8 functions instantly",
        "AI solutions with ROI analysis",
        "Full roadmap in 10 minutes",
    ],
    microcopy: "Free audit • No credit card required",
    promptBubble: "What automation gaps are costing my business the most?",
    floatingCards: [
        {
            id: "profiler",
            name: "Business Profiler",
            // position + z-index only — visual treatment handled in FloatingCards
            positionClass: "top-[8px] right-[-6px] xl:right-[6px] z-0",
            content: "Business profile captured across 8 key functions...\n\nScan Complete\n• Marketing: High manual workload detected\n• Sales: 4 automation gaps flagged",
            logoColor: "text-[#D97757]",
        },
        {
            id: "gap-analyzer",
            name: "Gap Analyzer",
            positionClass: "left-[4px] top-[165px] z-10",
            content: "Revenue Impact Ranking\n\n• Email follow-up: Manual — $1,800/mo lost\n• Lead scoring: Not configured, 40% drop-off\n• CRM sync: Disconnected tools detected...",
            logoColor: "text-[#22B8CD]",
        },
        {
            id: "report",
            name: "Audit Report",
            positionClass: "right-[4px] top-[285px] xl:right-[18px] z-20",
            content: "Your Top AI Audit Findings\n\n1. Marketing Automation\n• Impact: $2,400/mo opportunity\n• Tool: ActiveCampaign or HubSpot\n• Timeline: 1–2 weeks to implement",
            logoColor: "text-[#FFFFFF]",
        }
    ],
    navLinks: [
        { label: "Solutions", href: "#",       hasChildren: true  },
        { label: "Resources", href: "#",       hasChildren: true  },
        { label: "Company",   href: "#",       hasChildren: true  },
        { label: "Pricing",   href: "/pricing", hasChildren: false },
    ]
};
