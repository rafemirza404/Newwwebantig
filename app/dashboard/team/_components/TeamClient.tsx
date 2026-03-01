"use client";

import { useState } from "react";
import { Copy, Check, Loader2, X } from "lucide-react";

interface Member {
  id: string;
  role: string;
  createdAt: string;
  profile: { full_name?: string; email?: string } | null;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

interface Props {
  ownerEmail: string;
  workspaceName: string;
  members: Member[];
  pendingInvites: PendingInvite[];
}

const ROLE_LABEL: Record<string, string> = { admin: "Admin", analyst: "Analyst", viewer: "Viewer" };
const ROLE_COLOR: Record<string, string> = {
  admin: "text-primary bg-primary/10 border border-primary/20",
  analyst: "text-blue-500 bg-blue-500/10 border border-blue-500/20",
  viewer: "text-muted-foreground bg-secondary border border-border/50",
};

export default function TeamClient({ ownerEmail, workspaceName, members: initialMembers, pendingInvites: initialInvites }: Props) {
  const [members, setMembers] = useState(initialMembers);
  const [pendingInvites, setPendingInvites] = useState(initialInvites);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("analyst");
  const [inviting, setInviting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    setInviteUrl(null);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create invite");
      setInviteUrl(data.inviteUrl);
      setInviteEmail("");
      // Add to pending list optimistically
      setPendingInvites((prev) => [
        {
          id: crypto.randomUUID(),
          email: inviteEmail.trim(),
          role: inviteRole,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const copyInviteUrl = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      const res = await fetch("/api/team/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error("[TeamClient] Failed to remove member:", err);
      // Page will show stale data — member stays visible
    } finally {
      setRemovingId(null);
    }
  };

  const totalCount = members.length + 1; // +1 for owner

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-[28px] font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {workspaceName} · {totalCount} member{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Members table */}
      <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden p-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/10 text-muted-foreground/60 uppercase tracking-widest text-xs font-semibold text-left">
              <th className="px-6 py-4 font-semibold">Member</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10 text-[15px]">
            {/* Owner row */}
            <tr className="hover:bg-secondary/20 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-foreground font-semibold shadow-sm">
                    {ownerEmail[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold leading-tight mb-1">You (Owner)</p>
                    <p className="text-muted-foreground text-xs leading-none">{ownerEmail}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full text-[#4ADE80] bg-[#4ADE80]/10 border border-[#4ADE80]/20 inline-flex">
                  Owner
                </span>
              </td>
              <td className="px-6 py-4 text-muted-foreground">—</td>
              <td className="px-6 py-4" />
            </tr>

            {members.map((member) => (
              <tr key={member.id} className="hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-semibold shadow-sm">
                      {member.profile?.full_name?.[0]?.toUpperCase() ??
                        member.profile?.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-foreground font-semibold leading-tight mb-1">
                        {member.profile?.full_name ?? "Pending"}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">{member.profile?.email ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex ${ROLE_COLOR[member.role] ?? "text-muted-foreground bg-secondary/50"}`}>
                    {ROLE_LABEL[member.role] ?? member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(member.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={removingId === member.id}
                    className="text-destructive/80 text-xs font-medium hover:text-destructive hover:underline disabled:opacity-40 transition-colors"
                  >
                    {removingId === member.id ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                    ) : (
                      "Remove"
                    )}
                  </button>
                </td>
              </tr>
            ))}

            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground text-sm">
                  No team members yet. Invite someone below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden p-1">
          <div className="px-6 py-4 border-b border-border/10 bg-secondary/10">
            <p className="text-muted-foreground/60 uppercase tracking-widest text-xs font-semibold">Pending Invites</p>
          </div>
          <div className="divide-y divide-border/10">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-semibold shadow-sm">
                  {invite.email[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold leading-tight mb-1 truncate">{invite.email}</p>
                  <p className="text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                    Expires {new Date(invite.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex ${ROLE_COLOR[invite.role] ?? "text-muted-foreground bg-secondary/50"}`}>
                  {ROLE_LABEL[invite.role] ?? invite.role}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 border border-amber-500/20 bg-amber-500/10 rounded-full px-2 py-0.5">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite form */}
      <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6">
        <h2 className="text-foreground text-lg font-semibold mb-1">Invite a Team Member</h2>
        <p className="text-muted-foreground text-sm mb-6">
          An invite link will be generated. Share it with your team member — expires in 7 days.
        </p>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
            className="flex-1 bg-secondary border-transparent rounded-xl px-4 py-3 text-foreground text-sm placeholder-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent transition-colors"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="bg-secondary border-transparent rounded-xl px-4 py-3 text-foreground text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent transition-colors sm:w-40 appearance-none"
          >
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={inviting || !inviteEmail.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-full shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {inviting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : null}
            {inviting ? "Creating…" : "Create Invite"}
          </button>
        </form>

        {inviteError && <p className="text-destructive text-sm mt-3">{inviteError}</p>}

        {/* Invite URL copyable */}
        {inviteUrl && (
          <div className="mt-6 bg-secondary/50 border border-border/10 rounded-xl p-4 flex items-center gap-3">
            <code className="flex-1 text-foreground text-sm font-mono truncate bg-secondary px-3 py-1.5 rounded-lg border border-border/50">{inviteUrl}</code>
            <button
              onClick={copyInviteUrl}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border/50 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-[#4ADE80]" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={() => setInviteUrl(null)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 border border-border/50 text-muted-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
