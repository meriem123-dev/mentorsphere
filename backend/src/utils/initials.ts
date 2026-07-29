export function getInitialsFromName(name: string, maxLetters = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, maxLetters)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}