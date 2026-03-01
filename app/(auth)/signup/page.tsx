"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "~/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";
import { Building2, User } from "lucide-react";

type Step = "account" | "company";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");
  const [loading, setLoading] = useState(false);

  // Step 1 fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Step 2 fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [userType, setUserType] = useState<"direct" | "agency_owner">("direct");

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setStep("company");
  };

  const handleGoogleSignup = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          industry,
          user_type: userType,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      // Auto-logged in (email confirmation off)
      router.push("/onboarding");
    } else {
      // Email confirmation required
      toast.success("Check your email to confirm your account.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-[480px] px-4 my-8">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <Image src="/agentblueblacllogo.png" alt="AgentBlue" width={40} height={40} className="rounded-xl block dark:hidden" />
        <Image src="/agentblue-logo.png" alt="AgentBlue" width={40} height={40} className="rounded-xl hidden dark:block" />
        <span className="text-foreground font-black text-2xl tracking-tight">AgentBlue</span>
      </div>

      <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative gradient blur */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 relative z-10">
          {(["account", "company"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${step === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : i < (step === "company" ? 1 : 0)
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary/80 text-muted-foreground"
                  }`}
              >
                {i + 1}
              </div>
              {i < 1 && <div className={`w-8 h-[2px] rounded-full ${i < (step === "company" ? 1 : 0) ? "bg-primary/20" : "bg-border/20"}`} />}
            </div>
          ))}
          <span className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider ml-2">
            {step === "account" ? "Account" : "Business"}
          </span>
        </div>

        {step === "account" ? (
          <div className="relative z-10">
            <h1 className="text-foreground text-[28px] font-black tracking-tight mb-2">Get started free</h1>
            <p className="text-muted-foreground text-[15px] mb-8 font-medium">No credit card required</p>

            {/* Google */}
            <Button
              variant="outline"
              className="w-full mb-6 bg-secondary/50 border-border/50 text-foreground hover:bg-secondary/80 hover:text-foreground h-12 rounded-xl text-[15px] font-bold shadow-sm transition-all"
              onClick={handleGoogleSignup}
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

            <form onSubmit={handleStep1} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider ml-1">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                  className="h-12 bg-secondary/30 border-border/20 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider ml-1">Work email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="h-12 bg-secondary/30 border-border/20 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  placeholder="you@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider ml-1">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="h-12 bg-secondary/30 border-border/20 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  placeholder="Min. 8 characters" />
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] text-[15px] mt-2">
                Continue →
              </Button>
            </form>
          </div>
        ) : (
          <div className="relative z-10">
            <h1 className="text-foreground text-[28px] font-black tracking-tight mb-2">About your business</h1>
            <p className="text-muted-foreground text-[15px] mb-8 font-medium">This helps us personalise your experience</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User type */}
              <div className="space-y-3">
                <Label className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider ml-1 block">I want to…</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType("direct")}
                    className={`p-5 rounded-2xl border text-left transition-all ${userType === "direct"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/20 bg-secondary/30 hover:border-border/50 hover:bg-secondary/50"
                      }`}
                  >
                    <User className={`w-6 h-6 mb-3 ${userType === "direct" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className={`text-[15px] font-bold tracking-tight ${userType === "direct" ? "text-foreground" : "text-muted-foreground"}`}>
                      Audit my business
                    </div>
                    <div className="text-[13px] text-muted-foreground/80 font-medium mt-1">I own or manage a business</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("agency_owner")}
                    className={`p-5 rounded-2xl border text-left transition-all ${userType === "agency_owner"
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/20 bg-secondary/30 hover:border-border/50 hover:bg-secondary/50"
                      }`}
                  >
                    <Building2 className={`w-6 h-6 mb-3 ${userType === "agency_owner" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className={`text-[15px] font-bold tracking-tight ${userType === "agency_owner" ? "text-foreground" : "text-muted-foreground"}`}>
                      Manage clients
                    </div>
                    <div className="text-[13px] text-muted-foreground/80 font-medium mt-1">I run an agency</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider ml-1">Company name</Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required
                  className="h-12 bg-secondary/30 border-border/20 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  placeholder="Acme Inc." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-muted-foreground text-[13px] font-bold uppercase tracking-wider ml-1">Industry</Label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  className="h-12 w-full bg-secondary/30 border border-border/20 text-foreground rounded-xl px-4 py-2 text-[15px] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none appearance-none"
                >
                  <option value="" className="bg-card text-muted-foreground">Select industry…</option>
                  <option value="saas" className="bg-card">SaaS / Software</option>
                  <option value="ecommerce" className="bg-card">E-commerce / Retail</option>
                  <option value="professional_services" className="bg-card">Professional Services</option>
                  <option value="construction" className="bg-card">Construction / Trades</option>
                  <option value="home_services" className="bg-card">Home Services</option>
                  <option value="healthcare" className="bg-card">Healthcare / Wellness</option>
                  <option value="real_estate" className="bg-card">Real Estate</option>
                  <option value="finance" className="bg-card">Finance / Insurance</option>
                  <option value="education" className="bg-card">Education / Coaching</option>
                  <option value="hospitality" className="bg-card">Hospitality / Food</option>
                  <option value="marketing_agency" className="bg-card">Marketing / Agency</option>
                  <option value="logistics" className="bg-card">Logistics / Transport</option>
                  <option value="other" className="bg-card">Other</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="button" variant="outline"
                  className="w-1/3 h-12 border-border/50 text-foreground hover:bg-secondary/80 bg-secondary/30 rounded-xl font-bold"
                  onClick={() => setStep("account")}>
                  ← Back
                </Button>
                <Button type="submit" disabled={loading}
                  className="w-2/3 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] text-[15px]">
                  {loading ? "Creating…" : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        )}

        <p className="relative z-10 text-center text-muted-foreground text-[14px] font-medium mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">Sign in</Link>
        </p>
      </div>

      <p className="text-center text-muted-foreground/70 text-[13px] font-medium mt-6">
        By signing up you agree to our{" "}
        <Link href="/terms" className="hover:text-muted-foreground transition-colors underline">Terms</Link> and{" "}
        <Link href="/privacy" className="hover:text-muted-foreground transition-colors underline">Privacy Policy</Link>
      </p>
    </div>
  );
}
