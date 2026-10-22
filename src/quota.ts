import type { ServerProviderUsageLimits, ServerProviderUsageWindow } from "./domain.ts";

const percent = (value: number) => Math.max(0, Math.min(100, value));
export function codexRateLimitsToLimits(input: {
  checkedAt: string;
  snapshot: {
    planType?: string | null;
    primary?: {
      usedPercent: number;
      resetsAt?: number | null;
      windowDurationMins?: number | null;
    } | null;
    secondary?: {
      usedPercent: number;
      resetsAt?: number | null;
      windowDurationMins?: number | null;
    } | null;
  };
}): ServerProviderUsageLimits {
  const monthly = ["free", "go"].includes(input.snapshot.planType ?? "");
  const windows: ServerProviderUsageWindow[] = [];
  for (const [id, value, fallback] of [
    ["primary", input.snapshot.primary, monthly ? 43200 : 300],
    ["secondary", input.snapshot.secondary, 10080],
  ] as const) {
    if (!value || !Number.isFinite(value.usedPercent)) continue;
    const minutes = value.windowDurationMins ?? fallback;
    const kind = minutes >= 43200 ? "monthly" : minutes >= 10080 ? "weekly" : "session";
    windows.push({
      id,
      kind,
      label: kind === "monthly" ? "Monthly" : kind === "weekly" ? "Weekly" : "Session",
      usedPercent: percent(value.usedPercent),
      windowDurationMins: minutes,
      ...(value.resetsAt && Number.isFinite(value.resetsAt)
        ? { resetsAt: new Date(value.resetsAt * 1000).toISOString() }
        : {}),
    });
  }
  return { checkedAt: input.checkedAt, windows };
}
export function claudeUsageResponseToLimits(input: {
  checkedAt: string;
  response: {
    rate_limits_available: boolean;
    rate_limits: {
      five_hour: { utilization: number; resets_at: string | null } | null;
      seven_day: { utilization: number; resets_at: string | null } | null;
    };
  };
}) {
  const windows: ServerProviderUsageWindow[] = [];
  for (const [id, kind, label, value, minutes] of [
    ["five_hour", "session", "Session", input.response.rate_limits.five_hour, 300],
    ["seven_day", "weekly", "Weekly", input.response.rate_limits.seven_day, 10080],
  ] as const) {
    if (value)
      windows.push({
        id,
        kind,
        label,
        usedPercent: percent(value.utilization),
        windowDurationMins: minutes,
        ...(value.resets_at ? { resetsAt: value.resets_at } : {}),
      });
  }
  return { limits: { checkedAt: input.checkedAt, windows } satisfies ServerProviderUsageLimits };
}
