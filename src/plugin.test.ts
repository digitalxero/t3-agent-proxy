import { expect, it } from "@effect/vitest";
import type { PluginContext, PluginContributions } from "@t3tools/plugin-sdk";
import { PluginSecretResult, PluginView } from "@t3tools/plugin-sdk";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import plugin from "./plugin.ts";

const decodeView = Schema.decodeUnknownSync(PluginView);
const command = (contributions: PluginContributions, id: string) => {
  const result = contributions.commands?.find((command) => command.id === id);
  if (!result) throw new Error(`Missing command: ${id}`);
  return result.run;
};
const host = (saved = new Map<string, string>()): PluginContext => ({
  id: "agent-proxy",
  dataDirectory: "/unused",
  httpBasePath: "/api/plugins/agent-proxy",
  httpBaseUrl: Effect.succeed("http://127.0.0.1:43123/api/plugins/agent-proxy"),
  secrets: {
    get: (key) => Effect.sync(() => saved.get(key) ?? null),
    set: (key, value) =>
      Effect.sync(() => {
        saved.set(key, value);
      }),
    remove: (key) =>
      Effect.sync(() => {
        saved.delete(key);
      }),
  },
});

it.effect("activates using only the SDK and returns valid portable settings and usage", () =>
  Effect.scoped(
    Effect.gen(function* () {
      const contributions = yield* plugin.activate(host());
      expect(plugin.apiVersion).toBe(1);
      for (const view of contributions.views ?? []) {
        expect(decodeView(yield* view.read()).title).toBe("Agent proxy");
      }
      const status = yield* command(contributions, "status")({});
      expect(status).toMatchObject({ enabled: false, version: "0.1.1", accounts: [] });
      expect(
        contributions.commands
          ?.filter((command) =>
            [
              "reveal-key",
              "rotate-key",
              "import-account",
              "auth-start",
              "auth-complete",
              "configure-client",
            ].includes(command.id),
          )
          .every((command) => !command.agent),
      ).toBe(true);
    }),
  ),
);

it.effect(
  "imports privately, configures routing through the assigned port, and persists independently of T3",
  () =>
    Effect.scoped(
      Effect.gen(function* () {
        const saved = new Map<string, string>();
        const context = host(saved);
        const contributions = yield* plugin.activate(context);
        yield* command(contributions, "start")({});
        yield* command(
          contributions,
          "import-account",
        )({
          name: "codex-one.json",
          credential: JSON.stringify({ type: "codex", api_key: "upstream-private-test-value" }),
        });
        yield* command(
          contributions,
          "pool-settings",
        )({ strategy: "least-active-sessions", minutes: 4 });
        const launch = {
          provider: "codex",
          purpose: "agent" as const,
          args: ["app-server"],
          environment: { ORIGINAL: "preserved" },
        };
        const prepared = yield* contributions.prepareLaunch!(launch);
        expect(prepared.args.join(" ")).toContain(
          "http://127.0.0.1:43123/api/plugins/agent-proxy/v1",
        );
        expect(prepared.args.join(" ")).not.toContain("upstream-private-test-value");
        expect(prepared.environment.ORIGINAL).toBe("preserved");
        expect(launch.environment).toEqual({ ORIGINAL: "preserved" });
        for (const view of contributions.views ?? []) {
          const value = decodeView(yield* view.read());
          expect(JSON.stringify(value)).not.toContain("upstream-private-test-value");
        }
        const reloaded = yield* plugin.activate(context);
        expect(yield* command(reloaded, "status")({})).toMatchObject({
          enabled: true,
          strategy: "least-active-sessions",
          stickyIdleMinutes: 4,
          accounts: [{ name: "codex-one.json" }],
        });
        yield* command(contributions, "stop")({});
        expect(yield* contributions.prepareLaunch!(launch)).toEqual(launch);
      }),
    ),
);

it.effect("authenticates HTTP separately and rotates an explicitly disclosed key", () =>
  Effect.scoped(
    Effect.gen(function* () {
      const contributions = yield* plugin.activate(host());
      yield* command(contributions, "start")({});
      const first = Schema.decodeUnknownSync(PluginSecretResult)(
        yield* command(contributions, "reveal-key")({}),
      );
      expect(first.$t3).toBe("secret");
      const url = "http://test/api/plugins/agent-proxy/v1/models";
      expect((yield* contributions.handleHttp!(new Request(url))).status).toBe(401);
      expect(
        (yield* contributions.handleHttp!(
          new Request(url, { headers: { authorization: `Bearer ${first.value}` } }),
        )).status,
      ).toBe(200);
      const rotated = yield* command(contributions, "rotate-key")({});
      expect(rotated).not.toEqual(first);
      expect(
        (yield* contributions.handleHttp!(
          new Request(url, { headers: { authorization: `Bearer ${first.value}` } }),
        )).status,
      ).toBe(401);
      const forged = yield* command(
        contributions,
        "account-enabled",
      )({ action: "revealKey" }).pipe(Effect.result);
      expect(forged._tag).toBe("Failure");
    }),
  ),
);

it.effect("rejects oversized streamed JSON bodies and cancels the unread upload", () =>
  Effect.scoped(
    Effect.gen(function* () {
      const contributions = yield* plugin.activate(host());
      let cancelled = false;
      let chunks = 0;
      const body = new ReadableStream<Uint8Array>({
        pull(controller) {
          chunks++;
          controller.enqueue(new Uint8Array(65536));
        },
        cancel() {
          cancelled = true;
        },
      });
      const response = yield* contributions.handleHttp!(
        new Request("http://localhost/api/plugins/agent-proxy/v1/responses", {
          method: "POST",
          ...{ body, duplex: "half" },
        }),
      );
      expect(response.status).toBe(413);
      expect(cancelled).toBe(true);
      expect(chunks).toBeLessThanOrEqual(258);
      expect(yield* Effect.promise(() => response.json())).toMatchObject({
        error: { type: "body-too-large" },
      });
      expect((yield* contributions.views![0]!.read()).title).toBe("Agent proxy");
    }),
  ),
);

it.effect(
  "returns a JSON error for malformed request bodies without breaking subsequent requests",
  () =>
    Effect.scoped(
      Effect.gen(function* () {
        const contributions = yield* plugin.activate(host());
        yield* command(contributions, "start")({});
        const response = yield* contributions.handleHttp!(
          new Request("http://localhost/api/plugins/agent-proxy/v1/responses", {
            method: "POST",
            body: "{invalid-json",
          }),
        );
        expect(response.status).toBe(400);
        expect(yield* Effect.promise(() => response.json())).toMatchObject({
          error: { type: "json" },
        });
        expect(
          (yield* contributions.handleHttp!(
            new Request("http://localhost/api/plugins/agent-proxy/v1/models"),
          )).status,
        ).toBe(401);
      }),
    ),
);
