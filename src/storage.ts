import type { PluginContext } from "@t3tools/plugin-sdk";
import * as Context from "effect/Context";
import * as Crypto from "effect/Crypto";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { ModelProxyError } from "./contracts.ts";
import { makeMailbox } from "./mailbox.ts";

export class ProxyStorage extends Context.Service<
  ProxyStorage,
  {
    readonly get: (name: string) => Effect.Effect<Option.Option<Uint8Array>, ModelProxyError>;
    readonly set: (name: string, value: Uint8Array) => Effect.Effect<void, ModelProxyError>;
    readonly create: (name: string, value: Uint8Array) => Effect.Effect<void, ModelProxyError>;
    readonly remove: (name: string) => Effect.Effect<void, ModelProxyError>;
    readonly getOrCreateRandom: (
      name: string,
      bytes: number,
    ) => Effect.Effect<Uint8Array, ModelProxyError>;
  }
>()("agent-proxy/Storage") {}

export const layer = (host: PluginContext) =>
  Layer.effect(
    ProxyStorage,
    Effect.gen(function* () {
      const mailbox = yield* makeMailbox;
      const crypto = yield* Crypto.Crypto;
      const failure = () => new ModelProxyError({ operation: "storage" });
      const get = (name: string) =>
        host.secrets.get(name).pipe(
          Effect.map((value) =>
            value === null
              ? Option.none()
              : Option.some(Uint8Array.from(Buffer.from(value, "base64"))),
          ),
          Effect.mapError(failure),
        );
      const set = (name: string, value: Uint8Array) =>
        host.secrets
          .set(name, Buffer.from(value).toString("base64"))
          .pipe(Effect.mapError(failure));
      return ProxyStorage.of({
        get,
        set: (name, value) => set(name, value).pipe(mailbox.run),
        create: (name, value) =>
          Effect.gen(function* () {
            if (Option.isSome(yield* get(name))) return yield* failure();
            yield* set(name, value);
          }).pipe(mailbox.run),
        remove: (name) => host.secrets.remove(name).pipe(Effect.mapError(failure), mailbox.run),
        getOrCreateRandom: (name, bytes) =>
          Effect.gen(function* () {
            const previous = yield* get(name);
            if (Option.isSome(previous)) return previous.value;
            const value = yield* crypto.randomBytes(bytes).pipe(Effect.mapError(failure));
            yield* set(name, value);
            return value;
          }).pipe(mailbox.run),
      });
    }),
  );
