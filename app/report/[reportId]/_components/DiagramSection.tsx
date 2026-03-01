"use client";

import { useEffect, useRef, useState } from "react";
import { GitBranch, AlertCircle } from "lucide-react";

interface Diagram {
  gap_id: string;
  gap_name: string;
  system_title: string;
  mermaid_script: string;
  is_validated: boolean;
  node_count: number;
  diagram_narrative: string;
}

interface DiagramSectionProps {
  diagrams: Diagram[];
}

function DiagramCard({ diagram }: { diagram: Diagram }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderFailed, setRenderFailed] = useState(false);

  useEffect(() => {
    if (!diagram.is_validated || !diagram.mermaid_script) {
      setRenderFailed(true);
      return;
    }
    let cancelled = false;

    import("mermaid")
      .then((mermaid) => {
        if (cancelled || !containerRef.current) return;
        mermaid.default.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
        const id = `diagram-${diagram.gap_id.replace(/-/g, "")}`;
        return mermaid.default.render(id, diagram.mermaid_script);
      })
      .then((result) => {
        if (cancelled || !containerRef.current || !result) return;
        containerRef.current.innerHTML = result.svg;
      })
      .catch(() => {
        if (!cancelled) setRenderFailed(true);
      });

    return () => { cancelled = true; };
  }, [diagram]);

  return (
    <div className="bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-border/20 flex items-center gap-3">
        <GitBranch className="w-4 h-4 text-primary" />
        <div>
          <p className="text-foreground font-medium text-[15px]">{diagram.system_title}</p>
          <p className="text-muted-foreground text-[12px] mt-0.5">{diagram.gap_name}</p>
        </div>
      </div>

      <div className="p-6">
        {!renderFailed && diagram.is_validated ? (
          <div ref={containerRef} className="w-full overflow-x-auto min-h-[200px] flex items-center justify-center" />
        ) : (
          <div className="bg-secondary/30 rounded-xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground text-[13px]">Diagram could not be rendered. See walkthrough below.</p>
          </div>
        )}

        <div className="mt-4 border-t border-border/20 pt-4">
          <p className="text-muted-foreground text-[12px] uppercase font-semibold tracking-wider mb-3">How this automation works</p>
          <p className="text-muted-foreground text-[14px] leading-relaxed">{diagram.diagram_narrative}</p>
        </div>
      </div>
    </div>
  );
}

export default function DiagramSection({ diagrams }: DiagramSectionProps) {
  if (!diagrams || diagrams.length === 0) return null;

  return (
    <section>
      <h2 className="text-foreground font-medium text-[24px] mb-2 tracking-tight">Automation System Diagrams</h2>
      <p className="text-muted-foreground text-[15px] mb-6">Proposed automated systems for your top priority gaps.</p>
      <div className="space-y-6">
        {diagrams.map((d) => <DiagramCard key={d.gap_id} diagram={d} />)}
      </div>
    </section>
  );
}
