"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, ArrowUpRight, ListFilter, User } from "lucide-react";
import { AgencyGrowthChart } from "~/components/dashboard/agency/AgencyGrowthChart";

interface Client {
  id: string;
  business_name: string;
  industry: string | null;
  created_at: string;
}

interface AuditSession {
  id: string;
  business_name: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

interface AgencyDashboardProps {
  firstName: string;
  email?: string;
  activeClients: number;
  pendingAudits: number;
  clients: Client[];
  recentAudits: AuditSession[];
  workspaceId?: string;
  hasAgency?: boolean;
  currentMode?: "direct" | "agency_owner";
}

const TABS = ["All", "Active", "Pending", "Completed", "Abandoned", "Reports", "Archived"] as const;
type TabKey = "Clients" | typeof TABS[number];

// Map audit statuses to tab filter values
const STATUS_MAP: Record<string, string[]> = {
  Active: ["in_progress"],
  Pending: ["processing"],
  Completed: ["complete"],
  Abandoned: ["abandoned"],
  Archived: ["archived"],
};

export default function AgencyDashboard({
  firstName,
  email = "",
  activeClients,
  pendingAudits,
  clients,
  recentAudits,
  workspaceId,
  hasAgency,
  currentMode = "agency_owner",
}: AgencyDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("Clients");
  const [searchQuery, setSearchQuery] = useState("");

  // Demo numbers
  const totalInPipeline = clients.length * 2500;
  const closedDeals = clients.length * 850;
  const closedRatio = clients.length > 0 ? Math.min(100, (activeClients / clients.length) * 100) : 0;

  // Filter clients by tab and search query
  const tabFilteredAudits = (() => {
    if (activeTab === "Clients" || activeTab === "All") return recentAudits;
    const statuses = STATUS_MAP[activeTab];
    if (statuses) return recentAudits.filter((a) => statuses.includes(a.status));
    return recentAudits;
  })();

  const visibleAudits = searchQuery
    ? tabFilteredAudits.filter((a) =>
      a.business_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : tabFilteredAudits;

  // Filter clients table for search
  const visibleClients = searchQuery
    ? clients.filter((c) =>
      c.business_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : clients;

  // Count badges for tabs
  const tabCounts: Record<string, number> = {
    All: recentAudits.length,
    Active: recentAudits.filter((a) => a.status === "in_progress").length,
    Pending: recentAudits.filter((a) => a.status === "processing").length,
    Completed: recentAudits.filter((a) => a.status === "complete").length,
    Abandoned: recentAudits.filter((a) => a.status === "abandoned").length,
    Archived: recentAudits.filter((a) => a.status === "archived").length,
  };

  // Whether we're showing audits view or clients view
  const showingAudits = activeTab !== "Clients" && activeTab !== "All";

  return (
    <div className="p-8 max-w-[1500px] mx-auto min-h-screen font-sans">

      {/* Hero section */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-foreground text-[56px] leading-[1.1] font-medium tracking-tight mb-8">
          Agency<br />Overview
        </h1>

        {/* Pill Tabs */}
        <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setActiveTab("Clients")}
            className={`px-6 py-2.5 rounded-full font-medium text-[15px] whitespace-nowrap transition-smooth ${activeTab === "Clients" ? "bg-foreground text-background shadow-sm" : "bg-secondary text-muted-foreground hover:bg-foreground hover:text-background"}`}
          >
            Clients
          </button>
          {TABS.map((tab) => (
            tab === "Reports" ? (
              <Link
                key={tab}
                href="/dashboard/reports"
                className="px-6 py-2.5 rounded-full bg-secondary text-muted-foreground hover:bg-foreground hover:text-background font-medium text-[15px] whitespace-nowrap transition-smooth"
              >
                {tab}
              </Link>
            ) : (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full font-medium text-[15px] whitespace-nowrap transition-smooth ${activeTab === tab ? "bg-foreground text-background shadow-sm" : "bg-secondary text-muted-foreground hover:bg-foreground hover:text-background"}`}
              >
                {tab}
                {tabCounts[tab] > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({tabCounts[tab]})</span>
                )}
              </button>
            )
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

        {/* Primary Color Card - Active Clients */}
        <div className="bg-primary rounded-[32px] p-7 text-primary-foreground flex flex-col justify-between relative min-h-[190px] shadow-glow hover-lift animate-slide-up" style={{ animationDelay: '50ms' }}>
          <p className="font-medium text-[15px]">Active Clients</p>
          <Link
            href="/dashboard/clients"
            className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-smooth"
            title="View all clients"
          >
            <ArrowUpRight className="w-5 h-5 text-white" />
          </Link>
          <div className="mt-8">
            <p className="text-primary-foreground/80 font-semibold text-xs tracking-wide mb-1 flex items-center gap-1">
              <span className="text-[14px]">Total clients in workspace</span>
            </p>
            <h3 className="text-6xl font-medium tracking-tight whitespace-nowrap leading-none">{activeClients}</h3>
          </div>
        </div>

        {/* Secondary Card - Pending Audits */}
        <div className="bg-secondary rounded-[32px] p-7 text-foreground flex flex-col justify-between relative min-h-[190px] shadow-sm hover-lift animate-slide-up" style={{ animationDelay: '100ms' }}>
          <p className="font-medium text-[15px]">Pending Audits</p>
          <Link
            href="/dashboard/audits"
            className="absolute top-6 right-6 w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-smooth border border-border"
            title="View all audits"
          >
            <ArrowUpRight className="w-5 h-5 text-foreground" />
          </Link>
          <div className="mt-8">
            <p className="text-muted-foreground font-semibold text-xs tracking-wide mb-1">
              In progress or processing
            </p>
            <h3 className="text-6xl font-medium tracking-tight whitespace-nowrap leading-none">{pendingAudits}</h3>
          </div>
        </div>

        {/* Card Component - Pipeline Details */}
        <div className="bg-card rounded-[32px] p-7 text-foreground flex flex-col justify-between relative min-h-[190px] lg:col-span-1 md:col-span-2 shadow-card hover-lift border border-border animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-secondary">
              <ListFilter className="w-5 h-5 text-foreground" />
            </div>
            <p className="font-medium text-[16px] leading-snug">Pipeline &<br />Audit Details</p>
            <Link
              href="/dashboard/audits"
              className="ml-auto w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-smooth"
              title="View all audits"
            >
              <ArrowUpRight className="w-5 h-5 text-foreground" />
            </Link>
          </div>

          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-muted-foreground text-[12px] mb-1">Total clients</p>
              <h3 className="text-4xl font-medium tracking-tight">{clients.length}<span className="text-xl opacity-50 ml-1">clients</span></h3>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-[12px] mb-1">Active</p>
              <h3 className="text-3xl font-medium tracking-tight text-muted-foreground">{activeClients}</h3>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-1 bg-secondary rounded-full mt-5 overflow-hidden flex border border-border/50">
            <div
              className="h-full bg-primary rounded-l-full transition-all"
              style={{ width: `${Math.max(clients.length > 0 ? 5 : 0, closedRatio)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

        {/* Clients / Audits List */}
        <div className="bg-card rounded-[32px] p-7 text-foreground lg:col-span-8 shadow-card border border-border flex flex-col hover-glow transition-smooth animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-border bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="text-[18px] font-medium tracking-tight">
                {showingAudits ? `${activeTab} Audits` : "Recent Clients"}
              </h2>
            </div>

            {!showingAudits && (
              <Link href="/dashboard/clients/new" className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold transition-smooth flex items-center gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" /> Add New
              </Link>
            )}
            {showingAudits && (
              <Link href="/dashboard/audits" className="text-xs text-primary hover:underline font-medium">
                View all →
              </Link>
            )}
          </div>

          <div className="flex-1 overflow-x-auto">
            {showingAudits ? (
              /* Audits table filtered by status tab */
              <table className="w-full text-left text-[14px] whitespace-nowrap border-spacing-y-4 border-separate">
                <thead>
                  <tr className="text-muted-foreground text-[12px]">
                    <td className="px-2 pb-2 font-medium">Business</td>
                    <td className="px-2 pb-2 font-medium">Status</td>
                    <td className="px-2 pb-2 font-medium">Started</td>
                    <td className="px-2 pb-2 font-medium text-right">Action</td>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  {visibleAudits.map((audit) => (
                    <tr key={audit.id} className="group transition-smooth hover:bg-secondary/50 rounded-lg">
                      <td className="px-2 py-3 rounded-l-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[12px] font-bold text-foreground border border-border">
                            {audit.business_name.charAt(0)}
                          </span>
                          <span className="font-medium text-foreground">{audit.business_name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${audit.status === "complete" ? "bg-primary/10 text-primary" :
                          audit.status === "in_progress" ? "bg-amber-500/10 text-amber-500" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                          {audit.status === "in_progress" ? "In Progress" :
                            audit.status === "complete" ? "Complete" :
                              audit.status === "processing" ? "Processing" :
                                audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground text-sm">
                        {new Date(audit.started_at).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
                      </td>
                      <td className="px-2 py-3 text-right rounded-r-lg">
                        <Link href={`/audit/${audit.id}`} className="w-8 h-8 rounded-full bg-secondary border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary text-muted-foreground flex items-center justify-center ml-auto transition-smooth cursor-pointer">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {visibleAudits.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? `No audits matching "${searchQuery}"` : `No ${activeTab.toLowerCase()} audits`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              /* Clients table */
              <table className="w-full text-left text-[14px] whitespace-nowrap border-spacing-y-4 border-separate">
                <thead>
                  <tr className="text-muted-foreground text-[12px]">
                    <td className="px-2 pb-2 font-medium">Business</td>
                    <td className="px-2 pb-2 font-medium">Industry</td>
                    <td className="px-2 pb-2 font-medium">Created</td>
                    <td className="px-2 pb-2 font-medium text-right">Action</td>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  {visibleClients.map((client) => (
                    <tr key={client.id} className="group transition-smooth hover:bg-secondary/50 rounded-lg">
                      <td className="px-2 py-3 rounded-l-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-[12px] font-bold text-foreground border border-border">
                            {client.business_name.charAt(0)}
                          </span>
                          <span className="font-medium text-foreground">{client.business_name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-primary font-medium">{client.industry || "—"}</span>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
                      </td>
                      <td className="px-2 py-3 text-right rounded-r-lg">
                        <Link href={`/dashboard/clients/${client.id}`} className="w-8 h-8 rounded-full bg-secondary border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary text-muted-foreground flex items-center justify-center ml-auto transition-smooth cursor-pointer">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {visibleClients.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? `No clients matching "${searchQuery}"` : "No clients added yet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Growth Chart / Secondary Block */}
        <div className="bg-card rounded-[32px] p-7 text-foreground lg:col-span-4 shadow-card border border-border flex flex-col relative overflow-hidden hover-glow transition-smooth animate-slide-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-4 z-10 relative">
            <h2 className="text-[18px] font-medium tracking-tight">Growth Map</h2>
            <Link
              href="/dashboard/analytics"
              className="w-10 h-10 bg-secondary border border-border rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 transition-smooth"
              title="View analytics"
            >
              <ArrowUpRight className="w-[18px] h-[18px] text-foreground" />
            </Link>
          </div>

          <div className="mt-auto relative z-10">
            <AgencyGrowthChart />
          </div>

          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none rounded-b-[32px]"></div>
        </div>

      </div>

    </div>
  );
}
