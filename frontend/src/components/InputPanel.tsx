import { useRef } from "react";
import { FileJson, Image as ImageIcon, Loader2, Search, ShieldCheck, Sparkles, Trash2, Type, Upload, X } from "lucide-react";
import type { InputMode } from "../types";

interface InputPanelProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  textInput: string;
  onTextChange: (text: string) => void;
  imageFile: File | null;
  imagePreview: string | null;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  onReset: () => void;
  onClassify: () => void;
  canSubmit: boolean;
  loading: boolean;
}

/** Panel input: berisi pemilih mode (teks/gambar), area teks dengan penghitung
 *  karakter, area unggah gambar dengan pratinjau, serta tombol reset. */
export function InputPanel(props: InputPanelProps) {
  const {
    mode,
    onModeChange,
    textInput,
    onTextChange,
    imageFile,
    imagePreview,
    onImageUpload,
    onImageClear,
    onReset,
    onClassify,
    canSubmit,
    loading,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Mengambil file dari input file lalu meneruskannya ke parent untuk membuat pratinjau. */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageUpload(file);
  };

  /** Menghapus gambar: kosongkan nilai input file agar bisa memilih file yang sama lagi. */
  const handleClearImage = () => {
    onImageClear();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="space-y-5">
      {/* Pemilih mode input */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-800 border border-border/50 w-fit">
        <button
          onClick={() => onModeChange("text")}
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
          onClick={() => onModeChange("image")}
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

      {/* Area input */}
      <div className="gradient-border rounded-2xl bg-surface-800/80 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Sparkles className="w-3.5 h-3.5 text-accent/60" />
            {mode === "text" ? "Masukkan teks berita" : "Unggah gambar berita"}
          </div>
          {(textInput || imagePreview) && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-danger transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Input teks */}
        {mode === "text" && (
          <div className="p-4">
            <textarea
              value={textInput}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Tempelkan atau ketik teks berita yang ingin diperiksa di sini..."
              rows={8}
              className="w-full bg-transparent text-text-primary text-sm leading-relaxed placeholder:text-text-muted/60 resize-none outline-none"
            />
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <span className="text-xs text-text-muted">{textInput.length} karakter</span>
              {textInput.length > 0 && (
                <span
                  className={`
                    text-xs font-medium px-2.5 py-1 rounded-full
                    ${textInput.length < 20 ? "text-warn bg-warn/10" : "text-text-muted"}
                  `}
                >
                  {textInput.length < 20 ? "Terlalu pendek" : "Siap dianalisis"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Input gambar */}
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
                  <p className="text-xs text-text-muted mt-1">PNG, JPG, WEBP (maks 5MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden group">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 via-transparent to-transparent" />
                <button
                  onClick={handleClearImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-surface-900/70 backdrop-blur-sm border border-border/50 flex items-center justify-center text-text-secondary hover:text-danger hover:border-danger/50 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs text-text-secondary bg-surface-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/30">
                    {imageFile?.name}
                  </span>
                  <span className="text-xs text-text-muted bg-surface-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/30">
                    {(imageFile!.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                {loading && <div className="absolute inset-0 scan-line pointer-events-none" />}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tombol klasifikasi */}
      <button
        onClick={onClassify}
        disabled={!canSubmit}
        className={`
          w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer
          ${canSubmit
            ? "bg-gradient-to-r from-accent to-accent-dim text-surface-900 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0"
            : "bg-surface-700/50 text-text-secondary cursor-not-allowed"}
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
            Verifikasi Sekarang
          </>
        )}
      </button>

      <p className="text-xs text-text-muted text-center leading-relaxed">
        Sistem ini menggunakan model pembelajaran mesin untuk mengklasifikasikan
        kebenaran informasi. Hasil bersifat probabilistik dan bukan pengganti
        pengecekan fakta manual.
      </p>
    </section>
  );
}