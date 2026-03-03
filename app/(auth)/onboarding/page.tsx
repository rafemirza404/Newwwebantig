"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseClient } from "~/lib/supabase/client";
import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────

type StepId = "name" | "business" | "role" | "usage" | "workspace";

interface FormData {
  fullName: string;
  companyName: string;
  industry: string;
  companySize: string;
  role: string;
  challenge: string;
  usageMode: string;
  workspaceName: string;
}

// ── Constants ─────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Solar", "HVAC", "SaaS", "E-commerce", "Home Services",
  "Professional Services", "Marketing Agency", "Real Estate", "Other",
];

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "200+"];

const ROLES = [
  "Business Owner", "Marketing Manager", "Operations Manager",
  "Agency / Consultant", "Other",
];

const CHALLENGES = [
  "Getting more leads", "Converting leads", "Managing operations",
  "Scaling my team", "Understanding my gaps",
];

const USAGE_OPTIONS = [
  {
    value: "self",
    label: "Audit my own business",
    desc: "Get a full AI gap analysis for your business",
  },
  {
    value: "clients",
    label: "Audit for clients",
    desc: "Run audits for your clients and deliver reports",
  },
  {
    value: "both",
    label: "Both",
    desc: "Use AgentBlue for your business and your clients",
  },
];

const LEFT_CONTENT: Record<StepId, { headline: string; sub: string }> = {
  name: {
    headline: "Find your biggest growth opportunities.",
    sub: "AgentBlue runs an AI audit across 8 business functions and delivers a personalised report with ROI estimates and an automation roadmap.",
  },
  business: {
    headline: "Your industry context changes everything.",
    sub: "Our AI benchmarks your business against others in your industry so recommendations are relevant — not generic.",
  },
  role: {
    headline: "Tailored to your role and goals.",
    sub: "A business owner cares about profit. A marketer cares about pipeline. We'll speak your language and prioritise what matters to you.",
  },
  usage: {
    headline: "One platform, two modes.",
    sub: "Audit your own business, or run audits for clients — or both. You can add modes at any time from Settings.",
  },
  workspace: {
    headline: "Your agency hub.",
    sub: "All your client audits and reports in one place. Invite team members, customise branding, and deliver white-label reports.",
  },
};

