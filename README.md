# T3 Agent Proxy

A standalone T3 Code plugin for pooling model accounts and routing agent traffic through one authenticated endpoint. It ports the model proxy proposed in [t3code#16677](https://github.com/pingdotgg/t3code/pull/16677) into an independent repository.

**This is a prototype for the proposed plugin host. Released upstream T3 Code versions do not currently load this plugin.** The host implementation is on [`t3/create-plugin-system`](https://github.com/djgilcrease/t3code/tree/t3/create-plugin-system). No existing builtin T3 feature is replaced.

## Install

In a T3 environment running the plugin host, open **Settings → Plugins** and paste:

```text
https://github.com/digitalxero/t3-agent-proxy
```

The host installs the newest stable `vX.Y.Z` Git tag. Tags contain the ready-to-run `dist/plugin.mjs`; installation does not run npm or repository scripts. Updates are checked daily while the environment is running, or with **Check for updates**. Choose **Update** to install one. **Remove** stops the plugin and deletes its managed state and credentials.

The plugin runs on the selected environment. Its settings and usage panels render through the host's portable controls on web, desktop, and mobile. It does not execute plugin UI JavaScript in a client.

## Use the proxy

1. Import an account or start its OAuth sign-in in the Agent proxy settings panel.
2. Start the proxy, then choose an account selection strategy.
3. Newly launched Codex, Claude Code, and managed OpenCode processes receive the appropriate routing configuration. Stop the proxy to restore normal launches. Already-running provider processes retain their original configuration until restarted.

Supported strategies are **closest reset**, **round robin**, and **least active sessions**. Session bindings are sticky for 12 minutes by default; configure 1–1,440 minutes. Failed or quota-limited accounts can fail over to another eligible account. Usage shows account health, quotas when the upstream exposes them, and active session counts. Email display is off by default.

Account import accepts a JSON credential object; `tokens` objects from Codex credentials are also recognized. For example, with a fresh test or real key entered privately in the password field:

```json
{"provider":"codex","api_key":"YOUR_OPENAI_API_KEY"}
```

Other credential providers are `claude`, `gemini`, `antigravity`, `kimi`, and `xai`. OAuth account imports can contain `access_token`, `refresh_token`, `id_token`, `email`, `account_id`, `project_id`, `expired`, or `expiry_date` as appropriate for their provider. Duplicate account names are rejected. Names must end in `.json`.

OAuth uses the provider's browser or device flow. When a browser callback cannot reach the environment, paste its final redirect URL into the private completion field. Google OAuth flows require operator-provided `T3CODE_PROXY_GEMINI_OAUTH_CLIENT_ID` / `T3CODE_PROXY_GEMINI_OAUTH_CLIENT_SECRET` or `T3CODE_PROXY_ANTIGRAVITY_OAUTH_CLIENT_ID` / `T3CODE_PROXY_ANTIGRAVITY_OAUTH_CLIENT_SECRET` environment variables. Provider policies, client registration, subscriptions, and endpoint availability still apply.

The HTTP API is under `/api/plugins/agent-proxy`. It accepts OpenAI Responses, Chat Completions, Anthropic Messages, and Google generation routes, including streaming and tool-call translation. Fetch `/v1/models` for the available models. Authenticate with the proxy key as a Bearer token, `x-api-key`, or the Google `key` query parameter.

**Reveal key** or **Rotate key** opens a masked, temporary private result with a copy action. Keys never appear in the ordinary settings/usage view or agent-readable command results. Rotating invalidates the previous key.

To route launches to another proxy environment, enter its reachable server URL and proxy key under the remote client settings. The plugin verifies the endpoint before saving it. Disconnect restores the local proxy selection. Automatic discovery of connected T3 environments is not currently provided.

## Isolation and access

The host supervises a separate OS process and stops a crash loop after five attempts by default. Its per-plugin restart limit is configurable. Private account and proxy credentials use the host's namespaced secret store. Activation, command, and HTTP failures are contained by the plugin host.

Install code you trust. This JavaScript runtime is not a malicious-code sandbox: the plugin runs as the environment's OS user and can access that user's resources. An OS process and a V8 heap limit do not protect the entire machine against a malicious plugin or system-wide memory exhaustion. The plugin does not use WASM.

Agents can inspect nonsecret status and explicitly exposed management actions through the host's generic plugin MCP tools. Credential import, OAuth completion, remote-key configuration, and key disclosure are client-only actions. Actual permissions are checked by the host against each registered command.

## Develop and verify

Use Node.js 24 and npm:

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
npm run lint
npm run build
```

`task check` runs the same checks. The bundle contains its runtime dependencies and imports no T3 server internals. `vendor/plugin-sdk` is a source snapshot of the proposed public SDK until that package is published. It is bundled into the plugin, so no SDK installation is needed on the environment.

The test suite covers account lifecycle and persistence, quota and token refresh, authenticated routes, account selection, session leases, streaming/protocol translation, portable view validation, private key rotation, and launch routing. Unit tests use synthetic credentials and upstream fixtures; passing them does not establish successful live OAuth or inference for every provider. Linux/macOS CI rebuilds the committed bundle to check reproducibility.

Source provenance and retained MIT notices are in [NOTICE](NOTICE) and [LICENSE](LICENSE). Repository release procedures are in [.repo-policy/RELEASING.md](.repo-policy/RELEASING.md).
