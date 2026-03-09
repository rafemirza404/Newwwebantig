import { baseLayout } from "./base";

interface ClientPortalInviteEmailProps {
  workspaceName: string;
  workspaceLogoUrl: string | null;
  clientName: string;
  signupUrl: string;
}

export function clientPortalInviteEmail({
  workspaceName,
  workspaceLogoUrl,
  clientName,
  signupUrl,
}: ClientPortalInviteEmailProps): string {
  const logoHtml = workspaceLogoUrl
    ? `<img src="${workspaceLogoUrl}" alt="${workspaceName}" style="height:40px;max-width:160px;object-fit:contain;display:block;margin-bottom:20px;" />`
    : `<p style="margin:0 0 20px;font-size:16px;font-weight:700;color:#F0F0F0;">${workspaceName}</p>`;

  return baseLayout({
    preheader: `You've been invited to ${workspaceName}'s client portal`,
    content: `
      ${logoHtml}
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#F0F0F0;line-height:1.3;">
        You've been invited
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#888888;line-height:1.6;">
        Hi <strong style="color:#F0F0F0;">${clientName}</strong>, you've been invited to access
        <strong style="color:#F0F0F0;">${workspaceName}</strong>'s client portal.
        Set your password to view your AI audit report and implementation plan.
      </p>

      <a href="${signupUrl}"
         style="display:inline-block;padding:12px 28px;background:#7C6EF8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
        Set Up Portal Access →
      </a>

      <p style="margin:24px 0 0;font-size:13px;color:#555555;line-height:1.6;">
        If the button doesn't work, copy this link into your browser:<br/>
        <a href="${signupUrl}" style="color:#7C6EF8;word-break:break-all;">${signupUrl}</a>
      </p>
    `,
  });
}
