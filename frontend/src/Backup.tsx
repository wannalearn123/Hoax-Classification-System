import { useState, useCallback, useRef } from "react";
import {
  Type,
  Image as ImageIcon,
  Upload,
  X,
  ShieldCheck,
  ShieldAlert,
  Search,
  Loader2,
  FileJson,
  Trash2,
  Sparkles,
} from "lucide-react";

// ─── Tipe Data ───────────────────────────────────────────────
type InputMode = "text" | "image";

interface ClassificationResult {
  structure: "Hoax" | "Fact";
  score: number;        // 0–100
  verification: "Yes" | "No";
}

// ─── Komponen Utama ──────────────────────────────────────────
export function Backup() {
  const [mode, setMode] = useState<InputMode>("text");
  const [textInput, setTextInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [jsonRaw, setJsonRaw] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ganti mode input
  const handleModeSwitch = useCallback((newMode: InputMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setResult(null);
    setJsonRaw("");
    setImagePreview(null);
    setImageFile(null);
    setTextInput("");
  }, [mode]);

  // Handle upload gambar
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
    setJsonRaw("");
  }, []);

  // Hapus gambar
  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setResult(null);
    setJsonRaw("");
  }, []);

  // Reset semua
  const handleReset = useCallback(() => {
    setTextInput("");
    setImagePreview(null);
    setImageFile(null);
    setResult(null);
    setJsonRaw("");
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Klasifikasi
  const handleClassify = useCallback(async () => {
    const hasInput = mode === "text" ? textInput.trim().length > 0 : !!imageFile;
    if (!hasInput) return;

    setLoading(true);
    setResult(null);
    setJsonRaw("");

    const url = "http://127.0.0.1:8000"

    const formData = new FormData();

    if (mode === "text") {
      const response = await fetch(`${url}/predict_word`, { method: "POST", body: textInput, });
      const finalResult: ClassificationResult = await response.json();

      setResult(finalResult);
      setJsonRaw(JSON.stringify(finalResult, null, 2));
      setLoading(false);
    } else {
      // Gambar: hoax/fact
      formData.append("file", imageFile);
      console.log(formData);
      const response = await fetch(`${url}/predict_pict`, { method: "POST", body: formData, });
      if (!response.ok) throw new Error(response.status);

      const finalResult: ClassificationResult = await response.json();

      setResult(finalResult);
      setJsonRaw(JSON.stringify(finalResult, null, 2));
      setLoading(false);
  
    }
  }, [mode, textInput, imagePreview]);

  const isHoax = result?.structure === "Hoax";
  const hasInput = mode === "text" ? textInput.trim().length > 0 : !!imagePreview;
  const canSubmit = hasInput && !loading;

  return (
    <div className="noise-bg min-h-screen relative flex flex-col">
      {/* ─── Background Decorations ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full bg-danger/5 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/[0.02] blur-[100px]" />
      </div>

      {/* ─── Header ─── */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-md bg-surface-900/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-surface-900" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-left text-text-primary leading-none">
                HoaxGuard
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Sistem Klasifikasi Hoax</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Model Aktif
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ═══════════════ INPUT PANEL ═══════════════ */}
          <section className="space-y-5">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-800 border border-border/50 w-fit">
              <button
                onClick={() => handleModeSwitch("text")}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer
                  ${mode === "text"
                    ? "bg-accent/10 text-accent shadow-lg shadow-accent/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-700/50"}
                `}
              >
                <Type className="w-4 h-4" />
                Teks
              </button>
              <button
                onClick={() => handleModeSwitch("image")}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer
                  ${mode === "image"
                    ? "bg-accent/10 text-accent shadow-lg shadow-accent/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-700/50"}
                `}
              >
                <ImageIcon className="w-4 h-4" />
                Gambar
              </button>
            </div>

            {/* Input Area */}
            <div className="gradient-border rounded-2xl bg-surface-800/80 backdrop-blur-sm overflow-hidden">
              {/* Label bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Sparkles className="w-3.5 h-3.5 text-accent/60" />
                  {mode === "text" ? "Masukkan teks berita" : "Unggah gambar berita"}
                </div>
                {(textInput || imagePreview) && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Text Input */}
              {mode === "text" && (
                <div className="p-4">
                  <textarea
                    value={textInput}
                    onChange={(e) => { setTextInput(e.target.value); setResult(null); setJsonRaw(""); }}
                    placeholder="Tempelkan atau ketik teks berita yang ingin diperiksa di sini..."
                    rows={8}
                    className="w-full bg-transparent text-text-primary text-sm leading-relaxed placeholder:text-text-muted/60 resize-none outline-none"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="text-xs text-text-muted">
                      {textInput.length} karakter
                    </span>
                    {textInput.length > 0 && (
                      <span className={`
                        text-xs font-medium px-2.5 py-1 rounded-full
                        ${textInput.length < 20 ? "text-warn bg-warn/10" : "text-text-muted"}
                      `}>
                        {textInput.length < 20 ? "Terlalu pendek" : "Siap dianalisis"}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Image Input */}
              {mode === "image" && (
                <div className="p-4">
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center gap-4 h-64 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-accent/40 hover:bg-accent/[0.02] transition-all duration-300 group">
                      <div className="w-14 h-14 rounded-2xl bg-surface-700/80 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                        <Upload className="w-6 h-6 text-text-muted group-hover:text-accent transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                          Klik atau seret gambar ke sini
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          PNG, JPG, WEBP (maks 5MB)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      {/* Overlay gradien */}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 via-transparent to-transparent" />
                      {/* Tombol hapus */}
                      <button
                        onClick={clearImage}
                        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-surface-900/70 backdrop-blur-sm border border-border/50 flex items-center justify-center text-text-secondary hover:text-danger hover:border-danger/50 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {/* Info file */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-xs text-text-secondary bg-surface-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/30">
                          {imageFile?.name}
                        </span>
                        <span className="text-xs text-text-muted bg-surface-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/30">
                          {(imageFile!.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      {/* Scan line saat loading */}
                      {loading && <div className="absolute inset-0 scan-line pointer-events-none" />}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tombol Klasifikasi */}
            <button
              onClick={handleClassify}
              disabled={!canSubmit}
              className={`
                w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer
                ${canSubmit
                  ? "bg-gradient-to-r from-accent to-accent-dim text-surface-900 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-surface-700/50 text-text-muted cursor-not-allowed"}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Klasifikasi Sekarang
                </>
              )}
            </button>

            {/* Hint */}
            <p className="text-xs text-text-muted text-center leading-relaxed">
              Sistem ini menggunakan model pembelajaran mesin untuk mengklasifikasikan
              kebenaran informasi. Hasil bersifat probabilistik dan bukan pengganti
              pengecekan fakta manual.
            </p>
          </section>

          {/* ═══════════════ OUTPUT PANEL ═══════════════ */}
          <section className="lg:sticky lg:top-10 space-y-5">

            {/* Loading State */}
            {loading && (
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
            )}

            {/* Hasil Klasifikasi */}
            {result && !loading && (
              <div className="animate-slide-up space-y-4">
                {/* Card Utama — Struktur & Skor */}
                <div className={`
                  rounded-2xl bg-surface-800/80 backdrop-blur-sm border overflow-hidden transition-all duration-500
                  ${isHoax
                    ? "border-danger/30 glow-danger"
                    : "border-accent/30 glow-accent"}
                `}>
                  {/* Header card dengan warna indikator */}
                  <div className={`
                    px-6 py-4 flex items-center gap-3
                    ${isHoax
                      ? "bg-danger/10 border-b border-danger/20"
                      : "bg-accent/10 border-b border-accent/20"}
                  `}>
                    {isHoax ? (
                      <ShieldAlert className="w-6 h-6 text-danger" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-accent" />
                    )}
                    <div>
                      <h2 className="text-left text-lg font-bold tracking-tight">
                        {result.structure}
                      </h2>
                      <p className="text-xs text-text-muted">
                        {isHoax ? "Informasi terindikasi tidak benar" : "Informasi terverifikasi benar"}
                      </p>
                    </div>
                  </div>

                  {/* Body — Skor besar */}
                  <div className="p-6 space-y-6">
                    {/* Skor Percentage */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        {/* Background circle */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-surface-700"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="60" cy="60" r="52"
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 52}`}
                            strokeDashoffset={`${2 * Math.PI * 52 * (1 - result.score / 100)}`}
                            className={isHoax ? "text-danger" : "text-accent"}
                            style={{
                              transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                            }}
                          />
                        </svg>
                        {/* Tengah */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`
                            text-3xl font-extrabold tabular-nums
                            ${isHoax ? "text-danger" : "text-accent"}
                          `}>
                            {result.score}%
                          </span>
                          <span className="text-[10px] uppercase tracking-widest text-text-muted mt-0.5">
                            Confidence
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Detail Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Structure */}
                      <div className="rounded-xl bg-surface-700/40 border border-border/30 p-4 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-text-muted">Structure</p>
                        <p className={`
                          text-base font-bold
                          ${isHoax ? "text-danger" : "text-accent"}
                        `}>
                          {result.structure}
                        </p>
                      </div>
                      {/* Verification */}
                      <div className="rounded-xl bg-surface-700/40 border border-border/30 p-4 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-text-muted">Verification</p>
                        <div className="flex text-center justify-center items-center gap-2">
                          <span className={`
                            inline-block w-2 h-2 rounded-full
                            ${result.verification === "Yes" ? "bg-accent" : "bg-danger"}
                          `} />
                          <p className="text-base font-bold text-text-primary">
                            {result.verification}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Score bar linear */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Tingkat Keyakinan</span>
                        <span className={isHoax ? "text-danger font-semibold" : "text-accent font-semibold"}>
                          {result.score}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-700 overflow-hidden">
                        <div
                          className={`
                            h-full rounded-full transition-all duration-1000 ease-out
                            ${isHoax
                              ? "bg-gradient-to-r from-danger-dim to-danger"
                              : "bg-gradient-to-r from-accent-dim to-accent"}
                          `}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>Rendah</span>
                        <span>Sedang</span>
                        <span>Tinggi</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card JSON Raw */}
                <div className="rounded-2xl bg-surface-800/80 backdrop-blur-sm border border-border/40 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <FileJson className="w-3.5 h-3.5 text-accent/60" />
                      Raw JSON Response
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(jsonRaw)}
                      className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-accent/10"
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

            {/* Empty State */}
            {!result && !loading && (
              <div className="rounded-2xl bg-surface-800/40 border border-border/30 border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-surface-700/50 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-text-muted/40" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-muted">
                    Belum ada hasil analisis
                  </p>
                  <p className="text-xs text-text-muted/60 mt-1 max-w-[260px] mx-auto leading-relaxed">
                    Masukkan teks atau unggah gambar berita, lalu klik tombol
                    klasifikasi untuk melihat hasil.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-border/30 py-6 text-center">
        <p className="text-xs text-text-muted">
          HoaxGuard v1.0 — Sistem Klasifikasi Hoax Berbasis Machine Learning
        </p>
      </footer>
    </div>
  );
}
