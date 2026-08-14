// ROUTE: components/payment/DownloadReportButton.tsx
'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface DownloadReportButtonProps {
  profileId: string;
}

export function DownloadReportButton({ profileId }: DownloadReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${profileId}`);
      if (!res.ok) throw new Error('Failed to generate report');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zadoc-skin-profile-report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Could not generate the report. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-2">
      {error && (
        <span className="rounded-full bg-white border border-zadoc-border px-4 py-1.5 text-xs text-zadoc-avoid shadow-sm">
          {error}
        </span>
      )}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 rounded-full bg-zadoc-foreground text-white px-6 py-3.5 font-medium shadow-lg disabled:opacity-70"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        {loading ? 'Preparing report…' : 'Download Report'}
      </button>
    </div>
  );
}