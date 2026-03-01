import { baseLayout } from "./base";

interface ClientAuditEmailProps {
  workspaceName: string;
  clientName: string;
  auditUrl: string;
  agencyMessage?: string;
}

export function clientAuditEmail({
  workspaceName,
  clientName,
  auditUrl,
  agencyMessage,
}: ClientAuditEmailProps): string {
  const firstName = clientName.split(" ")[0] || clientName;

  return baseLayout({
    preheader: `${workspaceName} has a free AI business audit for you`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#F0F0F0;line-height:1.3;">
        Your free AI audit is ready
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#888888;line-height:1.6;">
        Hi ${firstName}, <strong style="color:#F0F0F0;">${workspaceName}</strong> has prepared a personalised AI readiness audit for your business.
      </p>

      ${
        agencyMessage
          ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
               <tr>
                 <td style="background:#1A1A1A;border-left:3px solid #7C6EF8;padding:14px 18px;border-radius:0 8px 8px 0;">
                   <p style="margin:0;font-size:14px;color:#888888;font-style:italic;line-height:1.6;">"${agencyMessage}"</p>
                   <p style="margin:8px 0 0;font-size:12px;color:#555555;">— ${workspaceName}</p>
                 </td>
               </tr>
             </table>`
          : ""
      }

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;padding:20px 24px;">
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#F0F0F0;">What you'll get:</p>
            <table cellpadding="0" cellspacing="0">
              ${[
                "AI Maturity Score for your business",
                "Identified automation gaps holding you back",
                "Specific AI solutions mapped to your gaps",
                "ROI projections and time savings",
              ]
                .map(
                  (item) => `
                <tr>
                  <td style="padding:4px 0;vertical-align:top;">
                    <span style="color:#4ADE80;margin-right:8px;">✓</span>
                    <span style="font-size:14px;color:#888888;">${item}</span>
                  </td>
                </tr>`
                )
                .join("")}
            </table>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 6px;font-size:13px;color:#555555;">Takes about 5 minutes. No technical knowledge required.</p>

      <a href="${auditUrl}"
         style="display:inline-block;padding:12px 28px;background:#7C6EF8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
        Start My Audit →
      </a>
    `,
  });
}
