"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

interface InviteData {
  email: string;
  clientName: string;
  workspaceName: string;
  workspaceLogoUrl: string | null;
}

function SignupForm({ invite, token }: { invite: InviteData; token: string }) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/portal/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      // Sign in after account creation
      const { createSupabaseClient } = await import("~/lib/supabase/client");
      const supabase = createSupabaseClient();
      await supabase.auth.signInWithPassword({ email: invite.email, password });
      router.push("/portal/welcome");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8">
        {/* Header */}
        <div className="mb-6">
          {invite.workspaceLogoUrl ? (
            <Image
              src={invite.workspaceLogoUrl}
              alt={invite.workspaceName}
              width={120}
              height={40}
              className="object-contain mb-4"
            />
          ) : (
            <p className="text-white text-lg font-bold mb-4">{invite.workspaceName}</p>
          )}
          <h1 className="text-white text-xl font-semibold">Create your password</h1>
          <p className="text-[#888888] text-sm mt-1">
            Access <strong className="text-white">{invite.workspaceName}</strong>'s client portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-xs text-[#555555] uppercase tracking-wider mb-1">Email</label>
            <div className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#888888] text-sm">
              {invite.email}
            </div>
          </div>

          {/* Full name */}
          <div>
            <label className="block text-xs text-[#555555] uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your name"
              className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-[#444444] focus:outline-none focus:border-[#7C6EF8]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-[#555555] uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min 8 characters"
                className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-[#444444] focus:outline-none focus:border-[#7C6EF8] pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#555555] hover:text-white transition-colors"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#7C6EF8] hover:bg-[#6B5FE0] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Setting up…" : "Create Account & Access Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InvalidInvite() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-white text-xl font-semibold mb-2">Invalid invite link</h1>
        <p className="text-[#888888] text-sm">This invite link is invalid or has already been used.</p>
      </div>
    </div>
  );
}

function PortalSignupInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [invite, setInvite] = useState<InviteData | null | "invalid">(null);

  useEffect(() => {
    if (!token) {
      setInvite("invalid");
      return;
    }
    fetch(`/api/portal/validate-invite?token=${token}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setInvite(data ?? "invalid"))
      .catch(() => setInvite("invalid"));
  }, [token]);

  if (invite === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C6EF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (invite === "invalid") return <InvalidInvite />;

  return <SignupForm invite={invite} token={token ?? ""} />;
}

export default function PortalSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7C6EF8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PortalSignupInner />
    </Suspense>
  );
}
