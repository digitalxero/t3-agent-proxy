import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { ModelProxyError } from "./contracts.ts";

export class ProxyRuntime extends Context.Service<
  ProxyRuntime,
  {
    readonly baseUrl: Effect.Effect<string, ModelProxyError>;
  }
>()("agent-proxy/Runtime") {}
