export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}

export function getLabelClass(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("comfort")) return "comfort";
  if (l.includes("reliable")) return "reliable";
  if (l.includes("spicy")) return "spicy";
  if (l.includes("late night") || l.includes("late")) return "latenight";
  if (l.includes("good value") || l.includes("value")) return "goodvalue";
  if (l.includes("delivery")) return "delivery-risk";
  return "";
}

export function getLabelEmoji(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("comfort")) return "\u2601";
  if (l.includes("reliable")) return "\u2713";
  if (l.includes("spicy")) return "\uD83C\uDF36";
  if (l.includes("late night") || l.includes("late")) return "\uD83C\uDF19";
  if (l.includes("good value") || l.includes("value")) return "$";
  if (l.includes("delivery")) return "\u26A0";
  return "";
}
