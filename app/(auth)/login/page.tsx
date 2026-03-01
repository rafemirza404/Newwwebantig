"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "~/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <h1 className="text-foreground text-[28px] font-black tracking-tight mb-2">Welcome back</h1>
      <p className="text-muted-foreground text-[15px] mb-8 font-medium">Sign in to your account</p>

      <Button
        variant="outline"
        className="w-full mb-6 bg-secondary/50 border-border/50 text-foreground hover:bg-secondary/80 hover:text-foreground h-12 rounded-xl text-[15px] font-bold shadow-sm transition-all"
        onClick={handleGoogleLogin}
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </Button>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border/20" />
        <span className="text-muted-foreground text-[12px] font-bold uppercase tracking-wider">or email</span>
        <div className="flex-1 h-px bg-border/20" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-5 relative z-10">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider ml-1">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-secondary/30 border-border/20 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <Label htmlFor="password" className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider">Password</Label>
            <Link href="/forgot-password" className="text-[13px] text-primary hover:text-primary/80 font-bold transition-colors">
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 bg-secondary/30 border-border/20 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
            placeholder="••••••••"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] text-[15px]"
        >
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-muted-foreground text-[14px] font-medium mt-8">
        No account?{" "}
        <Link href="/signup" className="text-primary hover:text-primary/80 font-bold transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-[440px] px-4">
      <div className="flex items-center justify-center gap-3 mb-10">
        <Image src="/agentblueblacllogo.png" alt="AgentBlue" width={40} height={40} className="rounded-xl block dark:hidden" />
        <Image src="/agentblue-logo.png" alt="AgentBlue" width={40} height={40} className="rounded-xl hidden dark:block" />
        <span className="text-foreground font-black text-2xl tracking-tight">AgentBlue</span>
      </div>
      <Suspense fallback={<div className="h-[480px] bg-card border border-border/10 rounded-[2rem] animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
