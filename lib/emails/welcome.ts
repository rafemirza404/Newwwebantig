import { baseLayout } from "./base";

interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
  userType: "direct" | "agency_owner";
}

export function welcomeEmail({ name, dashboardUrl, userType }: WelcomeEmailProps): string {
  const firstName = name.split(" ")[0] || name;
  const headline =
    userType === "agency_owner"
      ? "Your workspace is ready"
      : "Your first audit is ready";
  const body =
    userType === "agency_owner"
      ? `You're all set up on AgentBlue. Add your first client, run an AI audit, and start generating reports — all from your dashboard.`
      : `You're all set up on AgentBlue. Your AI-powered business audit is waiting. Answer a few questions and get a full report in under 5 minutes.`;
  const ctaLabel =
    userType === "agency_owner" ? "Go to Dashboard" : "Start My Audit";

  return baseLayout({
    preheader: `Welcome to AgentBlue, ${firstName}!`,
    content: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#F0F0F0;line-height:1.3;">
        Welcome, ${firstName}
      </h1>
      <p style="margin:0 0 6px;font-size:14px;font-weight:500;color:#7C6EF8;">${headline}</p>
      <p style="margin:0 0 28px;font-size:15px;color:#888888;line-height:1.6;">${body}</p>
      <a href="${dashboardUrl}"
         style="display:inline-block;padding:12px 28px;background:#7C6EF8;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
        ${ctaLabel} →
      </a>
    `,
  });
}
