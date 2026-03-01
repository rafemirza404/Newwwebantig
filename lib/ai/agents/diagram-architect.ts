import OpenAI from "openai";
import { z } from "zod";
import type { Gap } from "./gap-analyzer";
import type { Solution } from "./solution-mapper";
import type { BusinessProfilerOutput } from "./business-profiler";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

const SYSTEM_PROMPT = `You are an expert Mermaid diagram architect. For a given automation gap and its solution, design a complete system diagram showing the PROPOSED automated future state (NOT the old manual process).

## DIAGRAM REQUIREMENTS
- Show the complete automated system from trigger to output
- Include every step, tool, condition, and decision point
- Label nodes in plain business language (not technical jargon)
- Use actual tool names from their stack
- Show human touchpoints where they remain (approvals, exceptions)
- Use flowchart LR or TD direction
- 8-20 nodes for good detail
- Up to 4 subgraphs for visual clarity

## MERMAID RULES (CRITICAL)
- Node IDs: alphanumeric only, no spaces, no special chars (use A, B, trigger1, etc.)
- Labels: wrap in quotes if they contain special chars
- Use --> for arrows, -- text --> for labeled arrows
- Subgraphs must close with "end"
- No semicolons inside node labels
- No colons inside node labels unless wrapped in quotes
- Valid: A["Send Email via ActiveCampaign"] --> B["Update CRM"]
- Invalid: A[Send: Email] --> B

## OUTPUT FORMAT
Output ONLY this exact structure — nothing else:

MERMAID:
\`\`\`mermaid
flowchart LR
  [your diagram here]
\`\`\`

NARRATIVE:
[3-4 paragraph plain language walkthrough of the complete automation. Reference specific tools and steps. Written for a non-technical business owner.]`;

const DiagramOutputSchema = z.object({
  gap_id: z.string(),
  gap_name: z.string(),
  system_title: z.string(),
  mermaid_script: z.string(),
  is_validated: z.boolean(),
  node_count: z.number(),
  diagram_narrative: z.string(),
});

export type Diagram = z.infer<typeof DiagramOutputSchema>;

function parseMermaidOutput(raw: string): { script: string; narrative: string } | null {
  const mermaidMatch = raw.match(/MERMAID:\s*```mermaid\s*([\s\S]*?)```/i);
  const narrativeMatch = raw.match(/NARRATIVE:\s*([\s\S]*?)$/i);

  if (!mermaidMatch) return null;

  return {
    script: mermaidMatch[1].trim(),
    narrative: narrativeMatch ? narrativeMatch[1].trim() : "",
  };
}

