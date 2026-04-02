/** MIME types accepted by /api/upload (must match storage + embedding pipeline). */
export const UPLOAD_ALLOWED_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type UploadMime = (typeof UPLOAD_ALLOWED_MIMES)[number];

const EXT_TO_MIME: Record<string, UploadMime> = {
  ".pdf": "application/pdf",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const ALLOWED_SET = new Set<string>(UPLOAD_ALLOWED_MIMES);

/** Prefer File.type when set; otherwise infer from extension (many browsers leave type empty on drop). */
export function resolveUploadMime(file: File): UploadMime | null {
  if (file.type && ALLOWED_SET.has(file.type)) return file.type as UploadMime;
  const lower = file.name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot) : "";
  return EXT_TO_MIME[ext] ?? null;
}
