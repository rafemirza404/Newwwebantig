import { baseLayout } from "./base";

interface ClientPortalWelcomeEmailProps {
  workspaceName: string;
  clientName: string;
  portalUrl: string;
}

export function clientPortalWelcomeEmail({
  workspaceName,
  clientName,
  portalUrl,
}: ClientPortalWelcomeEmailProps): string {
  return baseLayout({
    preheader: `Welcome to your ${workspaceName} client portal`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#F0F0F0;line-height:1.3;">
        Welcome to your portal
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#888888;line-height:1.6;">
        Hi <strong style="color:#F0F0F0;">${clientName}</strong>, your
        <strong style="color:#F0F0F0;">${workspaceName}</strong> client portal is ready.
        Bookmark the link below to return anytime.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;padding:18px 24px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#555555;">Your Portal URL</p>
            <a href="${portalUrl}" style="font-size:14px;color:#7C6EF8;text-decoration:none;word-break:break-all;">${portalUrl}</a>
          </td>
        </tr>
      </table>

      <a href="${portalUrl}"
         style="display:inline-block;padding:12px 28px;background:#7C6EF8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
        Go to Portal →
      </a>
    `,
  });
}
