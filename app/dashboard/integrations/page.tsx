import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { isDemoMode } from "~/lib/mock/mockData";

interface Integration {
  id: string;
  name: string;
  description: string;
  status: "available" | "coming_soon";
  connected: boolean;
  abbr: string;
  color: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "zapier",
    name: "Zapier",
    description: "Automate workflows — trigger actions when audits complete or reports generate.",
    status: "coming_soon",
    connected: false,
    abbr: "ZAP",
    color: "#F97316",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notified in Slack when a client completes an audit or a report is ready.",
    status: "coming_soon",
    connected: false,
    abbr: "SLK",
    color: "#4ADE80",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Push client audit data and scores into your CRM automatically.",
    status: "coming_soon",
    connected: false,
    abbr: "HUB",
    color: "#F59E0B",
  },
  {
    id: "webhook",
    name: "Webhooks",
    description: "Receive real-time HTTP POST events for audit and report lifecycle events.",
    status: "coming_soon",
    connected: false,
    abbr: "WEB",
    color: "#6B7280",
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    description: "Export client scores and implementation progress to a live spreadsheet.",
    status: "coming_soon",
    connected: false,
    abbr: "GS",
    color: "#4ADE80",
  },
  {
    id: "n8n",
    name: "n8n",
    description: "Self-hosted automation — already powers our chatbot and form submissions.",
    status: "coming_soon",
    connected: false,
    abbr: "N8N",
    color: "#60A5FA",
  },
];

export default async function IntegrationsPage() {
  if (!isDemoMode()) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirectTo=/dashboard/integrations");

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type !== "agency_owner") redirect("/dashboard");
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-foreground text-[28px] font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect AgentBlue to your existing tools and workflows
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.id}
            className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6 flex flex-col gap-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center text-sm font-bold tracking-wide shadow-sm"
                  style={{ backgroundColor: `${integration.color}20`, color: integration.color }}
                >
                  {integration.abbr}
                </div>
                <div>
                  <p className="text-foreground font-semibold text-[15px]">{integration.name}</p>
                  {integration.status === "coming_soon" && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
              {integration.connected && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  Connected
                </span>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed flex-1">{integration.description}</p>

            <button
              disabled={integration.status === "coming_soon" || integration.connected}
              className={`w-full py-2.5 rounded-full text-sm font-semibold transition-colors mt-2 ${integration.connected
                ? "bg-primary/10 text-primary border border-primary/20 cursor-default"
                : integration.status === "coming_soon"
                  ? "bg-secondary text-muted-foreground border border-border/50 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                }`}
            >
              {integration.connected
                ? "Connected"
                : integration.status === "coming_soon"
                  ? "Coming Soon"
                  : "Connect"}
            </button>
          </div>
        ))}
      </div>

      {/* API key section */}
      <div className="mt-8 bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6">
        <h2 className="text-foreground font-semibold mb-2">API Access</h2>
        <p className="text-muted-foreground text-sm mb-5">
          Use the AgentBlue REST API to trigger audits, fetch reports, and manage clients programmatically.
        </p>
        <div className="flex gap-4">
          <input
            type="text"
            value="sk_••••••••••••••••••••••"
            readOnly
            className="flex-1 bg-secondary border-transparent rounded-xl px-4 py-2.5 text-muted-foreground text-sm font-mono opacity-70 cursor-not-allowed"
          />
          <button
            className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-full transition-colors flex-shrink-0"
            disabled
          >
            Reveal Key
          </button>
        </div>
        <p className="text-muted-foreground/60 text-xs mt-3 uppercase tracking-wider font-semibold">API access available on Scale plan — coming soon</p>
      </div>
    </div>
  );
}