function countNodes(script: string): number {
  // Count lines that look like node definitions (contain [...] or (...) or {...})
  const nodeLines = script.split("\n").filter(line => {
    const trimmed = line.trim();
    return /^\w+[\[({]/.test(trimmed) || /-->/.test(trimmed);
  });
  return nodeLines.length;
}

function validateMermaid(script: string): { valid: boolean; error?: string } {
  // Server-side basic syntax validation (mermaid is a browser-only package)
  if (!script.includes("flowchart") && !script.includes("graph")) {
    return { valid: false, error: "Missing flowchart/graph declaration" };
  }
  // Count unclosed subgraphs
  const subgraphCount = (script.match(/subgraph/g) ?? []).length;
  const endCount = (script.match(/\bend\b/g) ?? []).length;
  if (subgraphCount !== endCount) {
    return { valid: false, error: `Unclosed subgraphs: ${subgraphCount} opens, ${endCount} end statements` };
  }
  // Check for bare colons in node labels (common Mermaid error)
  const lines = script.split("\n");
  for (const line of lines) {
    const nodeMatch = line.match(/^\s*\w+\[([^\]]+)\]/);
    if (nodeMatch) {
      const label = nodeMatch[1];
      if (!label.startsWith('"') && label.includes(":")) {
        return { valid: false, error: `Node label contains unquoted colon: ${label}` };
      }
    }
  }
  return { valid: true };
}

async function generateDiagramForGap(params: {
  gap: Gap;
  solution: Solution;
  functionProfile: string;
  toolStack: string[];
  teamStructure: string;
  attempt: number;
  previousError?: string;
}): Promise<{ script: string; narrative: string; validated: boolean }> {
  const systemContent = params.previousError
    ? `${SYSTEM_PROMPT}\n\nIMPORTANT: Your previous attempt had a Mermaid syntax error: "${params.previousError}". Fix it and return only corrected output.`
    : SYSTEM_PROMPT;

  const userMessage = `Design the automation diagram for this gap and solution:

GAP: ${params.gap.gap_name} (${params.gap.business_function})
Current situation: ${params.gap.current_situation}

SOLUTION: ${params.solution.solution_name}
How it works: ${params.solution.how_it_works}
Primary tools: ${params.solution.primary_tools.join(", ")}
New tools: ${params.solution.new_tools_required.join(", ") || "None"}

FUNCTION CONTEXT: ${params.functionProfile.slice(0, 500)}

TEAM STRUCTURE: ${params.teamStructure.slice(0, 300)}

TOOL STACK: ${params.toolStack.join(", ")}

Create the complete system diagram showing the automated future state.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2500,
    messages: [{ role: "system", content: systemContent }, { role: "user", content: userMessage }],
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  const parsed = parseMermaidOutput(text);

  if (!parsed) {
    throw new Error("Could not parse MERMAID/NARRATIVE sections from Agent 6 output");
  }

  const validation = validateMermaid(parsed.script);
  return {
    script: parsed.script,
    narrative: parsed.narrative,
    validated: validation.valid,
  };
}

export async function runDiagramArchitect(params: {
  profilerOutput: BusinessProfilerOutput;
  gaps: Gap[];
  solutions: Solution[];
}): Promise<Diagram[]> {
  console.log("[Pipeline] Agent 6 (DiagramArchitect) starting...");

  // Take top gaps by priority rank (up to 5 diagrams)
  const topGaps = [...params.gaps]
    .sort((a, b) => a.priority_rank - b.priority_rank)
    .slice(0, 5);

  const diagrams: Diagram[] = [];

  // Process diagrams concurrently
  const results = await Promise.allSettled(
    topGaps.map(async (gap) => {
      const solution = params.solutions.find((s) => s.gap_id === gap.gap_id);
      if (!solution) return null;

      const fnProfile = params.profilerOutput.function_profiles[gap.business_function];
      const teamStructure = params.profilerOutput.business_profile.team_structure;
      const toolStack = params.profilerOutput.business_profile.current_tool_stack;

      let result = await generateDiagramForGap({
        gap,
        solution,
        functionProfile: fnProfile?.profile ?? "",
        toolStack,
        teamStructure,
        attempt: 1,
      });

      // Retry once if invalid
      if (!result.validated) {
        console.log(`[Agent6] Diagram for "${gap.gap_name}" invalid — retrying...`);
        try {
          result = await generateDiagramForGap({
            gap,
            solution,
            functionProfile: fnProfile?.profile ?? "",
            toolStack,
            teamStructure,
            attempt: 2,
            previousError: "Syntax validation failed",
          });
        } catch {
          console.log(`[Agent6] Retry failed for "${gap.gap_name}" — using narrative fallback`);
        }
      }

      const diagram: Diagram = {
        gap_id: gap.gap_id,
        gap_name: gap.gap_name,
        system_title: solution.solution_name,
        mermaid_script: result.script,
        is_validated: result.validated,
        node_count: countNodes(result.script),
        diagram_narrative: result.narrative,
      };

      console.log(`[Agent6] Diagram for "${gap.gap_name}": validated=${result.validated}`);
      return diagram;
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      diagrams.push(r.value);
    }
  }

  console.log("[Pipeline] Agent 6 complete. Diagrams:", diagrams.length);
  return diagrams;
}
