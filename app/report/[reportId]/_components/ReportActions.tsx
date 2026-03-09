"use client";

import { useState } from "react";
import { Download, Share2, Lock, Check, Copy } from "lucide-react";
import type { ReportPDFData } from "./ReportPDF";

interface Props {
  reportId: string;
  isPro: boolean;
  businessName: string;
  isSharedView?: boolean;
  reportData?: ReportPDFData;
}

export default function ReportActions({
  reportId,
  isPro,
  businessName,
  isSharedView,
  reportData,
}: Props) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDownloadPDF() {
    if (!isPro || !reportData) return;
    setPdfLoading(true);
    try {
      // 1. Screenshot only the mermaid diagram cards (not the whole page)
      const diagramImages: string[] = [];
      const diagramEls = document.querySelectorAll<HTMLElement>("[data-diagram-card]");
      if (diagramEls.length > 0) {
        const html2canvas = (await import("html2canvas")).default;
        for (const el of diagramEls) {
          const canvas = await html2canvas(el, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#1e293b",
            logging: false,
          });
          diagramImages.push(canvas.toDataURL("image/png"));
        }
      }

      // 2. Generate proper text-based PDF with react-pdf
      const { pdf } = await import("@react-pdf/renderer");
      const { default: ReportPDF } = await import("./ReportPDF");
      const React = (await import("react")).default;

      const blob = await pdf(
        React.createElement(ReportPDF, {
          reportData,
          businessName,
          diagramImages,
        })
      ).toBlob();

      // 3. Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${businessName.replace(/[^a-z0-9]/gi, "_")}_AI_Report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleShare() {
    setShareOpen(true);
    if (shareLink) return;
    setShareLoading(true);
    try {
      const res = await fetch(`/api/report/${reportId}/share`, { method: "POST" });
      const data = await res.json();
      setShareLink(data.shareUrl);
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setShareLoading(false);
    }
  }

  function handleCopy() {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isSharedView) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Download PDF */}
      {isPro ? (
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {pdfLoading ? "Generating…" : "Download PDF"}
        </button>
      ) : (
        <button
          disabled
          title="Upgrade to Pro to download PDF"
          className="flex items-center gap-2 px-4 py-2 bg-secondary/40 text-muted-foreground text-sm font-semibold rounded-lg shadow-sm whitespace-nowrap cursor-not-allowed"
        >
          <Lock className="w-3.5 h-3.5" />
          Download PDF
        </button>
      )}

      {/* Share */}
      <div className="relative">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold rounded-lg shadow-sm border border-primary/20 transition-colors whitespace-nowrap"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>

        {shareOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShareOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-border/20 rounded-xl shadow-2xl p-4 w-80">
              <p className="text-sm font-semibold text-foreground mb-1">Share this report</p>
              <p className="text-xs text-muted-foreground mb-3">
                Anyone with the link can view this report without logging in.
              </p>
              {shareLoading ? (
                <p className="text-xs text-muted-foreground animate-pulse">Generating link…</p>
              ) : shareLink ? (
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareLink}
                    className="flex-1 text-xs bg-secondary rounded-lg px-3 py-2 text-foreground border border-border/20 truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
