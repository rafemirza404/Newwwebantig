"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "~/lib/supabase/client";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    router.push("/portal");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Enter your email address first");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createSupabaseClient();
    const baseUrl = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/portal/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-[#7C6EF8] flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">AgentBlue</span>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8">
          <h1 className="text-white text-xl font-semibold mb-1">Client Portal</h1>
          <p className="text-[#888888] text-sm mb-6">Sign in to view your audit report and implementation plan</p>

          {resetSent ? (
            <div className="bg-[#7C6EF8]/10 border border-[#7C6EF8]/20 rounded-lg p-4 text-center">
              <p className="text-[#7C6EF8] text-sm font-medium">Check your email</p>
              <p className="text-[#888888] text-xs mt-1">We sent a password reset link to {email}</p>
            </div>
          ) : showForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-[#888888] text-sm">Enter your email and we'll send you a reset link.</p>
              <div>
                <label className="block text-xs text-[#555555] uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-[#444444] focus:outline-none focus:border-[#7C6EF8]"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#7C6EF8] hover:bg-[#6B5FE0] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full text-[#555555] hover:text-white text-sm transition-colors"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs text-[#555555] uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-[#444444] focus:outline-none focus:border-[#7C6EF8]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-[#555555] uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-[#7C6EF8] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white text-sm placeholder-[#444444] focus:outline-none focus:border-[#7C6EF8]"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#7C6EF8] hover:bg-[#6B5FE0] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[#555555] text-sm mt-6">
          Agency owner?{" "}
          <Link href="/login" className="text-[#7C6EF8] hover:underline">
            Sign in here →
          </Link>
        </p>
      </div>
    </div>
  );
}
