"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, TrendingUp, Clock, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { createSupabaseClient } from "~/lib/supabase/client";
import { ThemeSwitch } from "~/components/ThemeSwitch";

interface PortalSidebarProps {
  workspaceName: string;
  workspaceLogoUrl: string | null;
  brandColor: string;
  clientName: string;
  clientEmail: string;
}

const NAV = [
  { label: "My Report", href: "/portal/report", icon: FileText },
  { label: "Progress", href: "/portal/progress", icon: TrendingUp },
  { label: "Audit History", href: "/portal/history", icon: Clock },
  { label: "Settings", href: "/portal/settings", icon: Settings },
];

export default function PortalSidebar({
  workspaceName,
  workspaceLogoUrl,
  brandColor,
  clientName,
  clientEmail,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  const handleSignOut = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = clientName
    ? clientName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : clientEmail?.[0]?.toUpperCase() ?? "C";

  return (
    <div className={`flex flex-col h-screen transition-all duration-200 flex-shrink-0 bg-background border-r border-border/10 overflow-y-auto ${collapsed ? "w-[60px]" : "w-[260px]"}`}>
      {/* Agency branding header */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border/10 justify-between shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            {workspaceLogoUrl ? (
              <Image
                src={workspaceLogoUrl}
                alt={workspaceName}
                width={32}
                height={32}
                className="rounded flex-shrink-0 object-contain"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                {workspaceName[0]?.toUpperCase() ?? "A"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-foreground text-[15px] font-bold tracking-tight truncate">{workspaceName}</p>
              <p className="text-muted-foreground text-[12px] font-medium uppercase tracking-wider">Client Portal</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            {workspaceLogoUrl ? (
              <Image
                src={workspaceLogoUrl}
                alt={workspaceName}
                width={32}
                height={32}
                className="rounded flex-shrink-0 object-contain"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                {workspaceName[0]?.toUpperCase() ?? "A"}
              </div>
            )}
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded flex-shrink-0 ml-1"
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

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl font-medium transition-all ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"} ${active
                ? "text-primary bg-primary/10 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="text-[14px]">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={`border-t border-border/10 flex ${collapsed ? 'flex-col justify-center' : 'items-center gap-3 bg-secondary/20 px-5 py-5 mt-auto'}`}>
        {!collapsed && (
          <>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 border border-border/50 shadow-sm"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-foreground text-[14px] font-semibold tracking-tight truncate">{clientName || "Client"}</p>
              <p className="text-muted-foreground text-[12px] truncate">{clientEmail}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ThemeSwitch />
              <button
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive flex items-center justify-center w-8 h-8 rounded-lg transition-colors p-0.5 hover:bg-destructive/10"
                title="Sign out"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </>
        )}

        {collapsed && (
          <div className="flex flex-col items-center gap-3 py-4 w-full">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 border border-border/50 shadow-sm"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              title={clientName}
            >
              {initials}
            </div>
            <ThemeSwitch />
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive flex items-center justify-center w-8 h-8 rounded-lg transition-colors p-0.5 hover:bg-destructive/10"
              title="Sign out"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
