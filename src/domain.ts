import * as Schema from "effect/Schema";

export const TrimmedNonEmptyString = Schema.String.check(
  Schema.makeFilter((value) => value.trim().length > 0),
);
export const IsoDateTime = Schema.String;
export const ProviderDriverKind = Schema.Literals([
  "codex",
  "claudeAgent",
  "opencode",
  "cursor",
  "grok",
  "antigravity",
  "acp",
]);
export type ProviderDriverKind = string;
export const ServerProviderUsageWindow = Schema.Struct({
  id: Schema.String,
  kind: Schema.Literals(["session", "weekly", "monthly", "other"]),
  label: Schema.String,
  usedPercent: Schema.Number,
  resetsAt: Schema.optional(Schema.String),
  windowDurationMins: Schema.optional(Schema.Number),
});
export type ServerProviderUsageWindow = typeof ServerProviderUsageWindow.Type;
export const ServerProviderUsageLimits = Schema.Struct({
  checkedAt: Schema.String,
  windows: Schema.Array(ServerProviderUsageWindow),
  unavailable: Schema.optional(
    Schema.Struct({
      reason: Schema.Literals(["unsupported", "probeFailed"]),
      message: Schema.optional(Schema.String),
    }),
  ),
});
export type ServerProviderUsageLimits = typeof ServerProviderUsageLimits.Type;
