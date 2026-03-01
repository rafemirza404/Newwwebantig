"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseClient } from "~/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, ArrowRight, CheckCircle2, Users, Loader2 } from "lucide-react";

type Step = "setup" | "demo" | "client";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState<"direct" | "agency_owner" | null>(null);
  const [step, setStep] = useState<Step>("setup");

  // Workspace setup fields
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceIndustry, setWorkspaceIndustry] = useState("");

  // First client fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  useEffect(() => {
    async function checkUser() {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Get profile to check user_type
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, full_name, company_name")
        .eq("id", user.id)
        .single();

      const type = profile?.user_type ?? user.user_metadata?.user_type ?? "direct";
      setUserType(type as "direct" | "agency_owner");

      // Pre-fill workspace name from company_name or user metadata
      const companyName = profile?.company_name ?? user.user_metadata?.company_name ?? "";
      if (companyName) setWorkspaceName(companyName);

      // Direct users skip onboarding — go straight to audit
      if (type === "direct") {
        await createDirectAudit(supabase, user.id, profile, user.user_metadata);
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function sendWelcomeEmail() {
    try {
      await fetch("/api/auth/send-welcome", { method: "POST" });
    } catch (err) {
      console.error("[Onboarding] Welcome email failed:", err);
      // non-fatal — don't block user flow
    }
  }

  async function createDirectAudit(supabase: ReturnType<typeof createSupabaseClient>, userId: string, profile: any, metadata: any) {
    // Create first audit session for direct user
    const businessName = profile?.company_name ?? metadata?.company_name ?? "My Business";
    const industry = profile?.industry ?? metadata?.industry ?? null;

    const { data: session, error } = await supabase
      .from("audit_sessions")
      .insert({
        user_id: userId,
        mode: "self_serve",
        status: "in_progress",
        business_name: businessName,
        industry,
      })
      .select("id")
      .single();

    if (error || !session) {
      router.push("/dashboard");
      return;
    }

    sendWelcomeEmail();
    router.push(`/audit/${session.id}`);
  }

  const handleWorkspaceSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }
    setSaving(true);

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("workspaces").insert({
      owner_id: user.id,
      name: workspaceName.trim(),
      plan: "starter",
    });

    if (error) {
      toast.error("Failed to create workspace: " + error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setStep("demo");
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Get workspace
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (workspace) {
      await supabase.from("clients").insert({
        workspace_id: workspace.id,
        business_name: clientName.trim(),
        contact_email: clientEmail.trim(),
      });
    }

    setSaving(false);
    toast.success("Client added! Heading to your dashboard.");
    sendWelcomeEmail();
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7C6EF8] mx-auto mb-3" />
          <p className="text-[#888888] text-sm">Setting up your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Image src="/agentblue-logo.png" alt="AgentBlue" width={32} height={32} className="rounded" />
        <span className="text-white font-bold text-xl">AgentBlue</span>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(["setup", "demo", "client"] as Step[]).map((s, i) => {
          const isDone = ["setup", "demo", "client"].indexOf(step) > i;
          const isCurrent = step === s;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${isDone ? "bg-[#4ADE80] text-black" :
                  isCurrent ? "bg-[#7C6EF8] text-white" :
                    "bg-[#2A2A2A] text-[#555555]"
                }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && <div className={`w-10 h-px ${isDone ? "bg-[#4ADE80]" : "bg-[#2A2A2A]"}`} />}
            </div>
          );
        })}
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
        {step === "setup" && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#7C6EF8]/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#7C6EF8]" />
              </div>
              <div>
                <h1 className="text-white text-xl font-semibold">Set up your agency</h1>
                <p className="text-[#888888] text-sm">Create your workspace to get started</p>
              </div>
            </div>

            <form onSubmit={handleWorkspaceSetup} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="workspaceName" className="text-[#888888] text-sm">Agency / workspace name *</Label>
                <Input
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  required
                  className="mt-1 bg-[#0F0F0F] border-[#2A2A2A] text-white placeholder:text-[#555555] focus:border-[#7C6EF8]"
                  placeholder="Acme Growth Agency"
                />
              </div>
              <div>
                <Label htmlFor="workspaceIndustry" className="text-[#888888] text-sm">Primary industry focus</Label>
                <select
                  id="workspaceIndustry"
                  value={workspaceIndustry}
                  onChange={(e) => setWorkspaceIndustry(e.target.value)}
                  className="mt-1 w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white rounded-md px-3 py-2 text-sm focus:border-[#7C6EF8] focus:outline-none"
                >
                  <option value="">Any industry</option>
                  <option value="saas">SaaS / Software</option>
                  <option value="ecommerce">E-commerce / Retail</option>
                  <option value="professional_services">Professional Services</option>
                  <option value="construction">Construction / Trades</option>
                  <option value="home_services">Home Services</option>
                  <option value="healthcare">Healthcare / Wellness</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="finance">Finance / Insurance</option>
                  <option value="education">Education / Coaching</option>
                  <option value="hospitality">Hospitality / Food</option>
                  <option value="marketing_agency">Marketing / Agency</option>
                  <option value="logistics">Logistics / Transport</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-[#7C6EF8] hover:bg-[#6B5CE7] text-white font-medium mt-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {saving ? "Creating workspace…" : "Continue →"}
              </Button>
            </form>
          </>
        )}

        {step === "demo" && (
          <>
            <h1 className="text-white text-xl font-semibold mb-1">Here&apos;s what your clients will get</h1>
            <p className="text-[#888888] text-sm mb-6">A sample audit report for a fictional business</p>

            {/* Mini demo report card */}
            <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium text-sm">Acme Corp — Demo Report</p>
                  <p className="text-[#555555] text-xs mt-0.5">8 gaps found · Dec 2025</p>
                </div>
                <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-full flex items-center justify-center">
                  <span className="text-[#F59E0B] font-bold text-sm">62</span>
                </div>
              </div>
              <div className="space-y-2">
                {["Lead Follow-up Automation", "Proposal Generation", "Customer Communication"].map((gap, i) => (
                  <div key={gap} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[#F87171]" : i === 1 ? "bg-[#F59E0B]" : "bg-[#60A5FA]"}`} />
                    <span className="text-[#888888] text-xs">{gap}</span>
                    <span className={`ml-auto text-xs ${i === 0 ? "text-[#F87171]" : i === 1 ? "text-[#F59E0B]" : "text-[#60A5FA]"}`}>
                      {i === 0 ? "High" : i === 1 ? "Medium" : "Low"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                <p className="text-[#4ADE80] text-xs font-medium">Estimated time savings: 12 hrs/week</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-[#2A2A2A] text-[#888888] hover:bg-[#2A2A2A] bg-transparent"
                onClick={() => { sendWelcomeEmail(); router.push("/dashboard"); }}
              >
                Skip for now
              </Button>
              <Button
                className="flex-1 bg-[#7C6EF8] hover:bg-[#6B5CE7] text-white font-medium"
                onClick={() => setStep("client")}
              >
                Add first client <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {step === "client" && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4ADE80]/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-[#4ADE80]" />
              </div>
              <div>
                <h1 className="text-white text-xl font-semibold">Add your first client</h1>
                <p className="text-[#888888] text-sm">We&apos;ll set up their audit profile</p>
              </div>
            </div>

            <form onSubmit={handleAddClient} className="space-y-4 mt-6">
              <div>
                <Label htmlFor="clientName" className="text-[#888888] text-sm">Business name *</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="mt-1 bg-[#0F0F0F] border-[#2A2A2A] text-white placeholder:text-[#555555] focus:border-[#7C6EF8]"
                  placeholder="Acme Solar"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail" className="text-[#888888] text-sm">Contact email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                  className="mt-1 bg-[#0F0F0F] border-[#2A2A2A] text-white placeholder:text-[#555555] focus:border-[#7C6EF8]"
                  placeholder="owner@acmesolar.com"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-[#2A2A2A] text-[#888888] hover:bg-[#2A2A2A] bg-transparent"
                  onClick={() => router.push("/dashboard")}
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#7C6EF8] hover:bg-[#6B5CE7] text-white font-medium"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {saving ? "Adding…" : "Go to Dashboard →"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
