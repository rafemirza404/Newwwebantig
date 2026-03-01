"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { createSupabaseClient } from "~/lib/supabase/client";

function AcceptInviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Check if user is logged in
  useEffect(() => {
    if (!token) { setMessage("Invalid invite link."); setState("error"); return; }
    const check = async () => {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setAuthed(!!user);

      // Load invite metadata for display
      const { data: invite } = await supabase
        .from("invites")
        .select("workspace_id, accepted_at, expires_at, workspaces(name)")
        .eq("token", token)
        .maybeSingle();

      if (!invite) { setMessage("This invite link is invalid or has been revoked."); setState("error"); return; }
      if (invite.accepted_at) { setMessage("This invite has already been used."); setState("error"); return; }
      if (new Date(invite.expires_at) < new Date()) { setMessage("This invite has expired. Ask your workspace owner to send a new one."); setState("error"); return; }

      const ws = Array.isArray(invite.workspaces) ? invite.workspaces[0] : invite.workspaces;
      setWorkspaceName((ws as { name: string } | null)?.name ?? "");
    };
    check();
  }, [token]);

  const handleAccept = async () => {
    if (!authed) {
      router.push(`/login?redirectTo=/auth/accept-invite?token=${token}`);
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to accept invite");
      setState("success");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  if (state === "error") {
    return (
      <div className="text-center">
        <XCircle className="w-10 h-10 text-[#F87171] mx-auto mb-4" />
        <h2 className="text-white font-semibold mb-2">Unable to accept invite</h2>
        <p className="text-[#555555] text-sm">{message}</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="text-center">
        <CheckCircle2 className="w-10 h-10 text-[#4ADE80] mx-auto mb-4" />
        <h2 className="text-white font-semibold mb-2">You&apos;re in!</h2>
        <p className="text-[#555555] text-sm">Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      {authed === null ? (
        <Loader2 className="w-6 h-6 text-[#555555] animate-spin mx-auto" />
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-[#7C6EF8]/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-[#7C6EF8] text-xl font-bold">
              {workspaceName[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          <h2 className="text-white text-lg font-semibold mb-1">
            You&apos;ve been invited
          </h2>
          {workspaceName && (
            <p className="text-[#888888] text-sm mb-6">
              Join <span className="text-white font-medium">{workspaceName}</span> on AgentBlue
            </p>
          )}
          <button
            onClick={handleAccept}
            disabled={state === "loading"}
            className="w-full py-2.5 bg-[#7C6EF8] hover:bg-[#6B5CE7] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {state === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin inline" />
            ) : authed ? (
              "Accept Invitation"
            ) : (
              "Sign in to Accept"
            )}
          </button>
          {!authed && (
            <p className="text-[#555555] text-xs mt-3">
              You&apos;ll be redirected to sign in first
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
        <Suspense fallback={<Loader2 className="w-6 h-6 text-[#555555] animate-spin mx-auto" />}>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  );
}
