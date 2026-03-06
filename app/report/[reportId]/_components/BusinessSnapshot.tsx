import type { BusinessProfile } from "../page";

interface Props {
  profile: BusinessProfile;
}

export default function BusinessSnapshot({ profile }: Props) {
  return (
    <section className="pt-8">
      <div className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left: name + meta badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-foreground font-semibold text-[20px] tracking-tight">
                {profile.name}
              </h2>
              <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                {profile.industry}
              </span>
              <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/30 font-medium capitalize">
                {profile.revenue_stage}
              </span>
            </div>
            <p className="text-muted-foreground text-[14px]">{profile.team_structure}</p>
          </div>

          {/* Right: key stats */}
          <div className="flex flex-wrap gap-3 text-[13px]">
            <div className="flex flex-col items-center px-4 py-2 bg-secondary/40 rounded-xl border border-border/20">
              <span className="text-foreground font-semibold">{profile.company_size}</span>
              <span className="text-muted-foreground text-[11px] mt-0.5">Team size</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-secondary/40 rounded-xl border border-border/20">
              <span className="text-foreground font-semibold">{profile.business_model}</span>
              <span className="text-muted-foreground text-[11px] mt-0.5">Model</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-secondary/40 rounded-xl border border-border/20">
              <span className="text-foreground font-semibold">{profile.current_tool_stack.length}</span>
              <span className="text-muted-foreground text-[11px] mt-0.5">Tools detected</span>
            </div>
          </div>
        </div>

        {/* Tool stack pills */}
        {profile.current_tool_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border/20">
            <span className="text-[12px] text-muted-foreground font-medium mr-1 self-center">
              Tool stack:
            </span>
            {profile.current_tool_stack.map((tool) => (
              <span
                key={tool}
                className="text-[12px] px-2 py-0.5 rounded-md bg-background border border-border/40 text-foreground font-medium"
              >
                {tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
