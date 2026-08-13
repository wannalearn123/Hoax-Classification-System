import { FileJson, ShieldCheck } from "lucide-react";
import type { ClassificationResult } from "../types";
import { ResultCard } from "./ResultCard";

interface OutputPanelProps {
  loading: boolean;
  result: ClassificationResult | null;
  jsonRaw: string;
}

/** Panel hasil: menampilkan state loading, kartu hasil klasifikasi beserta raw
 *  JSON, atau kartu kosong ketika belum ada analisis. */
export function OutputPanel({ loading, result, jsonRaw }: OutputPanelProps) {
  return (
    <section className="lg:sticky lg:top-10 space-y-5">
      {loading && <LoadingState />}

      {result && !loading && (
        <div className="animate-slide-up space-y-4">
          <ResultCard result={result} />

          {/* Raw JSON response */}
          <div className="rounded-2xl bg-surface-800/80 backdrop-blur-sm border border-border/40 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <FileJson className="w-3.5 h-3.5 text-accent/60" />
                Raw JSON Response
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(jsonRaw)}
                className="text-xs text-text-secondary hover:text-accent transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-accent/10"
              >
                Salin
              </button>
            </div>
            <pre className="p-5 text-xs leading-relaxed text-text-secondary overflow-x-auto font-mono">
              <code>{jsonRaw}</code>
            </pre>
          </div>
        </div>
      )}

      {!result && !loading && <EmptyState />}
    </section>
  );
}

/** Tampilan skeleton saat proses klasifikasi sedang berjalan. */
function LoadingState() {
  return (
    <div className="animate-slide-up rounded-2xl bg-surface-800/80 backdrop-blur-sm border border-border/40 p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center pulse-ring">
          <ShieldCheck className="w-5 h-5 text-accent animate-pulse" />
        </div>
        <div>
          <p className="text-sm text-left font-semibold text-text-primary">Memproses analisis</p>
          <p className="text-xs text-text-muted">Ekstraksi fitur & klasifikasi</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="shimmer h-4 rounded-lg w-full" />
        <div className="shimmer h-4 rounded-lg w-3/4" />
        <div className="shimmer h-32 rounded-xl w-full" />
      </div>
    </div>
  );
}

/** Kartu kosong yang ditampilkan ketika belum ada hasil klasifikasi. */
function EmptyState() {
  return (
    <div className="rounded-2xl bg-surface-800/40 border border-border/30 border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-700/50 flex items-center justify-center">
        <ShieldCheck className="w-8 h-8 text-text-muted/40" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">Belum ada hasil analisis</p>
        <p className="text-xs text-text-muted mt-1 max-w-[260px] mx-auto leading-relaxed">
          Masukkan teks atau unggah gambar berita, lalu klik tombol klasifikasi untuk melihat hasil.
        </p>
      </div>
    </div>
  );
}