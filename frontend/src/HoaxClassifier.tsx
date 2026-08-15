import { useCallback, useState } from "react";
import { Moon, Sun } from "lucide-react";
import type { ClassificationResult, InputMode } from "./types";
import { InputPanel } from "./components/InputPanel";
import { OutputPanel } from "./components/OutputPanel";
import logo from "../hoax.png";

export function HoaxClassifier() {
  const [mode, setMode] = useState<InputMode>("text");
  const [textInput, setTextInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [jsonRaw, setJsonRaw] = useState<string>("");
  const [isDark, setIsDark] = useState(true);

  /** Mengganti mode input sekaligus mengosongkan seluruh state yang berkaitan. */
  const handleModeSwitch = useCallback((newMode: InputMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setResult(null);
    setJsonRaw("");
    setImagePreview(null);
    setImageFile(null);
    setTextInput("");
  }, [mode]);

  /** Memperbarui teks input dan mengosongkan hasil sebelumnya. */
  const handleTextChange = useCallback((text: string) => {
    setTextInput(text);
    setResult(null);
    setJsonRaw("");
  }, []);

  /** Mengextract file yang diunggah lalu membuat pratinjau gambar. */
  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
    setJsonRaw("");
  }, []);

  /** Menghapus gambar yang telah diunggah dari state. */
  const handleImageClear = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    setResult(null);
    setJsonRaw("");
  }, []);

  /** Mereset seluruh input dan hasil analisis. */
  const handleReset = useCallback(() => {
    setTextInput("");
    setImagePreview(null);
    setImageFile(null);
    setResult(null);
    setJsonRaw("");
    setLoading(false);
  }, []);

  /** Mengirim teks/gambar ke backend dan memvalidasi respons yang diterima. */
  const handleClassify = useCallback(async () => {
    const hasInput = mode === "text" ? textInput.trim().length > 0 : !!imageFile;
    if (!hasInput) return;

    setLoading(true);
    setResult(null);
    setJsonRaw("");

    try {
      const url = `http://${window.location.hostname}:8000`;
      let finalResult: ClassificationResult | { error?: string };

      if (mode === "text") {
        const response = await fetch(`${url}/predict_word`, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: textInput,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        finalResult = await response.json();
      } else {
        const formData = new FormData();
        formData.append("file", imageFile!);
        const response = await fetch(`${url}/predict_pict`, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        finalResult = await response.json();
      }

      // Validasi hasil respons dari server
      if (finalResult && typeof finalResult === "object" && "error" in finalResult) {
        setResult(null);
        setJsonRaw(JSON.stringify(finalResult, null, 2));
        alert(`Error dari server: ${finalResult.error}`);
        return;
      }

      // Validasi apakah format respons sesuai yang diharapkan
      if (!finalResult || !("classification" in finalResult) || !("score" in finalResult)) {
        throw new Error("Format response dari server tidak sesuai");
      }

      setResult(finalResult as ClassificationResult);
      setJsonRaw(JSON.stringify(finalResult, null, 2));
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan saat menghubungi server";
      setJsonRaw(`{"error": "${errorMsg}"}`);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [mode, textInput, imageFile]);

  const hasInput = mode === "text" ? textInput.trim().length > 0 : !!imagePreview;
  const canSubmit = hasInput && !loading;

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("light", !next);
      return next;
    });
  }, []);

  return (
    <div className="noise-bg min-h-screen relative flex flex-col">
      {/* Dekorasi latar belakang */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full bg-danger/5 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/[0.02] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-md bg-surface-900/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-15 h-15 rounded-xl from-accent to-accent-dim flex items-center justify-center">
              <img src={logo} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-left text-text-primary leading-none">
                Hoax Guard
              </h1>
              <p className="text-s text-text-secondary text-left mt-0.5">Sistem Klasifikasi Hoax</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Konten utama */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <InputPanel
            mode={mode}
            onModeChange={handleModeSwitch}
            textInput={textInput}
            onTextChange={handleTextChange}
            imageFile={imageFile}
            imagePreview={imagePreview}
            onImageUpload={handleImageUpload}
            onImageClear={handleImageClear}
            onReset={handleReset}
            onClassify={handleClassify}
            canSubmit={canSubmit}
            loading={loading}
          />
          <OutputPanel loading={loading} result={result} jsonRaw={jsonRaw} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-6 text-center">
        <p className="text-xs text-text-muted">
          Hoax Guard v1.0 — Sistem Klasifikasi Hoax Berbasis Machine Learning
        </p>
      </footer>
    </div>
  );
}
