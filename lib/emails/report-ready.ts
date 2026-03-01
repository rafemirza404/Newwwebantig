import { baseLayout } from "./base";

interface ReportReadyEmailProps {
  businessName: string;
  reportUrl: string;
  overallScore: number;
  hrsPerMonth: number;
}

function scoreLabel(score: number): string {
  if (score >= 75) return "Strong";
  if (score >= 50) return "Developing";
  if (score >= 25) return "Early Stage";
  return "Getting Started";
}

function scoreColor(score: number): string {
  if (score >= 75) return "#4ADE80";
  if (score >= 50) return "#F59E0B";
  return "#F87171";
}

export function reportReadyEmail({
  businessName,
  reportUrl,
  overallScore,
  hrsPerMonth,
}: ReportReadyEmailProps): string {
  const color = scoreColor(overallScore);
  const label = scoreLabel(overallScore);

  return baseLayout({
    preheader: `Your AI audit report for ${businessName} is ready.`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#F0F0F0;line-height:1.3;">
        Your report is ready
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#888888;line-height:1.6;">
        We've finished analysing <strong style="color:#F0F0F0;">${businessName}</strong>.
        Here's a snapshot of what we found.
      </p>

      <!-- Score card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-right:12px;">
                  <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#555555;">AI Maturity Score</p>
                  <p style="margin:0;font-size:36px;font-weight:700;color:${color};">${overallScore}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:${color};">${label}</p>
                </td>
                <td width="50%" style="padding-left:12px;border-left:1px solid #2A2A2A;">
                  <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#555555;">Potential Savings</p>
                  <p style="margin:0;font-size:36px;font-weight:700;color:#4ADE80;">${hrsPerMonth}h</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#888888;">per month</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 28px;font-size:15px;color:#888888;line-height:1.6;">
        Your full report includes identified automation gaps, mapped AI solutions, process diagrams, and a phased implementation roadmap.
      </p>

      <a href="${reportUrl}"
         style="display:inline-block;padding:12px 28px;background:#7C6EF8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
        View Full Report →
      </a>
    `,
  });
}
