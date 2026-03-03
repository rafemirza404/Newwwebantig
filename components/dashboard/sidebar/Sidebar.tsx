"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  BarChart3,
  TrendingUp,
  Settings,
  CreditCard,
  UserCog,
  Puzzle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  X,
  Search
} from "lucide-react";
import { createSupabaseClient } from "~/lib/supabase/client";
import { useState } from "react";
import type { UserType } from "~/lib/supabase/client";
import { ThemeSwitch } from "~/components/ThemeSwitch";
import { toast } from "sonner";

interface SidebarProps {
  userType: UserType;
  userEmail: string;
  userName: string;
  workspaceName?: string;
  userPlan?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const agencyNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Clients", href: "/dashboard/clients", icon: <Users className="w-4 h-4" /> },
  { label: "Audits", href: "/dashboard/audits", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "Reports", href: "/dashboard/reports", icon: <FileText className="w-4 h-4" /> },
  { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="w-4 h-4" /> },
];

const directNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "My Audits", href: "/dashboard/audits", icon: <ClipboardList className="w-4 h-4" /> },
  { label: "My Reports", href: "/dashboard/reports", icon: <FileText className="w-4 h-4" /> },
  { label: "Progress", href: "/dashboard/progress", icon: <TrendingUp className="w-4 h-4" /> },
  { label: "My Score", href: "/dashboard/analytics", icon: <BarChart3 className="w-4 h-4" /> },
];

const agencyWorkspaceNav: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
  { label: "Team", href: "/dashboard/team", icon: <UserCog className="w-4 h-4" /> },
  { label: "Billing", href: "/dashboard/billing", icon: <CreditCard className="w-4 h-4" /> },
  { label: "Integrations", href: "/dashboard/integrations", icon: <Puzzle className="w-4 h-4" /> },
];

const directWorkspaceNav: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
  { label: "Billing", href: "/dashboard/billing", icon: <CreditCard className="w-4 h-4" /> },
];

export default function Sidebar({ userType, userEmail, userName, workspaceName, userPlan }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(true);
  const isProUser = userPlan === "pro";

  const isAgency = userType === "agency_owner";
  const mainNav = isAgency ? agencyNav : directNav;
  const workspaceNav = isAgency ? agencyWorkspaceNav : directWorkspaceNav;
  const workspaceLabel = isAgency ? "WORKSPACE" : "ACCOUNT";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDevMode = async (mode: string) => {
    await fetch("/api/dev/mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    router.push("/dashboard");
    router.refresh();
  };

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? "U";

  return (
    <div
      className={`flex flex-col h-screen transition-all duration-200 shrink-0 bg-background border-r border-border overflow-y-auto ${collapsed ? "w-[60px]" : "w-[260px]"
        }`}
    >
      {/* Logo Header */}
      <div
        className="flex items-center justify-between px-5 h-16 shrink-0"
      >
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0">
              <Image src="/agentblueblacllogo.png" alt="AgentBlue" width={28} height={28} className="rounded-lg block dark:hidden" />
              <Image src="/agentblue-logo.png" alt="AgentBlue" width={28} height={28} className="rounded-lg hidden dark:block" />
            </div>
            <span className="text-foreground text-md font-semibold truncate leading-none">
              {workspaceName ?? "AgentBlue"}
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <Image src="/agentblueblacllogo.png" alt="AgentBlue" width={28} height={28} className="rounded-lg block dark:hidden" />
            <Image src="/agentblue-logo.png" alt="AgentBlue" width={28} height={28} className="rounded-lg hidden dark:block" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded ml-1 flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="text-muted-foreground hover:text-foreground transition-colors py-2 flex justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Search area */}
      {!collapsed && (
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              readOnly
              onClick={() => toast.info("Search feature is coming soon!")}
              placeholder="Search Anything..."
              className="pl-9 pr-3 py-2 w-full text-xs bg-secondary border border-transparent rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder-muted-foreground transition-all cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-2 space-y-6">

        {/* MENU */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-muted-foreground text-[10px] font-semibold uppercase px-2 mb-2 tracking-wider">
              MENU
            </p>
          )}
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm transition-all ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"
                } ${isActive(item.href)
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
            >
              <span className={`flex-shrink-0 ${isActive(item.href) ? "text-primary" : ""}`}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* WORKSPACE / ACCOUNT */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-muted-foreground text-[10px] font-semibold uppercase px-2 mb-2 tracking-wider">
              {workspaceLabel}
            </p>
          )}
          {workspaceNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm transition-all ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"
                } ${isActive(item.href)
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
            >
              <span className={`flex-shrink-0 ${isActive(item.href) ? "text-primary" : ""}`}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

      </nav>

      <div className="px-5 pb-5 mt-auto">
        {/* Upgrade Pro Widget */}
        {!collapsed && showUpgrade && !isProUser && (
          <div className="bg-card border border-border/50 rounded-2xl p-4 mb-6 relative overflow-hidden shadow-lg group">
            {/* Subtle glow behind */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <button onClick={() => setShowUpgrade(false)} className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10 rounded-full hover:bg-secondary">
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-center gap-2 mb-2 relative z-10">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/20">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <p className="text-foreground font-semibold text-sm">Upgrade Pro!</p>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed mb-4 relative z-10">
              Upgrade to Pro and elevate your experience today
            </p>
            <div className="flex items-center justify-between relative z-10">
              <Link href="/dashboard/billing" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Upgrade
              </Link>
              <Link href="/dashboard/billing" className="text-muted-foreground text-xs hover:text-foreground underline">
                Learn more
              </Link>
            </div>
          </div>
        )}

        {/* User row + logout + devmode */}
        {!collapsed && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-secondary border border-border text-foreground">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-xs font-semibold truncate leading-tight">{userName || "User"}</p>
                <p className="text-muted-foreground text-[10px] truncate">{userEmail}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-red-400 transition-colors p-1 flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dev mode toggle — development only */}
        {process.env.NODE_ENV === "development" && !collapsed && (
          <div className="pt-4 mt-4 border-t border-border flex justify-between items-center">
            <div className="flex gap-1">
              <button
                onClick={() => handleDevMode("direct")}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${userType === "direct" ? "bg-secondary text-foreground" : "bg-transparent text-muted-foreground hover:bg-secondary/50"
                  }`}
              >
                DIR
              </button>
              <button
                onClick={() => handleDevMode("agency_owner")}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${userType === "agency_owner" ? "bg-secondary text-foreground" : "bg-transparent text-muted-foreground hover:bg-secondary/50"
                  }`}
              >
                AGN
              </button>
            </div>
            <ThemeSwitch />
          </div>
        )}
      </div>
    </div>
  );
}
