"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "~/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { isDemoMode } from "~/lib/mock/mockData";

const qc = new QueryClient();

function NewClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Client added successfully! (demo mode)");
      router.push("/dashboard/clients");
      return;
    }

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!workspace) {
      toast.error("No workspace found. Please complete onboarding first.");
      setLoading(false);
      return;
    }

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        workspace_id: workspace.id,
        business_name: businessName.trim(),
        contact_email: contactEmail.trim(),
        industry: industry || null,
        company_size: companySize || null,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to add client: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Client added successfully!");
    router.push(`/dashboard/clients/${client.id}`);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8 max-w-2xl mx-auto">
        <Link href="/dashboard/clients" className="text-muted-foreground text-sm hover:text-foreground flex items-center gap-1 mb-4 w-max transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
        <h1 className="text-foreground text-[28px] font-bold tracking-tight">Add New Client</h1>
        <p className="text-muted-foreground text-sm mt-1">Set up a new client profile to start running audits.</p>
      </div>

      <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="businessName" className="text-muted-foreground text-sm">Business name *</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="mt-1.5 bg-secondary border-transparent text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent rounded-xl"
              placeholder="Acme Solar"
            />
          </div>
          <div>
            <Label htmlFor="contactEmail" className="text-muted-foreground text-sm">Contact email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              className="mt-1.5 bg-secondary border-transparent text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent rounded-xl"
              placeholder="owner@acmesolar.com"
            />
          </div>
          <div>
            <Label htmlFor="industry" className="text-muted-foreground text-sm">Industry</Label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1.5 w-full bg-secondary border border-transparent text-foreground rounded-xl px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-primary focus:outline-none appearance-none"
            >
              <option value="">Select industry…</option>
              <option value="solar">Solar</option>
              <option value="hvac">HVAC</option>
              <option value="solar_hvac">Solar + HVAC</option>
              <option value="construction">Construction</option>
              <option value="home_services">Home Services</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="companySize" className="text-muted-foreground text-sm">Company size</Label>
            <select
              id="companySize"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="mt-1.5 w-full bg-secondary border border-transparent text-foreground rounded-xl px-3 py-2 text-sm focus:border-transparent focus:ring-1 focus:ring-primary focus:outline-none appearance-none"
            >
              <option value="">Select size…</option>
              <option value="1-10">1–10 employees</option>
              <option value="11-50">11–50 employees</option>
              <option value="51-200">51–200 employees</option>
              <option value="200+">200+ employees</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border/50 text-foreground hover:bg-secondary/50 bg-card rounded-full"
              onClick={() => router.push("/dashboard/clients")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 text-black animate-spin mr-2" />}
              {loading ? "Adding…" : "Add Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewClientPage() {
  return (
    <QueryClientProvider client={qc}>
      <NewClientForm />
      <Toaster />
    </QueryClientProvider>
  );
}
