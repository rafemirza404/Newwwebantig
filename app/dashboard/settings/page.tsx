"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "~/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { isDemoMode, DEMO_PROFILE, DEMO_WORKSPACE, DEMO_USER } from "~/lib/mock/mockData";
import { toast } from "sonner";

const INDUSTRY_OPTIONS = [
  "Solar", "HVAC", "Roofing", "Plumbing", "Electrical",
  "Landscaping", "General Contracting", "Home Services", "Other",
];

const BRAND_COLOR_PRESETS = [
  "#7C6EF8", "#4ADE80", "#60A5FA", "#F59E0B",
  "#F87171", "#EC4899", "#14B8A6", "#8B5CF6",
];

interface WorkspaceData {
  id: string;
  name: string;
  logo_url: string | null;
  brand_color: string;
}

export default function SettingsPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedWorkspace, setSavedWorkspace] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  // Profile fields
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [userType, setUserType] = useState("");

  // Workspace fields (agency only)
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [wsName, setWsName] = useState("");
  const [wsLogoUrl, setWsLogoUrl] = useState("");
  const [wsBrandColor, setWsBrandColor] = useState("#7C6EF8");

  useEffect(() => {
    if (isDemoMode()) {
      setEmail(DEMO_USER.email);
      setFullName(DEMO_PROFILE.full_name);
      setCompanyName(DEMO_PROFILE.company_name);
      setIndustry(DEMO_PROFILE.industry);
      setUserType(DEMO_PROFILE.user_type);
      setWorkspace({
        id: DEMO_WORKSPACE.id,
        name: DEMO_WORKSPACE.name,
        logo_url: DEMO_WORKSPACE.logo_url,
        brand_color: DEMO_WORKSPACE.brand_color,
      });
      setWsName(DEMO_WORKSPACE.name);
      setWsBrandColor(DEMO_WORKSPACE.brand_color);
      setLoading(false);
      return;
    }

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company_name, industry, user_type")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setCompanyName(profile.company_name ?? "");
        setIndustry(profile.industry ?? "");
        setUserType(profile.user_type ?? "direct");
      }

      if (profile?.user_type === "agency_owner") {
        const { data: ws } = await supabase
          .from("workspaces")
          .select("id, name, logo_url, brand_color")
          .eq("owner_id", user.id)
          .single();

        if (ws) {
          setWorkspace(ws);
          setWsName(ws.name);
          setWsLogoUrl(ws.logo_url ?? "");
          setWsBrandColor(ws.brand_color ?? "#7C6EF8");
        }
      }

      setLoading(false);
    })();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError(null);

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 500));
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 3000);
      toast.success("Profile saved (demo mode)");
      setSaving(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        company_name: companyName.trim() || null,
        industry: industry || null,
      })
      .eq("id", user.id);

    if (error) setProfileError(error.message);
    else { setSavedProfile(true); setTimeout(() => setSavedProfile(false), 3000); }
    setSaving(false);
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    setSaving(true);
    setWorkspaceError(null);

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 500));
      setSavedWorkspace(true);
      setTimeout(() => setSavedWorkspace(false), 3000);
      toast.success("Workspace saved (demo mode)");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("workspaces")
      .update({
        name: wsName.trim() || workspace.name,
        logo_url: wsLogoUrl.trim() || null,
        brand_color: wsBrandColor,
      })
      .eq("id", workspace.id);

    if (error) setWorkspaceError(error.message);
    else { setSavedWorkspace(true); setTimeout(() => setSavedWorkspace(false), 3000); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-foreground text-[28px] font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and workspace</p>
      </div>

      {/* Profile */}
      <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6">
        <h2 className="text-foreground text-lg font-semibold mb-5">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div>
            <label className="block text-muted-foreground text-sm mb-1.5">Email</label>
            <input
              type="text"
              value={email}
              disabled
              className="w-full bg-secondary border-transparent text-muted-foreground rounded-xl px-4 py-2.5 text-sm cursor-not-allowed opacity-70"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-muted-foreground text-sm mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-secondary border-transparent text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-muted-foreground text-sm mb-1.5">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company"
                className="w-full bg-secondary border-transparent text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground text-sm mb-1.5">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full bg-secondary border-transparent text-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent rounded-xl px-4 py-2.5 text-sm transition-colors appearance-none"
            >
              <option value="">Select industry</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt.toLowerCase()}>{opt}</option>
              ))}
            </select>
          </div>

          {profileError && <p className="text-destructive text-sm">{profileError}</p>}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Save className="w-4 h-4 text-primary-foreground" />}
              {saving ? "Saving…" : "Save Profile"}
            </button>
            {savedProfile && <span className="text-primary text-sm font-medium">Saved!</span>}
          </div>
        </form>
      </div>

      {/* Workspace settings — agency only */}
      {userType === "agency_owner" && workspace && (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6 mt-6">
          <h2 className="text-foreground text-lg font-semibold mb-1">Workspace</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Branding shown to clients in their portal.
          </p>

          <form onSubmit={handleSaveWorkspace} className="space-y-5">
            <div>
              <label className="block text-muted-foreground text-sm mb-1.5">Workspace Name</label>
              <input
                type="text"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                placeholder="My Agency"
                className="w-full bg-secondary border-transparent text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-muted-foreground text-sm mb-1.5">Logo URL</label>
              <input
                type="url"
                value={wsLogoUrl}
                onChange={(e) => setWsLogoUrl(e.target.value)}
                placeholder="https://your-agency.com/logo.png"
                className="w-full bg-secondary border-transparent text-foreground placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent rounded-xl px-4 py-2.5 text-sm transition-colors"
              />
              <p className="text-muted-foreground/70 text-xs mt-1.5">Displayed at 28×28px in the client sidebar</p>
            </div>

            <div>
              <label className="block text-muted-foreground text-sm mb-2">Brand Color</label>
              <div className="flex items-center gap-3 flex-wrap">
                {BRAND_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setWsBrandColor(color)}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110 shadow-sm"
                    style={{
                      backgroundColor: color,
                      outline: wsBrandColor === color ? `2px solid ${color}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full ml-2 border border-border/50 bg-secondary overflow-hidden">
                  <input
                    type="color"
                    value={wsBrandColor}
                    onChange={(e) => setWsBrandColor(e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer focus:outline-none"
                    title="Custom color"
                  />
                </div>
                <span
                  className="text-sm font-mono ml-2 font-medium"
                  style={{ color: wsBrandColor }}
                >
                  {wsBrandColor}
                </span>
              </div>
            </div>

            {/* Live preview */}
            <div className="bg-secondary/50 border border-border/10 rounded-xl p-4 flex items-center gap-3 mt-2">
              {wsLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={wsLogoUrl}
                  alt=""
                  className="w-8 h-8 rounded object-contain flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex flex-shrink-0 items-center justify-center text-white text-sm font-bold shadow-sm"
                  style={{ backgroundColor: wsBrandColor }}
                >
                  {wsName[0]?.toUpperCase() ?? "A"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-foreground text-[15px] font-semibold truncate leading-tight">{wsName || "Workspace Name"}</p>
                <p className="text-muted-foreground text-xs font-medium">Client Portal</p>
              </div>
              <p className="text-muted-foreground/60 text-xs font-medium uppercase tracking-widest ml-auto px-2">Preview</p>
            </div>

            {workspaceError && <p className="text-destructive text-sm">{workspaceError}</p>}

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Save className="w-4 h-4 text-primary-foreground" />}
                {saving ? "Saving…" : "Save Workspace"}
              </button>
              {savedWorkspace && <span className="text-primary text-sm font-medium">Saved!</span>}
            </div>
          </form>
        </div>
      )}

      {/* Danger zone */}
      <div className="bg-card border border-destructive/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6 mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-bl-[100px] pointer-events-none" />
        <h2 className="text-destructive text-lg font-semibold mb-2">Danger Zone</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Deleting your account is permanent and cannot be undone.
        </p>
        <button
          className="px-5 py-2.5 border border-destructive/30 text-destructive text-sm font-semibold rounded-full hover:bg-destructive/10 transition-colors"
          onClick={() => alert("Please contact support to delete your account.")}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
