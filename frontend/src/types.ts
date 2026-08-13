/** Jenis input yang sedang aktif: teks atau gambar. */
export type InputMode = "text" | "image";

/** Bentuk respons yang dikembalikan server backend untuk klasifikasi. */
export interface ClassificationResult {
  classification: "Hoax" | "Fact";
  score: number; // 0–100
  validation: "Yes" | "No";
}