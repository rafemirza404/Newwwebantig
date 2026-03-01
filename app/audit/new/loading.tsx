export default function NewAuditLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Starting your audit…</p>
      </div>
    </div>
  );
}
