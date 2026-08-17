export type ResourceType = "document" | "video" | "link";

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  authorName: string;
  date: string; // "14 août"
  meta: string; // "2.4 MB · PDF", "18 min", "ycombinator.com"
  isSaved: boolean;
  url?: string;
}