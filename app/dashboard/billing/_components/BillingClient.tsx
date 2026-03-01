"use client";

import { useState } from "react";
import { Check, Zap, Loader2, ExternalLink } from "lucide-react";

interface Plan {
  key: string;
  priceKey: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlight: boolean;
}

interface Props {
  activePlanKey: string;
  plans: Plan[];
  hasStripe: boolean;
  isAgency: boolean;
}

export default function BillingClient({ activePlanKey, plans, hasStripe, isAgency }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePlan = plans.find((p) => p.key === activePlanKey);

  const handleUpgrade = async (priceKey: string) => {
    setLoadingPlan(priceKey);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open portal");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current plan banner */}
      <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mb-1">Current Plan</p>
            <p className="text-foreground font-bold text-lg capitalize">{activePlanKey}</p>
          </div>
          {activePlan && (
            <div className="border-l border-border/20 pl-5 ml-3">
              <p className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold mb-1">Billed</p>
              <p className="text-foreground font-bold text-lg">
                {activePlan.price}
                <span className="text-muted-foreground text-sm font-medium ml-1">{activePlan.period}</span>
              </p>
            </div>
          )}
        </div>

        {hasStripe ? (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-full shadow-sm transition-colors disabled:opacity-50"
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            Manage Subscription
          </button>
        ) : (
          <span className="text-muted-foreground text-sm font-medium px-4 py-2 bg-secondary rounded-lg">No active subscription</span>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-5 py-4">
          <p className="text-destructive font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Plans grid */}
      <div className={`grid gap-6 ${isAgency ? "grid-cols-3" : "grid-cols-2"}`}>
        {plans.map((plan) => {
          const isActive = plan.key === activePlanKey;
          const isLoading = loadingPlan === plan.priceKey;

          return (
            <div
              key={plan.key}
              className={`bg-card rounded-2xl p-8 flex flex-col relative overflow-hidden transition-all ${plan.highlight
                  ? "border border-primary/30 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]"
                  : "border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
              )}
              {plan.highlight && (
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-4 inline-block bg-primary/10 px-2 py-1 rounded w-max">
                  Most Popular
                </p>
              )}
              {!plan.highlight && <div className="h-7 mb-4" />}

              <div className="mb-6">
                <p className="text-foreground font-bold text-xl">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-foreground text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3.5 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span className="text-muted-foreground text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isActive || !!loadingPlan}
                onClick={() => !isActive && handleUpgrade(plan.priceKey)}
                className={`w-full py-3 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm ${isActive
                  ? "bg-secondary text-muted-foreground cursor-default"
                  : plan.highlight
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                    : "bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-50"
                  }`}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
                {isActive ? "Current Plan" : isLoading ? "Redirecting…" : plan.key === "free" || plan.key === "starter" ? "Downgrade" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment method + invoice sections */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6">
          <h2 className="text-foreground text-base font-semibold mb-3">Payment Method</h2>
          {hasStripe ? (
            <div>
              <p className="text-muted-foreground text-sm mb-4">Manage your card via the subscription portal.</p>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="flex items-center gap-2 text-foreground text-sm font-medium hover:text-primary transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                Open portal
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">No payment method on file.</p>
              <p className="text-muted-foreground/60 text-xs">
                Contact{" "}
                <a href="mailto:support@agentblue.ai" className="text-foreground hover:text-primary transition-colors">
                  support@agentblue.ai
                </a>{" "}
                to upgrade early.
              </p>
            </div>
          )}
        </div>

        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6">
          <h2 className="text-foreground text-base font-semibold mb-3">Invoice History</h2>
          {hasStripe ? (
            <div>
              <p className="text-muted-foreground text-sm mb-4">View past invoices in the subscription portal.</p>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="flex items-center gap-2 text-foreground text-sm font-medium hover:text-primary transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                View invoices
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center bg-secondary/30 rounded-xl">
              <p className="text-muted-foreground text-sm font-medium">No invoices yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1.5 px-4">Invoices appear here after your first payment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
