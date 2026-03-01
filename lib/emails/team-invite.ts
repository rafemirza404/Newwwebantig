import { baseLayout } from "./base";

interface TeamInviteEmailProps {
  workspaceName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  analyst: "Analyst",
  viewer: "Viewer",
};

export function teamInviteEmail({
  workspaceName,
  inviterName,
  role,
  inviteUrl,
}: TeamInviteEmailProps): string {
  const roleLabel = ROLE_LABEL[role] ?? role;

  return baseLayout({
    preheader: `${inviterName} has invited you to join ${workspaceName} on AgentBlue`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#F0F0F0;line-height:1.3;">
        You've been invited
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#888888;line-height:1.6;">
        <strong style="color:#F0F0F0;">${inviterName}</strong> has invited you to join
        <strong style="color:#F0F0F0;">${workspaceName}</strong> on AgentBlue
        as an <strong style="color:#7C6EF8;">${roleLabel}</strong>.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;padding:18px 24px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#555555;">Workspace</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#F0F0F0;">${workspaceName}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#7C6EF8;">${roleLabel} access</p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 24px;font-size:14px;color:#555555;line-height:1.6;">
        This invite expires in 7 days. Click the button below to accept.
      </p>

      <a href="${inviteUrl}"
         style="display:inline-block;padding:12px 28px;background:#7C6EF8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
        Accept Invitation →
      </a>
    `,
  });
}
