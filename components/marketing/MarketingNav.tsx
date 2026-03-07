"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Compass } from "lucide-react";

const navLinks = [
    {
        label: "Solutions",
        href: "#",
        children: [
            { label: "For Business Owners", href: "/solutions/business", desc: "Self-serve operations audit" },
            { label: "For Agencies", href: "/solutions/agencies", desc: "Audit clients at scale" },
            { label: "For Consultants", href: "/solutions/consultants", desc: "Add AI services to your stack" },
        ],
    },
    {
        label: "Resources",
        href: "#",
        children: [
            { label: "Blog", href: "/blog", desc: "Insights & guides" },
            { label: "How It Works", href: "/how-it-works", desc: "See the audit in action" },
            { label: "Sample Report", href: "/sample-report", desc: "Preview a real AI audit" },
        ],
    },
    {
        label: "Company",
        href: "#",
        children: [
            { label: "About Us", href: "/about", desc: "Our story and mission" },
            { label: "Careers", href: "/careers", desc: "Join our growing team" },
        ],
    },
    { label: "Pricing", href: "/pricing" },
];

export default function MarketingNav() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
                scrolled
                    ? "bg-[rgba(3,3,3,0.88)] backdrop-blur-[24px] border-b border-white/[0.06]"
                    : "bg-transparent border-b border-transparent"
            }`}
        >
            <div className="m-container flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-white no-underline">
                    <Compass className="w-5 h-5 text-white" strokeWidth={1.75} />
                    <span className="font-bold text-[15px] tracking-[0.2em] uppercase">
                        ATTENSIRA
                    </span>
                </Link>

                {/* Desktop */}
                <div className="hidden lg:flex items-center gap-0.5">
                    {navLinks.map((link) =>
                        link.children ? (
                            <div
                                key={link.label}
                                className="relative"
                                onMouseEnter={() => setOpenDropdown(link.label)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <button className="flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors">
                                    {link.label}
                                    <ChevronDown className="w-3 h-3 opacity-40" />
                                </button>
                                {openDropdown === link.label && (
                                    <div className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-[#0c0c0c] border border-white/[0.06] backdrop-blur-xl p-2 shadow-2xl shadow-black/40">
                                        {link.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                className="flex flex-col gap-0.5 px-3.5 py-3 rounded-lg hover:bg-white/[0.04] transition-colors no-underline"
                                            >
                                                <span className="text-[13px] font-medium text-white">
                                                    {child.label}
                                                </span>
                                                <span className="text-[11px] text-white/30">
                                                    {child.desc}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="px-3.5 py-2 text-[13px] font-medium text-white/60 hover:text-white transition-colors no-underline"
                            >
                                {link.label}
                            </Link>
                        )
                    )}
                </div>

                {/* Right */}
                <div className="hidden lg:flex items-center gap-6">
                    <Link
                        href="/login"
                        className="text-sm font-semibold text-white hover:text-white/80 transition-colors no-underline"
                    >
                        Login
                    </Link>
                    <Link href="/signup" className="bg-white text-black font-semibold px-5 py-2 rounded-full no-underline text-[13px] hover:bg-white/90 transition-all">
                        Start Free Trial
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    className="lg:hidden text-white/60"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-white/[0.06] bg-[#0c0c0c]">
                    <div className="p-4 space-y-1">
                        {navLinks.map((link) =>
                            link.children ? (
                                <div key={link.label}>
                                    <button
                                        className="w-full text-left px-3 py-2.5 text-sm text-white/60"
                                        onClick={() =>
                                            setOpenDropdown(openDropdown === link.label ? null : link.label)
                                        }
                                    >
                                        {link.label}
                                    </button>
                                    {openDropdown === link.label &&
                                        link.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                className="block px-6 py-2 text-sm text-white/40 hover:text-white no-underline"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                </div>
                            ) : (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="block px-3 py-2.5 text-sm text-white/60 hover:text-white no-underline"
                                >
                                    {link.label}
                                </Link>
                            )
                        )}
                        <div className="pt-3 border-t border-white/[0.06]">
                            <Link href="/signup" className="m-btn-primary w-full text-center no-underline">
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
