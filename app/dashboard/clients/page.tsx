import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import { isDemoMode, DEMO_CLIENTS } from "~/lib/mock/mockData";
import { InviteButton } from "~/components/dashboard/clients/InviteButton";

export default async function ClientsPage() {
  let clients: any[] = [];
  let invitesByClientId: Record<string, boolean> = {};

  if (isDemoMode()) {
    clients = DEMO_CLIENTS;
  } else {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?redirectTo=/dashboard/clients");

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id, name")
      .eq("owner_id", user.id)
      .maybeSingle();

    const { data } = workspace
      ? await supabase
        .from("clients")
        .select("id, business_name, contact_email, industry, company_size, created_at, client_user_id")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false })
      : { data: [] };

    clients = data ?? [];

    if (clients.length > 0) {
      const clientIds = clients.map((c: any) => c.id);
      const { data: invites } = await supabase
        .from("client_invites")
        .select("client_id")
        .in("client_id", clientIds);
      for (const inv of invites ?? []) {
        invitesByClientId[inv.client_id] = true;
      }
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-foreground text-[28px] font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} total clients</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold flex-shrink-0 shadow-sm transition-colors rounded-full"
        >
          <Plus className="w-4 h-4 text-primary-foreground" />
          Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-12 text-center">
          <p className="text-foreground font-medium mb-2">No clients yet</p>
          <p className="text-muted-foreground text-sm mb-6">Add your first client to start running audits for them.</p>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-full transition-colors"
          >
            <Plus className="w-4 h-4 text-primary-foreground" />
            Add First Client
          </Link>
        </div>
      ) : (
        <div className="bg-card border-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wide border-b border-border/10 bg-secondary/20">
                <th className="font-medium px-5 py-4">Business</th>
                <th className="font-medium px-5 py-4">Email</th>
                <th className="font-medium px-5 py-4">Industry</th>
                <th className="font-medium px-5 py-4">Added</th>
                <th className="font-medium px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-5 py-4 text-foreground text-sm font-medium">{client.business_name}</td>
                  <td className="px-5 py-4 text-muted-foreground text-sm">{client.contact_email}</td>
                  <td className="px-5 py-4 text-muted-foreground text-sm capitalize">{client.industry ?? "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground text-sm">
                    {new Date(client.created_at).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!isDemoMode() && (
                        <InviteButton
                          clientId={client.id}
                          hasPortalAccess={!!client.client_user_id}
                          hasInvite={!!invitesByClientId[client.id]}
                          compact
                        />
                      )}
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
