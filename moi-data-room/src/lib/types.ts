export type DocumentCategory =
  | "contextual_compute"
  | "engineering"
  | "business"
  | "tokenomics"
  | "research"
  | "usecases";

export type DocumentStatus = "published" | "draft" | "restricted";

export type UserRole = "admin" | "investor" | "analyst" | "pending";

export type EmbeddingStatus = "pending" | "processing" | "completed" | "failed";

export interface Document {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  file_url: string | null;
  /** Public URL (Zenodo, etc.) when the doc is link-only; opens in a new tab. */
  external_url?: string | null;
  file_type: string;
  status: DocumentStatus;
  embedding_status: EmbeddingStatus;
  embedding_error: string | null;
  allow_download: boolean;
  show_on_overview: boolean;
  /** Pinned to this hero tile on /home; must match `HERO_CARDS.id`. */
  home_hero_slot?: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  view_count?: number;
}

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  company: string | null;
  access_granted: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface AnalyticsEvent {
  id: string;
  document_id: string;
  user_id: string | null;
  action: "view" | "download";
  viewed_at: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueInvestors: number;
  avgSession?: number;
  downloads: number;
}

export interface TopDocumentView {
  document_id: string;
  title: string;
  view_count: number;
}
