"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "~/lib/supabase/client";
import { Loader2, Save } from "lucide-react";

export default function PortalSettingsPage() {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setFullName(data?.full_name ?? "");
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (updateError) throw updateError;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("[PortalSettings] Save failed:", err);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-background pb-12">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/10 px-8 py-5 shadow-sm">
        <h1 className="text-foreground font-bold text-lg tracking-tight">Settings</h1>
      </div>

      <div className="max-w-[800px] mx-auto px-6 mt-10">
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-card rounded-3xl border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-none rounded-3xl p-8 space-y-6">
              <h2 className="text-foreground text-lg font-bold tracking-tight">Profile</h2>

              <div className="space-y-2">
                <label className="block text-muted-foreground text-[13px] font-bold uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-secondary border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                />
              </div>

              {error && <p className="text-destructive text-[13px] font-bold mt-2 ml-1">{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-[13px]"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? "Saved!" : "Save changes"}
              </button>
            </div>

            <div className="bg-secondary/30 border border-border/10 rounded-2xl p-6">
              <h2 className="text-foreground text-[15px] font-bold mb-2">Portal Access</h2>
              <p className="text-muted-foreground text-[14px] leading-relaxed">
                Your portal is managed by your advisor. Contact them to update your business details or run a new audit.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
