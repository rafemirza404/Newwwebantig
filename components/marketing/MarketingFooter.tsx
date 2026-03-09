"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "AI Operations Audit", href: "/product/audit" },
    { label: "Gap Analysis", href: "/product/gap-analysis" },
    { label: "Solution Blueprints", href: "/product/blueprints" },
    { label: "ROI Reports", href: "/product/roi" },
  ],
  Solutions: [
    { label: "For Business Owners", href: "/solutions/business" },
    { label: "For Agencies", href: "/solutions/agencies" },
    { label: "For Consultants", href: "/solutions/consultants" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Sample Report", href: "/sample-report" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export default function MarketingFooter() {
  return (
    <footer className="m-footer">
      <div className="m-container">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 mb-4 no-underline group"
            >
              <Image
                src="/agentblueblacllogo.png"
                alt="AgentBlue"
                width={28}
                height={28}
                className="rounded-sm"
              />
              <span className="text-[19px] leading-[1.15] font-normal tracking-[-0.03em] text-white">
                AgentBlue
              </span>
            </Link>
            <p className="text-[13px] text-white/25 leading-relaxed max-w-[220px]">
              AI-powered operations intelligence for growing businesses and
              agencies.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5 list-none p-0">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/25 hover:text-white/50 transition-colors no-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-wrap items-center justify-between pt-6 border-t border-white/[0.04] gap-4">
          <p className="text-[12px] text-white/15">
            © {new Date().getFullYear()} AgentBlue. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-[12px] text-white/15 hover:text-white/30 transition-colors no-underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[12px] text-white/15 hover:text-white/30 transition-colors no-underline"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
