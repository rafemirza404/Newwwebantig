import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type {
  Gap,
  Solution,
  RoiAnalysis,
  FunctionScore,
  BusinessProfile,
  TotalRoiSummary,
  Roadmap,
} from "../page";

export interface ReportPDFData {
  overallScore: number;
  businessSummary: string;
  businessProfile: BusinessProfile | null;
  functionScores: Record<string, FunctionScore>;
  gaps: Gap[];
  gapNarrative: string | null;
  solutions: Solution[];
  roiAnalysis: RoiAnalysis;
  totalRoiSummary: TotalRoiSummary | null;
  roadmap: Roadmap | null;
  industry: string | null;
  createdAt: string;
}

interface Props {
  reportData: ReportPDFData;
  businessName: string;
  diagramImages: string[];
}

const C = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  dark: "#0B0F1A",
  darkSecondary: "#141B2D",
  text: "#111827",
  textSec: "#6B7280",
  textMuted: "#9CA3AF",
  white: "#FFFFFF",
  bg: "#F9FAFB",
  border: "#E5E7EB",
  high: "#EF4444",
  highBg: "#FEF2F2",
  med: "#F59E0B",
  medBg: "#FFFBEB",
  low: "#10B981",
  lowBg: "#ECFDF5",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    fontFamily: "Helvetica",
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 10,
    color: C.text,
  },
  coverPage: {
    backgroundColor: C.dark,
    fontFamily: "Helvetica",
    padding: 0,
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.text,
    marginBottom: 6,
  },
  sectionAccent: {
    width: 36,
    height: 3,
    backgroundColor: C.primary,
    borderRadius: 2,
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 10,
    color: C.textSec,
    marginBottom: 20,
    lineHeight: 1.5,
  },
  card: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  badge: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 3,
    paddingBottom: 3,
    borderRadius: 99,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  scoreBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: C.border,
    borderRadius: 3,
    marginLeft: 8,
    marginRight: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginRight: 8,
  },
  metricValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
  },
  metricLabel: {
    fontSize: 8,
    color: C.textSec,
    textAlign: "center",
    marginTop: 4,
  },
  footerText: {
    fontSize: 8,
    color: C.textMuted,
  },
});

function Footer({ businessName }: { businessName: string }) {
  return (
    <View
      fixed
      style={{
        position: "absolute",
        bottom: 20,
        left: 48,
        right: 48,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Text style={s.footerText}>AgentBlue · {businessName} AI Audit Report</Text>
      <Text style={s.footerText} render={({ pageNumber }) => `Page ${pageNumber}`} />
    </View>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionAccent} />
      {sub && <Text style={s.sectionSub}>{sub}</Text>}
    </View>
  );
}

function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  const map = {
    high: { bg: C.highBg, color: C.high, label: "HIGH" },
    medium: { bg: C.medBg, color: C.med, label: "MEDIUM" },
    low: { bg: C.lowBg, color: C.low, label: "LOW" },
  };
  const { bg, color, label } = map[severity];
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={{ color, fontSize: 8, fontFamily: "Helvetica-Bold" }}>{label}</Text>
    </View>
  );
}

function TypeBadge({ type }: { type: "quick_win" | "medium" | "strategic" }) {
  const map = {
    quick_win: { bg: C.lowBg, color: C.low, label: "QUICK WIN" },
    medium: { bg: C.medBg, color: C.med, label: "MEDIUM TERM" },
    strategic: { bg: C.primaryLight, color: C.primary, label: "STRATEGIC" },
  };
  const { bg, color, label } = map[type];
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={{ color, fontSize: 8, fontFamily: "Helvetica-Bold" }}>{label}</Text>
    </View>
  );
}

