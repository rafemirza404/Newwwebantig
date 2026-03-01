import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "~/components/ThemeProvider";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "AgentBlue — AI Automation for Solar & HVAC Companies",
  description:
    "AgentBlue builds AI-powered automations that help Solar and HVAC companies close more deals, reduce admin time, and scale faster.",
  icons: {
    icon: [
      { url: "/agentblueblacllogo.png", media: "(prefers-color-scheme: light)" },
      { url: "/agentblue-logo.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA-48RJ7ERFNX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA-48RJ7ERFNX');
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={outfit.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
