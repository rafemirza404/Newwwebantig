"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

interface SendReminderButtonProps {
  clientId: string;
}

export function SendReminderButton({ clientId }: SendReminderButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const send = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/clients/send-login-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground border border-border/50">
        Login reminder sent
      </span>
    );
  }

  return (
    <button
      onClick={send}
      disabled={status === "loading"}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-60"
    >
      <Mail className="w-3.5 h-3.5" />
      {status === "loading" ? "Sending…" : "Send Login Reminder"}
    </button>
  );
}