export default function ReportPDF({ reportData, businessName, diagramImages }: Props) {
  const {
    overallScore,
    businessSummary,
    businessProfile,
    functionScores,
    gaps,
    gapNarrative,
    solutions,
    roiAnalysis,
    totalRoiSummary,
    roadmap,
    industry,
    createdAt,
  } = reportData;

  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const scoreColor =
    overallScore >= 70 ? C.low : overallScore >= 40 ? C.med : C.high;

  return (
    <Document title={`${businessName} AI Audit Report`} author="AgentBlue">

      {/* ── Cover Page ── */}
      <Page size="A4" style={s.coverPage}>
        {/* Top bar */}
        <View style={{ padding: 48, paddingBottom: 24 }}>
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: C.primary, letterSpacing: 1 }}>
            AGENTBLUE
          </Text>
          <Text style={{ fontSize: 9, color: "#64748B", marginTop: 3, letterSpacing: 0.5 }}>
            AI Readiness Audit Report
          </Text>
        </View>

        {/* Hero */}
        <View style={{ backgroundColor: C.darkSecondary, padding: 48, flex: 1 }}>
          <Text style={{ fontSize: 30, fontFamily: "Helvetica-Bold", color: C.white, lineHeight: 1.2 }}>
            {businessName}
          </Text>
          <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 10 }}>
            {industry ? `${industry}  ·  ` : ""}{date}
          </Text>

          {/* Score */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 36 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: scoreColor,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 28, fontFamily: "Helvetica-Bold", color: C.white }}>
                {overallScore}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 20 }}>
              <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: C.white }}>
                AI Readiness Score
              </Text>
              <Text style={{ fontSize: 10, color: "#CBD5E1", marginTop: 8, lineHeight: 1.6 }}>
                {businessSummary.slice(0, 220)}{businessSummary.length > 220 ? "…" : ""}
              </Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: "row", marginTop: 36 }}>
            <View style={{ marginRight: 32 }}>
              <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white }}>{gaps.length}</Text>
              <Text style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>Gaps Identified</Text>
            </View>
            <View style={{ marginRight: 32 }}>
              <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white }}>{solutions.length}</Text>
              <Text style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>Solutions</Text>
            </View>
            {totalRoiSummary && (
              <View>
                <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white }}>
                  ${(totalRoiSummary.total_cost_saved_per_year / 1000).toFixed(0)}k
                </Text>
                <Text style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>Est. Annual Savings</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={{ padding: 24, paddingLeft: 48, paddingRight: 48, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#1E293B" }}>
          <Text style={{ fontSize: 9, color: "#475569" }}>Confidential · Generated by AgentBlue</Text>
          <Text style={{ fontSize: 9, color: "#475569" }}>{date}</Text>
        </View>
      </Page>

      {/* ── Business Snapshot ── */}
      {businessProfile && (
        <Page size="A4" style={s.page}>
          <SectionHeader
            title="Business Snapshot"
            sub="Overview of your business profile captured during the audit."
          />

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {[
              ["Business Model", businessProfile.business_model],
              ["Revenue Stage", businessProfile.revenue_stage],
              ["Team Structure", businessProfile.team_structure],
              ["Primary Services", businessProfile.primary_services_or_products],
              ["Company Size", businessProfile.company_size ?? "—"],
              ["Industry", businessProfile.industry],
            ].map(([label, val]) => (
              <View
                key={label}
                style={{
                  width: "47%",
                  backgroundColor: C.bg,
                  borderRadius: 8,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: C.border,
                  marginBottom: 8,
                  marginRight: "3%",
                }}
              >
                <Text style={{ fontSize: 8, color: C.textMuted, marginBottom: 4 }}>{label?.toUpperCase()}</Text>
                <Text style={{ fontSize: 10, color: C.text, fontFamily: "Helvetica-Bold" }}>{val}</Text>
              </View>
            ))}
          </View>

          {businessProfile.current_tool_stack?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 9, color: C.textMuted, marginBottom: 8 }}>CURRENT TOOL STACK</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {businessProfile.current_tool_stack.map((tool) => (
                  <View
                    key={tool}
                    style={{
                      backgroundColor: C.primaryLight,
                      borderRadius: 99,
                      paddingLeft: 10,
                      paddingRight: 10,
                      paddingTop: 4,
                      paddingBottom: 4,
                      marginRight: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 9, color: C.primary, fontFamily: "Helvetica-Bold" }}>{tool}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {businessProfile.key_business_context && (
            <View style={{ marginTop: 16, backgroundColor: C.bg, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: C.border }}>
              <Text style={{ fontSize: 8, color: C.textMuted, marginBottom: 6 }}>KEY BUSINESS CONTEXT</Text>
              <Text style={{ fontSize: 10, color: C.textSec, lineHeight: 1.6 }}>
                {businessProfile.key_business_context}
              </Text>
            </View>
          )}

          <Footer businessName={businessName} />
        </Page>
      )}

      {/* ── AI Readiness Scores ── */}
      <Page size="A4" style={s.page}>
        <SectionHeader
          title="AI Readiness Scores"
          sub="Breakdown of your AI readiness across key business functions."
        />

        {/* Overall score card */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.bg,
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: C.border,
        }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: scoreColor,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 20,
          }}>
            <Text style={{ fontSize: 24, fontFamily: "Helvetica-Bold", color: C.white }}>{overallScore}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", color: C.text }}>Overall Score</Text>
            <Text style={{ fontSize: 10, color: C.textSec, marginTop: 4, lineHeight: 1.5 }}>
              {businessSummary.slice(0, 280)}{businessSummary.length > 280 ? "…" : ""}
            </Text>
          </View>
        </View>

        {/* Function score bars */}
        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: C.text, marginBottom: 14 }}>
          Score by Business Function
        </Text>
        {Object.entries(functionScores).map(([key, val]) => {
          const score = typeof val === "number" ? val : val.score ?? 0;
          const displayKey = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const barColor = score >= 70 ? C.low : score >= 40 ? C.med : C.high;
          return (
            <View key={key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: 9, color: C.text, width: 130 }}>{displayKey}</Text>
              <View style={s.scoreBarBg}>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: barColor, width: `${score}%` }} />
              </View>
              <Text style={{ fontSize: 9, color: C.textSec, width: 50, textAlign: "right" }}>{score}/100</Text>
            </View>
          );
        })}

        <Footer businessName={businessName} />
      </Page>

      {/* ── Key Gaps ── */}
      {gaps.length > 0 && (
        <Page size="A4" style={s.page}>
          <SectionHeader
            title="Key Gaps Identified"
            sub={`${gaps.length} gaps were identified in your current AI readiness.`}
          />

          {gapNarrative && (
            <View style={{
              backgroundColor: C.primaryLight,
              borderRadius: 8,
              padding: 14,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: "#C7D2FE",
            }}>
              <Text style={{ fontSize: 8, color: C.primary, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
                AI ANALYSIS
              </Text>
              <Text style={{ fontSize: 10, color: "#3730A3", lineHeight: 1.6 }}>
                {gapNarrative.slice(0, 400)}{gapNarrative.length > 400 ? "…" : ""}
              </Text>
            </View>
          )}

          {gaps.map((gap, i) => (
            <View key={i} style={s.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: C.text, flex: 1, marginRight: 8 }}>
                  {i + 1}. {gap.name}
                </Text>
                <SeverityBadge severity={gap.severity} />
              </View>
              <Text style={{ fontSize: 10, color: C.textSec, lineHeight: 1.5, marginBottom: 8 }}>
                {gap.description}
              </Text>
              {(gap.estimated_annual_cost || gap.time_cost_per_week_hours) && (
                <View style={{ flexDirection: "row" }}>
                  {gap.estimated_annual_cost ? (
                    <Text style={{ fontSize: 9, color: C.high, marginRight: 16 }}>
                      Est. Cost: ${gap.estimated_annual_cost.toLocaleString()}/yr
                    </Text>
                  ) : null}
                  {gap.time_cost_per_week_hours ? (
                    <Text style={{ fontSize: 9, color: C.med }}>
                      {gap.time_cost_per_week_hours}h/week lost
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          ))}

          <Footer businessName={businessName} />
        </Page>
      )}

      {/* ── Solutions ── */}
      {solutions.length > 0 && (
        <Page size="A4" style={s.page}>
          <SectionHeader
            title="Recommended Solutions"
            sub="AI-powered solutions tailored to close your identified gaps."
          />

          {solutions.map((sol, i) => (
            <View key={i} style={s.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: C.text, flex: 1, marginRight: 8 }}>
                  {sol.name}
                </Text>
                <TypeBadge type={sol.type} />
              </View>
              {sol.solution_description && (
                <Text style={{ fontSize: 10, color: C.textSec, lineHeight: 1.5, marginBottom: 8 }}>
                  {sol.solution_description}
                </Text>
              )}
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {sol.primary_tools && sol.primary_tools.length > 0 && (
                  <Text style={{ fontSize: 9, color: C.textMuted, marginRight: 16 }}>
                    Tools: {sol.primary_tools.join(", ")}
                  </Text>
                )}
                {sol.roi?.hours_saved_per_week ? (
                  <Text style={{ fontSize: 9, color: C.low, fontFamily: "Helvetica-Bold", marginRight: 16 }}>
                    {sol.roi.hours_saved_per_week}h/week saved
                  </Text>
                ) : null}
                {sol.roi?.cost_saved_per_year ? (
                  <Text style={{ fontSize: 9, color: C.low }}>
                    ${sol.roi.cost_saved_per_year.toLocaleString()}/yr
                  </Text>
                ) : null}
              </View>
            </View>
          ))}

          <Footer businessName={businessName} />
        </Page>
      )}

      {/* ── ROI Analysis ── */}
      <Page size="A4" style={s.page}>
        <SectionHeader
          title="ROI Analysis"
          sub="Projected return on investment from implementing the recommended solutions."
        />

        {/* Metrics row */}
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          {totalRoiSummary && (
            <>
              <View style={s.metricBox}>
                <Text style={s.metricValue}>{totalRoiSummary.total_hours_saved_per_week}h</Text>
                <Text style={s.metricLabel}>Hours Saved / Week</Text>
              </View>
              <View style={s.metricBox}>
                <Text style={s.metricValue}>
                  ${(totalRoiSummary.total_cost_saved_per_year / 1000).toFixed(0)}k
                </Text>
                <Text style={s.metricLabel}>Cost Saved / Year</Text>
              </View>
              <View style={[s.metricBox, { marginRight: 0 }]}>
                <Text style={s.metricValue}>{totalRoiSummary.total_setup_hours_required}h</Text>
                <Text style={s.metricLabel}>Setup Required</Text>
              </View>
            </>
          )}
          {roiAnalysis.payback_period && !totalRoiSummary && (
            <View style={[s.metricBox, { marginRight: 0 }]}>
              <Text style={s.metricValue}>{roiAnalysis.payback_period}</Text>
              <Text style={s.metricLabel}>Payback Period</Text>
            </View>
          )}
        </View>

        {/* Narrative */}
        {(roiAnalysis.roi_narrative || totalRoiSummary?.overall_roi_narrative) && (
          <View style={{ backgroundColor: C.bg, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12 }}>
            <Text style={{ fontSize: 8, color: C.textMuted, marginBottom: 8 }}>ROI NARRATIVE</Text>
            <Text style={{ fontSize: 10, color: C.textSec, lineHeight: 1.7 }}>
              {totalRoiSummary?.overall_roi_narrative ?? roiAnalysis.roi_narrative}
            </Text>
          </View>
        )}

        {roiAnalysis.potential_revenue_lift && (
          <View style={{ backgroundColor: C.lowBg, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: "#A7F3D0" }}>
            <Text style={{ fontSize: 8, color: C.low, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
              POTENTIAL REVENUE LIFT
            </Text>
            <Text style={{ fontSize: 12, color: C.text, fontFamily: "Helvetica-Bold" }}>
              {roiAnalysis.potential_revenue_lift}
            </Text>
          </View>
        )}

        <Footer businessName={businessName} />
      </Page>

      {/* ── Implementation Roadmap ── */}
      {roadmap && (
        <Page size="A4" style={s.page}>
          <SectionHeader
            title="Implementation Roadmap"
            sub="Your phased plan for implementing AI solutions."
          />

          {roadmap.intro && (
            <Text style={{ fontSize: 10, color: C.textSec, lineHeight: 1.6, marginBottom: 16 }}>
              {roadmap.intro}
            </Text>
          )}

          {[
            { label: "Quick Wins", items: roadmap.quick_wins, color: C.low, bg: C.lowBg },
            { label: "Medium Term", items: roadmap.medium_term, color: C.med, bg: C.medBg },
            { label: "Strategic Initiatives", items: roadmap.strategic, color: C.primary, bg: C.primaryLight },
          ].map(({ label, items, color, bg }) =>
            items && items.length > 0 ? (
              <View key={label} style={{ marginBottom: 16 }}>
                <View style={{ backgroundColor: bg, borderRadius: 6, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, alignSelf: "flex-start", marginBottom: 10 }}>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color }}>{label}</Text>
                </View>
                {items.map((item, i) => (
                  <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 6, paddingLeft: 8 }}>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginTop: 4, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, color: C.text, fontFamily: "Helvetica-Bold" }}>{item.solution_name}</Text>
                      <Text style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>
                        {item.gap_name}  ·  {item.estimated_setup_hours}h setup
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null
          )}

          {roadmap.closing && (
            <View style={{ backgroundColor: C.bg, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: C.border, marginTop: 8 }}>
              <Text style={{ fontSize: 10, color: C.textSec, lineHeight: 1.6 }}>{roadmap.closing}</Text>
            </View>
          )}

          <Footer businessName={businessName} />
        </Page>
      )}

      {/* ── Workflow Diagrams (screenshots) ── */}
      {diagramImages.length > 0 && (
        <Page size="A4" style={s.page}>
          <SectionHeader
            title="Automation System Diagrams"
            sub="Visual workflow diagrams for your top priority automation opportunities."
          />
          {diagramImages.map((src, i) => (
            <View key={i} style={{ marginBottom: 16 }}>
              <Image src={src} style={{ width: "100%", borderRadius: 8 }} />
            </View>
          ))}
          <Footer businessName={businessName} />
        </Page>
      )}

    </Document>
  );
}
