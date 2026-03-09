"use client";

import { useState } from "react";
import { Send, CheckCircle, Clock } from "lucide-react";

interface InviteButtonProps {
  clientId: string;
  hasPortalAccess: boolean;
  hasInvite: boolean;
  compact?: boolean;
}

export function InviteButton({ clientId, hasPortalAccess, hasInvite, compact = false }: InviteButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const sendInvite = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/clients/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        const d = await res.json();
        console.error(d.error);
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (hasPortalAccess) {
    return compact ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
        <CheckCircle className="w-3 h-3" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
        <CheckCircle className="w-3.5 h-3.5" /> Portal Active
      </span>
    );
  }

  if (hasInvite && status === "idle") {
    return compact ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
        <Clock className="w-3 h-3" /> Sent
      </span>
    ) : (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground border border-border/50">
          <Clock className="w-3.5 h-3.5" /> Invite Sent
        </span>
        <button
          onClick={sendInvite}
          disabled={status === "loading"}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          Resend
        </button>
      </div>
    );
  }

  if (status === "sent") {
    return compact ? (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/50">
        <Clock className="w-3 h-3" /> Sent
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground border border-border/50">
        <CheckCircle className="w-3.5 h-3.5" /> Invite Sent
      </span>
    );
  }

  return compact ? (
    <button
      onClick={sendInvite}
      disabled={status === "loading"}
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground border border-border/50 hover:bg-secondary/80 transition-colors disabled:opacity-60"
    >
      <Send className="w-3 h-3" />
      {status === "loading" ? "…" : "Invite"}
    </button>
  ) : (
    <button
      onClick={sendInvite}
      disabled={status === "loading"}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-colors disabled:opacity-60"
    >
      <Send className="w-3.5 h-3.5" />
      {status === "loading" ? "Sending…" : "Invite to Portal"}
    </button>
  );
}