// ── Component ─────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    companyName: "",
    industry: "",
    companySize: "",
    role: "",
    challenge: "",
    usageMode: "",
    workspaceName: "",
  });

  // Steps array — workspace only shown for agency/both
  const steps: StepId[] = form.usageMode === "self"
    ? ["name", "business", "role", "usage"]
    : ["name", "business", "role", "usage", "workspace"];

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const isLastStep = stepIndex === steps.length - 1;

  // Load user data on mount
  useEffect(() => {
    async function loadUser() {
      const supabase = createSupabaseClient();
      // getSession() reads from local cookie — no network call, instant.
      // The middleware already verified auth server-side before this page loaded.
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company_name, industry")
        .eq("id", user.id)
        .maybeSingle();

      const name = profile?.full_name ?? user.user_metadata?.full_name ?? "";
      const company = profile?.company_name ?? user.user_metadata?.company_name ?? "";
      const ind = profile?.industry ?? user.user_metadata?.industry ?? "";

      setForm((prev) => ({
        ...prev,
        fullName: name,
        companyName: company,
        industry: ind,
        workspaceName: company ? `${company} Agency` : "",
      }));
      setLoading(false);
    }

    loadUser();
  }, [router]);

  const update = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const canContinue = () => {
    switch (currentStep) {
      case "name":     return form.fullName.trim().length > 0;
      case "business": return form.companyName.trim().length > 0 && form.industry.length > 0 && form.companySize.length > 0;
      case "role":     return form.role.length > 0 && form.challenge.length > 0;
      case "usage":    return form.usageMode.length > 0;
      case "workspace": return form.workspaceName.trim().length > 0;
      default:         return false;
    }
  };

  const handleComplete = useCallback(async (overrides?: Partial<FormData>) => {
    setSaving(true);
    try {
      const payload = { ...form, ...overrides };
      const res = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        setSaving(false);
        return;
      }

      router.push(data.redirect ?? "/dashboard");
    } catch {
      toast.error("Network error — please try again.");
      setSaving(false);
    }
  }, [form, router]);

  const handleContinue = async () => {
    if (!canContinue()) return;
    if (isLastStep) {
      await handleComplete();
      return;
    }
    // On usage step with "self" selected — isLastStep is already true so this case
    // is handled above. Advance otherwise.
    setStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  // ── Loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  const leftContent = LEFT_CONTENT[currentStep];

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">

      {/* LEFT PANEL — dark branding */}
      <div className="hidden md:flex w-[42%] flex-shrink-0 bg-[#0B0F1A] flex-col p-12 relative overflow-hidden">

        {/* Background glows */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-indigo-700/8 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 left-0 w-[300px] h-[300px] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <Image
            src="/agentblue-logo.png"
            alt="AgentBlue"
            width={30}
            height={30}
            className="rounded-lg"
          />
          <span className="text-white font-bold text-lg tracking-tight">AgentBlue</span>
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <p className="text-indigo-400/80 text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <h2 className="text-white text-[2rem] font-black leading-tight mb-4 max-w-[300px]">
            {leftContent.headline}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-[280px]">
            {leftContent.sub}
          </p>

          {/* Feature bullets — step 1 only */}
          {currentStep === "name" && (
            <div className="mt-10 space-y-3.5">
              {[
                "AI analysis across 8 business functions",
                "Personalised gap report with ROI estimates",
                "Step-by-step automation roadmap",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="text-gray-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quote — step 2+ */}
          {currentStep === "business" && (
            <div className="mt-10 p-5 rounded-2xl bg-white/4 border border-white/6">
              <p className="text-gray-400 text-sm leading-relaxed italic">
                "AgentBlue found 11 gaps in our sales process we hadn't even thought about."
              </p>
              <p className="text-gray-600 text-xs mt-3">— Ryan M., Home Services Owner</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-gray-800 text-xs relative z-10">
          © {new Date().getFullYear()} AgentBlue
        </p>
      </div>

      {/* RIGHT PANEL — content */}
      <div className="flex-1 bg-white flex flex-col overflow-y-auto">

        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2.5 p-5 border-b border-gray-100">
          <Image
            src="/agentblue-logo.png"
            alt="AgentBlue"
            width={26}
            height={26}
            className="rounded-lg"
          />
          <span className="font-bold text-gray-900 text-[15px]">AgentBlue</span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-16">
          <div className="w-full max-w-[440px]">

            {/* Progress bar segments */}
            <div className="flex items-center gap-1.5 mb-10">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i < stepIndex  ? "bg-gray-900 flex-[1.5]" :
                    i === stepIndex ? "bg-gray-900 flex-[2]" :
                    "bg-gray-200 flex-1"
                  )}
                />
              ))}
            </div>

            {/* Step content */}
            <StepContent
              step={currentStep}
              form={form}
              update={update}
              onSkipWorkspace={() => handleComplete({ workspaceName: form.companyName || "My Agency" })}
              saving={saving}
            />

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-8">
              {stepIndex > 0 && (
                <button
                  onClick={handleBack}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              <button
                onClick={handleContinue}
                disabled={!canContinue() || saving}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  canContinue() && !saving
                    ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLastStep ? "Get started" : "Continue"}
                {!saving && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step Content ──────────────────────────────────────────────────────

function StepContent({
  step,
  form,
  update,
  onSkipWorkspace,
  saving,
}: {
  step: StepId;
  form: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  onSkipWorkspace: () => void;
  saving: boolean;
}) {
  switch (step) {
    case "name":
      return (
        <div>
          <h1 className="text-gray-900 text-2xl font-black mb-1.5">What should we call you?</h1>
          <p className="text-gray-500 text-sm mb-7">We&apos;ll use your name throughout your experience.</p>
          <input
            autoFocus
            type="text"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && form.fullName.trim() && (e.target as HTMLInputElement).blur()}
            placeholder="Your full name"
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
          />
        </div>
      );

    case "business":
      return (
        <div>
          <h1 className="text-gray-900 text-2xl font-black mb-1.5">Tell us about your business</h1>
          <p className="text-gray-500 text-sm mb-7">This personalises every recommendation in your audit.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2.5">
                Company name
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="Acme Inc."
                className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2.5">
                Industry
              </label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <PillButton
                    key={ind}
                    label={ind}
                    selected={form.industry === ind}
                    onClick={() => update("industry", form.industry === ind ? "" : ind)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2.5">
                Company size
              </label>
              <div className="flex gap-2">
                {COMPANY_SIZES.map((size) => (
                  <PillButton
                    key={size}
                    label={size}
                    selected={form.companySize === size}
                    onClick={() => update("companySize", form.companySize === size ? "" : size)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "role":
      return (
        <div>
          <h1 className="text-gray-900 text-2xl font-black mb-1.5">What describes you best?</h1>
          <p className="text-gray-500 text-sm mb-7">We&apos;ll tailor your audit and recommendations to match.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2.5">
                Your role
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <PillButton
                    key={r}
                    label={r}
                    selected={form.role === r}
                    onClick={() => update("role", form.role === r ? "" : r)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2.5">
                Biggest challenge right now
              </label>
              <div className="flex flex-wrap gap-2">
                {CHALLENGES.map((c) => (
                  <PillButton
                    key={c}
                    label={c}
                    selected={form.challenge === c}
                    onClick={() => update("challenge", form.challenge === c ? "" : c)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "usage":
      return (
        <div>
          <h1 className="text-gray-900 text-2xl font-black mb-1.5">How will you use AgentBlue?</h1>
          <p className="text-gray-500 text-sm mb-7">You can change this at any time in Settings.</p>

          <div className="space-y-3">
            {USAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update("usageMode", opt.value)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                  form.usageMode === opt.value
                    ? "border-gray-900 bg-gray-900"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                    form.usageMode === opt.value
                      ? "border-white bg-white"
                      : "border-gray-300 bg-transparent"
                  )}
                >
                  {form.usageMode === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-gray-900" />
                  )}
                </div>
                <div>
                  <p className={cn(
                    "font-semibold text-sm",
                    form.usageMode === opt.value ? "text-white" : "text-gray-900"
                  )}>
                    {opt.label}
                  </p>
                  <p className={cn(
                    "text-xs mt-0.5",
                    form.usageMode === opt.value ? "text-gray-400" : "text-gray-500"
                  )}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      );

    case "workspace":
      return (
        <div>
          <h1 className="text-gray-900 text-2xl font-black mb-1.5">Name your agency workspace</h1>
          <p className="text-gray-500 text-sm mb-7">You can rename it later from workspace settings.</p>

          <input
            autoFocus
            type="text"
            value={form.workspaceName}
            onChange={(e) => update("workspaceName", e.target.value)}
            placeholder="Acme Growth Agency"
            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
          />

          <button
            onClick={onSkipWorkspace}
            disabled={saving}
            className="mt-4 text-gray-400 text-sm hover:text-gray-600 transition-colors underline disabled:opacity-40"
          >
            Skip for now
          </button>
        </div>
      );

    default:
      return null;
  }
}

// ── PillButton ────────────────────────────────────────────────────────

function PillButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border",
        selected
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
      )}
    >
      {label}
    </button>
  );
}
