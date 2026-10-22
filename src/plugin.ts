import type {
  PluginAction,
  PluginBlock,
  PluginCommandDescriptor,
  PluginContributions,
  PluginInput,
  PluginLaunch,
  PluginView,
  T3Plugin,
} from "@t3tools/plugin-sdk";
import { PluginError } from "@t3tools/plugin-sdk";
import * as NodeCrypto from "@effect/platform-node/NodeCrypto";
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import { FetchHttpClient, HttpServerResponse } from "effect/http";
import { ModelProxy, layer as proxyLayer } from "./ModelProxy.ts";
import {
  ModelProxyManageInput,
  ModelProxyProvider,
  ModelProxySnapshot,
  ModelProxyStrategy,
  ModelProxyError,
} from "./contracts.ts";
import * as ProxyRuntime from "./runtime.ts";
import * as ProxyStorage from "./storage.ts";

import { version } from "./version.ts";
const MAX_REQUEST_BYTES = 16 * 1024 * 1024;
class RequestBodyTooLarge extends Error {}

const readPayload = (request: Request) =>
  Effect.tryPromise({
    try: async () => {
      const reader = request.body?.getReader();
      if (!reader) return JSON.parse("") as unknown;
      try {
        const chunks: Uint8Array[] = [];
        let size = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_REQUEST_BYTES) {
            await reader.cancel().catch(() => {});
            throw new RequestBodyTooLarge();
          }
          chunks.push(value);
        }
        return JSON.parse(
          new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks, size)),
        ) as unknown;
      } finally {
        reader.releaseLock();
      }
    },
    catch: (cause) =>
      new PluginError({
        operation: cause instanceof RequestBodyTooLarge ? "body-too-large" : "json",
        cause: null,
      }),
  });
const decodeManage = Schema.decodeUnknownEffect(ModelProxyManageInput);
const decodeCredential = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Record(Schema.String, Schema.Unknown)),
);
const decodeConfigArgs = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Struct({ args: Schema.Array(Schema.String) })),
);
const encodeSnapshot = Schema.encodeEffect(Schema.fromJsonString(ModelProxySnapshot));
const decodeJson = Schema.decodeUnknownEffect(Schema.fromJsonString(Schema.Json));
const Preferences = Schema.Struct({ provider: Schema.String, showEmails: Schema.Boolean });
const decodePreferences = Schema.decodeUnknownEffect(Schema.fromJsonString(Preferences));
const encodePreferences = Schema.encodeEffect(Schema.fromJsonString(Preferences));
const toPluginError = (error: ModelProxyError) =>
  new PluginError({ operation: error.operation, cause: null });
const providerLabel = (provider: string) =>
  ({
    codex: "Codex",
    claude: "Claude",
    gemini: "Gemini",
    antigravity: "Antigravity",
    kimi: "Kimi",
    xai: "xAI",
  })[provider] ?? provider;
const action = (
  id: string,
  label: string,
  command: string,
  input: PluginInput = {},
): PluginAction => ({ id, label, command, input });

