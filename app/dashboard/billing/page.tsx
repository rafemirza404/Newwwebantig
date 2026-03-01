import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import BillingClient from "./_components/BillingClient";
import { isDemoMode } from "~/lib/mock/mockData";

const DIRECT_PLANS = [
  {
    key: "free",
    priceKey: "",
    name: "Free",
    price: "$0",
    period: "/mo",
    features: [
      "1 audit per month",
      "Partial report — 3 gaps preview",
      "Basic maturity score",
      "Email support",
    ],
    highlight: false,
  },
  {
    key: "pro",
    priceKey: "direct_pro",
    name: "Pro",
    price: "$29",
    period: "/mo",
    features: [
      "Unlimited audits",
      "Full AI report — all gaps + solutions",
      "Process diagrams (before/after)",
      "Implementation roadmap",
      "ROI analysis",
      "Priority support",
    ],
    highlight: true,
  },
];

const AGENCY_PLANS = [
  {
    key: "starter",
    priceKey: "agency_starter",
    name: "Starter",
    price: "$99",
    period: "/mo",
    features: [
      "Up to 10 active clients",
      "Full reports for all clients",
      "White-label reports",
      "2 team seats",
      "Priority support",
    ],
    highlight: false,
  },
  {
    key: "growth",
    priceKey: "agency_growth",
    name: "Growth",
    price: "$249",
    period: "/mo",
    features: [
      "Up to 50 active clients",
      "Everything in Starter",
      "5 team seats",
      "Client portal",
      "Custom branding",
      "Analytics dashboard",
    ],
    highlight: true,
  },
  {
    key: "scale",
    priceKey: "agency_scale",
    name: "Scale",
    price: "$499",
    period: "/mo",
    features: [
      "Unlimited clients",
      "Everything in Growth",
      "Unlimited team seats",
      "API access",
      "Dedicated onboarding",
      "SLA guarantee",
    ],
    highlight: false,
  },
];

export default async function BillingPage() {
  if (isDemoMode()) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <div className="mb-4">
          <h1 className="text-foreground text-[28px] font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your subscription and payment details</p>
        </div>
        <BillingClient
          activePlanKey="growth"
          plans={AGENCY_PLANS}
          hasStripe={true}
          isAgency={true}
        />
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/dashboard/billing");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, plan, stripe_id")
    .eq("id", user.id)
    .single();

  const isAgency = profile?.user_type === "agency_owner";

  const { data: workspace } = isAgency
    ? await supabase
      .from("workspaces")
      .select("plan, stripe_customer_id")
      .eq("owner_id", user.id)
      .single()
    : { data: null };

  const activePlanKey = isAgency
    ? (workspace?.plan ?? "starter")
    : (profile?.plan ?? "free");

  const hasStripe = isAgency
    ? !!workspace?.stripe_customer_id
    : !!profile?.stripe_id;

  const plans = isAgency ? AGENCY_PLANS : DIRECT_PLANS;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-foreground text-[28px] font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your subscription and payment details</p>
      </div>

      <BillingClient
        activePlanKey={activePlanKey}
        plans={plans}
        hasStripe={hasStripe}
        isAgency={isAgency}
      />
    </div>
  );
}
