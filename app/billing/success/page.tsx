import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#4ADE80]/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-[#4ADE80]" />
        </div>

        <h1 className="text-white text-lg font-semibold mb-2">You&apos;re all set!</h1>
        <p className="text-[#888888] text-sm mb-6">
          Your subscription is now active. Your plan has been upgraded and all features are unlocked.
        </p>

        <Link
          href="/dashboard"
          className="block w-full py-2.5 bg-[#7C6EF8] hover:bg-[#6B5CE7] text-white text-sm font-medium rounded-lg transition-colors text-center"
        >
          Go to Dashboard
        </Link>

        <Link
          href="/dashboard/billing"
          className="block mt-3 text-[#555555] text-xs hover:text-[#888888] transition-colors"
        >
          View billing details
        </Link>
      </div>
    </div>
  );
}
