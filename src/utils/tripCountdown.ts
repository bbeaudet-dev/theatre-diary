/**
 * Human-readable countdown for a trip, used on TripCard and anywhere else
 * a concise time label is needed.
 *
 * Symmetric scale applied identically in both directions:
 *   1 day               → "Tomorrow" / "Ends tomorrow" / "Xd ago"
 *   2–6 days            → "In Xd"    / "Ends in Xd"   / "Xd ago"
 *   7–27 days           → "In Xw"    / "Ends in Xw"   / "Xw ago"
 *   28 days – 11 months → "In Xmo"   / "Ends in Xmo"  / "Xmo ago"
 *   ≥ 12 months         → "In Xy"    / "Ends in Xy"   / "Xy ago"
 *
 * Active trips show how much time is left; upcoming show how far until start;
 * past trips show elapsed time since the trip ended.
 */

export type TripPhase = "upcoming" | "active" | "past";

export interface TripCountdown {
  text: string | null;
  phase: TripPhase;
}

/** Converts a number of days into the most appropriate unit. */
function scaleTime(days: number): string {
  if (days < 7) return `${days}d`;
  if (days < 28) return `${Math.floor(days / 7)}w`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

export function getTripCountdown(startDate: string, endDate: string): TripCountdown {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // ── Active ────────────────────────────────────────────────────────────────
  if (startDate <= todayStr && endDate >= todayStr) {
    const end = new Date(endDate + "T00:00:00Z");
    const daysLeft = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft === 0) return { text: "Ends today", phase: "active" };
    if (daysLeft === 1) return { text: "Ends tomorrow", phase: "active" };
    return { text: `Ends in ${scaleTime(daysLeft)}`, phase: "active" };
  }

  // ── Upcoming ──────────────────────────────────────────────────────────────
  if (startDate > todayStr) {
    const start = new Date(startDate + "T00:00:00Z");
    const daysUntil = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil === 1) return { text: "Tomorrow", phase: "upcoming" };
    return { text: `In ${scaleTime(daysUntil)}`, phase: "upcoming" };
  }

  // ── Past ──────────────────────────────────────────────────────────────────
  const end = new Date(endDate + "T00:00:00Z");
  const daysSinceEnd = Math.round((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
  return { text: `${scaleTime(daysSinceEnd)} ago`, phase: "past" };
}
