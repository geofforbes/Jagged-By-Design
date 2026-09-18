/** "2 hours ago" / "Yesterday" / "14 Sep" — matches how the family actually talks about updates. */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffHours = diffMs / 3_600_000;

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) {
    const hours = Math.floor(diffHours);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfThen = new Date(then);
  startOfThen.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((startOfToday.getTime() - startOfThen.getTime()) / 86_400_000);

  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return new Date(iso).toLocaleDateString("en-GB", { weekday: "long" });
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const time = new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}
