export type ResourceType = "document" | "video" | "link";

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  authorId: string;
  authorName: string;
  date: string;
  meta: string;
  isSaved: boolean;
  url?: string;
  fileUrl?: string;
}

export interface RawResourceFromApi {
  id: string;
  type: "DOCUMENT" | "VIDEO" | "LINK";
  title: string;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  sizeBytes: number | null;
  durationLabel: string | null;
  isSaved: boolean;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
}