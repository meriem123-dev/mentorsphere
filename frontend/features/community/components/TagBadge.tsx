import type { PostTag } from "../../../types/communityTypes";

const TAG_CONFIG: Record<PostTag, { label: string; className: string }> = {
  MILESTONE: { label: "Milestone", className: "bg-emerald-100 text-emerald-700" },
  QUESTION: { label: "Question", className: "bg-brand-rose/10 text-brand-rose" },
  UPDATE: { label: "Update", className: "bg-brand-blue/10 text-brand-blue" },
};

export function TagBadge({ tag }: { tag: PostTag }) {
  const config = TAG_CONFIG[tag];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}