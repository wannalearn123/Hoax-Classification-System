import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { ClassificationResult } from "../types";

/** Komponen presentasional untuk menampilkan hasil klasifikasi.
 *  Berisi header berwarna, lingkaran skor keyakinan, detail struktur/verifikasi,
 *  serta bilah tingkat keyakinan. Tidak menyimpan state apa pun. */
export function ResultCard({ result }: { result: ClassificationResult }) {
  const isHoax = result.classification === "Hoax";

  return (
    <div
      className={`
        rounded-2xl bg-surface-800/80 backdrop-blur-sm border overflow-hidden transition-all duration-500
        ${isHoax ? "border-danger/30 glow-danger" : "border-accent/30 glow-accent"}
      `}
    >
      {/* Header dengan warna indikator */}
	  <div
        className={`
          px-6 py-4 flex items-center gap-3
          ${isHoax ? "bg-danger/10 border-b border-danger/20" : "bg-accent/10 border-b border-accent/20"}
        `}
      >
        {isHoax ? (
          <ShieldAlert className="w-6 h-6 text-danger" />
        ) : (
          <ShieldCheck className="w-6 h-6 text-accent" />
        )}
        <div>
          <h2 className="text-left text-lg font-bold tracking-tight">
            {result.classification}
          </h2>
          <p className="text-xs text-text-secondary">
            {isHoax ? "Informasi terindikasi tidak benar" : "Informasi terverifikasi benar"}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Lingkaran skor keyakinan */}
        <div className="flex flex-col items-center">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-surface-700"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - result.score / 100)}`}
                className={isHoax ? "text-danger" : "text-accent"}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold tabular-nums ${isHoax ? "text-danger" : "text-accent"}`}>
                {result.score}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mt-0.5">
                Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Detail struktur & verifikasi */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-700/40 border border-border/30 p-4 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">classification</p>
            <p className={`text-base font-bold ${isHoax ? "text-danger" : "text-accent"}`}>
              {result.classification}
            </p>
          </div>
          <div className="rounded-xl bg-surface-700/40 border border-border/30 p-4 space-y-1.5">
            <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">validation</p>
            <div className="flex text-center justify-center items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${result.validation === "Yes" ? "bg-accent" : "bg-danger"}`}
              />
              <p className="text-base font-bold text-text-primary">{result.validation}</p>
            </div>
          </div>
        </div>

        {/* Bilah tingkat keyakinan */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Tingkat Keyakinan</span>
            <span className={isHoax ? "text-danger font-semibold" : "text-accent font-semibold"}>
              {result.score}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isHoax
                  ? "bg-gradient-to-r from-danger-dim to-danger"
                  : "bg-gradient-to-r from-accent-dim to-accent"
              }`}
              style={{ width: `${result.score}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-text-secondary">
            <span>Rendah</span>
            <span>Sedang</span>
            <span>Tinggi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
