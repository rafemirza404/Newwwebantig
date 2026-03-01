import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { isDemoMode, DEMO_CLIENTS, DEMO_AUDITS } from "~/lib/mock/mockData";
import Link from "next/link";
import { ArrowLeft, Mail, Globe, Building, Clock, ClipboardList, ArrowUpRight } from "lucide-react";

export default async function ClientDetailPage({ params }: { params: { clientId: string } }) {
    let client: any = null;
    let audits: any[] = [];

    if (isDemoMode()) {
        client = DEMO_CLIENTS.find(c => c.id === params.clientId) || null;
        audits = DEMO_AUDITS.filter(a => client && a.business_name === client.business_name);
    } else {
        const supabase = createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) redirect("/login?redirectTo=/dashboard/clients");

        const { data: clientData } = await supabase
            .from("clients")
            .select("*")
            .eq("id", params.clientId)
            .single();

        client = clientData;

        const { data: auditData } = await supabase
            .from("audit_sessions")
            .select("*")
            .eq("client_id", params.clientId)
            .order("started_at", { ascending: false });

        audits = auditData ?? [];
    }

    if (!client) {
        return (
            <div className="p-8 max-w-[1500px] mx-auto min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl text-white font-medium mb-4">Client Not Found</h1>
                <Link href="/dashboard/clients" className="px-6 py-2.5 bg-[#2DD48A] text-black rounded-full font-medium">
                    Go Back
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1500px] mx-auto min-h-screen font-sans">
            <Link href="/dashboard/clients" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Clients
            </Link>

            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-foreground text-[48px] leading-[1.1] font-medium tracking-tight mb-2">
                        {client.business_name}
                    </h1>
                    <p className="text-[#2DD48A] text-[18px] tracking-wide font-medium">{client.industry || "No Industry Specified"}</p>
                </div>
                <button className="bg-white hover:bg-white/90 text-black px-6 py-2.5 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-sm">
                    New Audit <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Contact Info Card */}
                <div className="bg-[#1A1A1A] rounded-[32px] p-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5">
                    <h3 className="text-[15px] font-medium text-muted-foreground mb-6 uppercase tracking-wider">Contact Details</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground border border-white/10">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[12px] text-muted-foreground">Email</p>
                                <p className="text-[15px] font-medium">{client.contact_email || "Not provided"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground border border-white/10">
                                <Globe className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[12px] text-muted-foreground">Website</p>
                                <p className="text-[15px] font-medium">{client.website || "Not provided"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground border border-white/10">
                                <Building className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[12px] text-muted-foreground">Size</p>
                                <p className="text-[15px] font-medium">{client.company_size || "Not provided"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit History List */}
                <div className="bg-[#1A1A1A] rounded-[32px] p-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5 lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                                <ClipboardList className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <h3 className="text-[18px] font-medium tracking-tight">Audit History</h3>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 bg-white/10 rounded-full text-white/70 tracking-widest uppercase">
                            {audits.length} Records
                        </span>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        {audits.length > 0 ? (
                            <table className="w-full text-left text-[14px]">
                                <thead>
                                    <tr className="text-muted-foreground text-[12px] uppercase">
                                        <td className="px-2 pb-4 font-medium">Started</td>
                                        <td className="px-2 pb-4 font-medium">Status</td>
                                        <td className="px-2 pb-4 font-medium text-right">View</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {audits.map((audit) => (
                                        <tr key={audit.id} className="group border-t border-white/5">
                                            <td className="px-2 py-4 text-muted-foreground flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(audit.started_at).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: '2-digit' })}
                                            </td>
                                            <td className="px-2 py-4">
                                                <span className={`px-2 py-1 rounded text-[11px] font-medium ${audit.status === "complete" ? "bg-[#2DD48A]/20 text-[#2DD48A]" :
                                                    audit.status === "in_progress" ? "bg-amber-500/20 text-amber-500" :
                                                        "bg-white/10 text-white/60"
                                                    }`}>
                                                    {audit.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-4 text-right">
                                                <Link href={audit.status === "complete" ? "/dashboard/reports" : `/audit/${audit.id}`}
                                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center ml-auto transition-colors cursor-pointer">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
                                <ClipboardList className="w-8 h-8 mb-3 opacity-20" />
                                <p>No audits run for this client yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