export default {
  apiVersion: 1,
  id: "agent-proxy",
  name: "Agent proxy",
  version,
  description: "An external OAuth account pool with quota-aware model routing.",
  activate: (host) =>
    Effect.gen(function* () {
      const context = yield* Layer.build(
        proxyLayer.pipe(
          Layer.provide(ProxyStorage.layer(host)),
          Layer.provide(
            Layer.succeed(ProxyRuntime.ProxyRuntime, {
              baseUrl: host.httpBaseUrl.pipe(
                Effect.mapError(() => new ModelProxyError({ operation: "disabled" })),
              ),
            }),
          ),
          Layer.provide(FetchHttpClient.layer),
          Layer.provide(NodeCrypto.layer),
        ),
      );
      const proxy = Context.get(context, ModelProxy);
      const revision = yield* SubscriptionRef.make(0);
      const changed = SubscriptionRef.update(revision, (n) => n + 1);
      const stored = yield* host.secrets.get("display-options");
      let preferences = stored
        ? yield* decodePreferences(stored).pipe(
            Effect.mapError(() => new PluginError({ operation: "display-options", cause: null })),
          )
        : { provider: "all", showEmails: false };
      let oauth: ModelProxySnapshot["oauth"];
      const manage = (input: ModelProxyManageInput) =>
        proxy.manage(input).pipe(Effect.mapError(toPluginError));
      const read = manage({ action: "status" });
      const serializable = (snapshot: ModelProxySnapshot) =>
        encodeSnapshot(snapshot).pipe(
          Effect.flatMap(decodeJson),
          Effect.mapError(() => new PluginError({ operation: "result", cause: null })),
        );
      const command = (
        id: string,
        title: string,
        description: string,
        permission: PluginCommandDescriptor["permission"],
        agent: boolean,
        run: (input: PluginInput) => Effect.Effect<Schema.Json, PluginError>,
      ): NonNullable<PluginContributions["commands"]>[number] => ({
        id,
        title,
        description,
        permission,
        agent,
        run,
      });
      const mutate = (input: PluginInput) =>
        decodeManage(input).pipe(
          Effect.mapError(() => new PluginError({ operation: "input", cause: null })),
          Effect.flatMap(manage),
          Effect.as(null),
        );
      const pollSignIn = Effect.suspend(() =>
        oauth?.status === "wait"
          ? manage({ action: "authStatus", provider: oauth.provider, state: oauth.state }).pipe(
              Effect.tap((snapshot) =>
                Effect.sync(() => {
                  oauth = snapshot.oauth;
                }),
              ),
              Effect.andThen(changed),
              Effect.asVoid,
            )
          : Effect.void,
      );
      yield* Effect.forever(
        Effect.sleep("5 seconds").pipe(Effect.andThen(pollSignIn), Effect.ignore),
      ).pipe(Effect.forkScoped);

      const accountTable = (
        snapshot: ModelProxySnapshot,
        provider: string,
        editable: boolean,
      ): PluginBlock => ({
        id: `accounts-${provider}`,
        kind: "table",
        columns: ["Account", "Provider", "Status", "Quota remaining", "Next reset", "Sessions"],
        rows: snapshot.accounts
          .filter(
            (account) =>
              (provider === "all" || account.provider === provider) &&
              (preferences.provider === "all" || account.provider === preferences.provider),
          )
          .map((account) => ({
            id: account.id,
            cells: [
              preferences.showEmails && account.email
                ? account.email
                : account.name.replace(/[^/]*@[^.]+/g, "account"),
              providerLabel(account.provider),
              account.status,
              account.usageLimits?.unavailable
                ? "Unavailable"
                : account.usageLimits?.windows
                    .map(
                      (window) =>
                        `${window.label}: ${Math.max(0, 100 - window.usedPercent).toFixed(0)}%`,
                    )
                    .join(" · ") || "Not reported",
              account.usageLimits?.windows
                .flatMap((window) =>
                  window.resetsAt
                    ? [`${window.label}: ${new Date(window.resetsAt).toLocaleString()}`]
                    : [],
                )
                .join(" · ") || "Not reported",
              String(account.activeSessions ?? 0),
            ],
            actions: editable
              ? [
                  action(
                    "toggle",
                    account.disabled ? "Enable account" : "Disable account",
                    "account-enabled",
                    { action: "setAccountEnabled", name: account.name, enabled: account.disabled },
                  ),
                  action("remove", "Remove account", "remove-account", {
                    action: "removeAccount",
                    name: account.name,
                  }),
                ]
              : [],
          })),
      });
      const view = (location: "settings" | "usage"): Effect.Effect<PluginView, PluginError> =>
        Effect.gen(function* () {
          const snapshot = yield* read;
          const mode =
            snapshot.client.configured && !snapshot.client.local
              ? "Client"
              : snapshot.enabled
                ? "Server"
                : "Disabled";
          const blocks: PluginBlock[] = [
            {
              id: "status",
              kind: "text",
              text: `${mode} · ${snapshot.accounts.length} accounts · ${snapshot.strategy} · ${snapshot.stickyIdleMinutes} minute session affinity`,
            },
          ];
          if (snapshot.error) blocks.push({ id: "error", kind: "text", text: snapshot.error });
          if (location === "settings") {
            blocks.push({
              id: "mode",
              kind: "actions",
              actions: [
                action("start", "Run proxy server", "start"),
                action("stop", "Disable proxy routing", "stop"),
              ],
            });
            blocks.push({
              id: "pool-settings",
              kind: "form",
              label: "Save pool settings",
              command: "pool-settings",
              input: {},
              fields: [
                {
                  name: "strategy",
                  label: "Account selection",
                  kind: "select",
                  value: snapshot.strategy,
                  options: ModelProxyStrategy.literals.map((value) => ({
                    value,
                    label: {
                      "round-robin": "Round robin",
                      "closest-reset": "Closest to reset",
                      "least-active-sessions": "Least active sessions",
                    }[value],
                  })),
                },
                {
                  name: "minutes",
                  label: "Sticky idle minutes (1–1440)",
                  kind: "number",
                  value: snapshot.stickyIdleMinutes,
                  required: true,
                },
              ],
            });
            blocks.push({
              id: "api",
              kind: "text",
              text: `Model endpoint: ${host.httpBasePath}/v1. Remote clients need a directly reachable URL. Existing CLI sessions keep their old routing until restarted.`,
            });
            blocks.push({
              id: "keys",
              kind: "actions",
              actions: [
                action("show", "Show proxy API key", "reveal-key"),
                action("rotate", "Rotate proxy API key", "rotate-key"),
              ],
            });
            blocks.push({
              id: "oauth",
              kind: "form",
              label: "Start provider sign-in",
              command: "auth-start",
              input: { action: "authStart" },
              fields: [
                {
                  name: "provider",
                  label: "Provider",
                  kind: "select",
                  value: "codex",
                  options: ModelProxyProvider.literals.map((value) => ({
                    value,
                    label: providerLabel(value),
                  })),
                },
              ],
            });
            if (oauth) {
              blocks.push({
                id: "oauth-status",
                kind: "text",
                text: `${providerLabel(oauth.provider)} sign-in: ${oauth.status}`,
              });
              if (oauth.status === "wait") {
                blocks.push({
                  id: "oauth-url",
                  kind: "link",
                  label: "Open provider sign-in",
                  url: oauth.url,
                });
                blocks.push({
                  id: "oauth-callback",
                  kind: "form",
                  label: "Complete sign-in",
                  command: "auth-complete",
                  input: { action: "authComplete", provider: oauth.provider, state: oauth.state },
                  fields: [
                    {
                      name: "redirect-url",
                      label: "Full callback URL (for a remote browser)",
                      kind: "password",
                      required: true,
                    },
                  ],
                });
                blocks.push({
                  id: "oauth-cancel",
                  kind: "actions",
                  actions: [
                    action("cancel", "Cancel sign-in", "auth-cancel", {
                      action: "authCancel",
                      state: oauth.state,
                    }),
                  ],
                });
              }
            }
            blocks.push({
              id: "import",
              kind: "form",
              label: "Import account",
              command: "import-account",
              input: {},
              fields: [
                {
                  name: "name",
                  label: "Account file name",
                  kind: "text",
                  value: "account.json",
                  required: true,
                },
                {
                  name: "credential",
                  label: "Credential JSON (never returned to clients)",
                  kind: "password",
                  required: true,
                },
              ],
            });
            blocks.push(accountTable(snapshot, "all", snapshot.enabled));
            blocks.push({
              id: "client",
              kind: "form",
              label: "Use remote proxy",
              command: "configure-client",
              input: { action: "configureClient" },
              fields: [
                {
                  name: "url",
                  label: "Remote proxy base URL (without /v1)",
                  kind: "text",
                  value: snapshot.client.url ?? "",
                  required: true,
                },
                {
                  name: "api-key",
                  label: "Remote proxy API key",
                  kind: "password",
                  required: true,
                },
              ],
            });
            blocks.push({
              id: "disconnect",
              kind: "actions",
              actions: [action("disconnect", "Disconnect remote proxy", "disconnect-client")],
            });
          } else {
            blocks.push({
              id: "refresh",
              kind: "actions",
              actions: [action("refresh", "Refresh account quotas", "refresh")],
            });
            const providers = [...new Set(snapshot.accounts.map((account) => account.provider))];
            for (const provider of providers) blocks.push(accountTable(snapshot, provider, false));
            if (!providers.length)
              blocks.push({
                id: "empty",
                kind: "text",
                text: "No proxy accounts. Configure Agent proxy under Settings → Plugins.",
              });
          }
          blocks.push({
            id: "display",
            kind: "form",
            label: "Save display options",
            command: "display-options",
            input: {},
            fields: [
              {
                name: "provider",
                label: "Provider filter",
                kind: "select",
                value: preferences.provider,
                options: [
                  { value: "all", label: "All providers" },
                  ...ModelProxyProvider.literals.map((value) => ({
                    value,
                    label: providerLabel(value),
                  })),
                ],
              },
              {
                name: "show-emails",
                label: "Show account email addresses",
                kind: "boolean",
                value: preferences.showEmails,
              },
            ],
          });
          return { title: "Agent proxy", blocks };
        });
      const readPermission = "diagnostics:read";
      return {
        changes: Stream.merge(
          proxy.changes,
          Stream.map(SubscriptionRef.changes(revision), () => undefined),
        ),
        commands: [
          command(
            "status",
            "Proxy status",
            "Read proxy configuration, accounts, and quota windows without credentials.",
            readPermission,
            true,
            () => read.pipe(Effect.flatMap(serializable)),
          ),
          command(
            "start",
            "Start proxy",
            "Start the account pool and route new supported CLI launches through it.",
            "providers:manage",
            true,
            () => manage({ action: "start" }).pipe(Effect.as(null)),
          ),
          command(
            "stop",
            "Stop proxy",
            "Stop routing new launches and stop the account pool.",
            "providers:manage",
            true,
            () => manage({ action: "stop" }).pipe(Effect.as(null)),
          ),
          command(
            "pool-settings",
            "Pool settings",
            "Choose quota-aware selection and sticky session idle expiry.",
            "providers:manage",
            true,
            (input) =>
              Effect.gen(function* () {
                const strategy = yield* decodeManage({
                  action: "setStrategy",
                  strategy: input.strategy,
                }).pipe(
                  Effect.mapError(() => new PluginError({ operation: "strategy", cause: null })),
                );
                const idle = yield* decodeManage({
                  action: "setStickyIdleMinutes",
                  minutes: input.minutes,
                }).pipe(
                  Effect.mapError(
                    () => new PluginError({ operation: "idle-minutes", cause: null }),
                  ),
                );
                yield* manage(strategy);
                yield* manage(idle);
                return null;
              }),
          ),
          command(
            "refresh",
            "Refresh quotas",
            "Refresh account quota windows.",
            readPermission,
            true,
            () => manage({ action: "refresh" }).pipe(Effect.as(null)),
          ),
          command(
            "account-enabled",
            "Enable or disable account",
            "Control whether an account can receive new requests.",
            "providers:manage",
            true,
            (input) => mutate({ ...input, action: "setAccountEnabled" }),
          ),
          command(
            "remove-account",
            "Remove account",
            "Remove an account and its stored credentials.",
            "providers:manage",
            true,
            (input) => mutate({ ...input, action: "removeAccount" }),
          ),
          command(
            "configure-client",
            "Configure client",
            "Verify a remote proxy and route new supported CLI launches through it.",
            "providers:manage",
            false,
            (input) => mutate({ ...input, action: "configureClient", apiKey: input["api-key"] }),
          ),
          command(
            "disconnect-client",
            "Disconnect client",
            "Remove this environment's remote proxy routing.",
            "providers:manage",
            true,
            () => manage({ action: "disconnectClient" }).pipe(Effect.as(null)),
          ),
          command(
            "import-account",
            "Import account",
            "Import credential JSON privately; the JSON is never returned.",
            "providers:manage",
            false,
            (input) =>
              decodeCredential(String(input.credential)).pipe(
                Effect.mapError(
                  () => new PluginError({ operation: "credential-json", cause: null }),
                ),
                Effect.flatMap((credential) =>
                  mutate({
                    action: "importAccount",
                    name: input.name ?? "account.json",
                    credential: credential as Schema.Json,
                  }),
                ),
              ),
          ),
          command(
            "auth-start",
            "Start sign-in",
            "Begin a provider's OAuth or device authorization flow.",
            "providers:manage",
            false,
            (input) =>
              decodeManage({ ...input, action: "authStart" }).pipe(
                Effect.mapError(() => new PluginError({ operation: "input", cause: null })),
                Effect.flatMap(manage),
                Effect.tap((snapshot) =>
                  Effect.sync(() => {
                    oauth = snapshot.oauth;
                  }),
                ),
                Effect.andThen(changed),
                Effect.as(null),
              ),
          ),
          command(
            "auth-complete",
            "Complete sign-in",
            "Complete the pending PKCE sign-in with its full callback URL.",
            "providers:manage",
            false,
            (input) =>
              decodeManage({
                ...input,
                action: "authComplete",
                redirectUrl: input["redirect-url"],
              }).pipe(
                Effect.mapError(() => new PluginError({ operation: "input", cause: null })),
                Effect.flatMap(manage),
                Effect.tap((snapshot) =>
                  Effect.sync(() => {
                    oauth = snapshot.oauth;
                  }),
                ),
                Effect.andThen(changed),
                Effect.as(null),
              ),
          ),
          command(
            "auth-cancel",
            "Cancel sign-in",
            "Cancel the pending provider authorization flow.",
            "providers:manage",
            false,
            (input) =>
              mutate({ ...input, action: "authCancel" }).pipe(
                Effect.tap(() =>
                  Effect.sync(() => {
                    oauth = undefined;
                  }),
                ),
                Effect.andThen(changed),
                Effect.as(null),
              ),
          ),
          ...(["revealKey", "rotateKey"] as const).map((operation) =>
            command(
              operation === "revealKey" ? "reveal-key" : "rotate-key",
              operation === "revealKey" ? "Show API key" : "Rotate API key",
              "Explicitly disclose the proxy API key only to this authorized caller.",
              "providers:manage",
              false,
              () =>
                manage({ action: operation }).pipe(
                  Effect.map((snapshot) => ({
                    $t3: "secret",
                    label: "Proxy API key",
                    value: snapshot.apiKey ?? "",
                  })),
                ),
            ),
          ),
          command(
            "display-options",
            "Display options",
            "Set provider filtering and email visibility for this environment's proxy panels.",
            "settings:write",
            false,
            (input) =>
              Effect.gen(function* () {
                const next = {
                  provider: String(input.provider),
                  showEmails: input["show-emails"] === true,
                };
                if (
                  next.provider !== "all" &&
                  !ModelProxyProvider.literals.includes(next.provider as ModelProxyProvider)
                )
                  return yield* new PluginError({ operation: "provider-filter", cause: null });
                yield* host.secrets.set(
                  "display-options",
                  yield* encodePreferences(next).pipe(
                    Effect.mapError(
                      () => new PluginError({ operation: "display-options", cause: null }),
                    ),
                  ),
                );
                preferences = next;
                yield* changed;
                return null;
              }),
          ),
        ],
        views: [
          {
            id: "settings",
            title: "Agent proxy",
            location: "settings",
            permission: "providers:manage",
            read: () => view("settings"),
          },
          {
            id: "usage",
            title: "Agent proxy",
            location: "usage",
            permission: readPermission,
            read: () => view("usage"),
          },
        ],
        prepareLaunch: (launch: PluginLaunch) =>
          Effect.gen(function* () {
            const environment = yield* proxy
              .environment(launch.provider, launch.environment)
              .pipe(Effect.mapError(toPluginError));
            if (!environment.AGENT_PROXY_CODEX_CONFIG) return { ...launch, environment };
            const args = yield* decodeConfigArgs(environment.AGENT_PROXY_CODEX_CONFIG).pipe(
              Effect.mapError(
                () => new PluginError({ operation: "codex-configuration", cause: null }),
              ),
            );
            const {
              AGENT_PROXY_CODEX_CONFIG: _internal,
              T3CODE_CODEX_LAUNCH_ARGS: _generated,
              ...rest
            } = environment;
            return {
              ...launch,
              args: [...launch.args, ...args.args],
              environment: {
                ...rest,
                ...(launch.environment.T3CODE_CODEX_LAUNCH_ARGS === undefined
                  ? {}
                  : { T3CODE_CODEX_LAUNCH_ARGS: launch.environment.T3CODE_CODEX_LAUNCH_ARGS }),
              },
            };
          }),
        handleHttp: (request) =>
          Effect.gen(function* () {
            const url = new URL(request.url);
            const apiKey =
              request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
              request.headers.get("x-api-key") ??
              url.searchParams.get("key") ??
              "";
            let payload: unknown = {};
            if (!["GET", "HEAD"].includes(request.method)) payload = yield* readPayload(request);
            const response = yield* proxy
              .forward({
                path: url.pathname.slice(host.httpBasePath.length) + url.search,
                method: request.method,
                apiKey,
                headers: Object.fromEntries(request.headers),
                payload,
              })
              .pipe(Effect.mapError(toPluginError));
            return HttpServerResponse.toWeb(response);
          }).pipe(
            Effect.catchTags({
              PluginError: (error) =>
                Effect.succeed(
                  Response.json(
                    { error: { message: error.message, type: error.operation } },
                    {
                      status:
                        error.operation === "body-too-large"
                          ? 413
                          : error.operation === "unauthorized"
                            ? 401
                            : error.operation === "noAccounts" || error.operation === "disabled"
                              ? 503
                              : error.operation === "unsupported" || error.operation === "json"
                                ? 400
                                : 502,
                    },
                  ),
                ),
            }),
          ),
      } satisfies PluginContributions;
    }),
} satisfies T3Plugin;
