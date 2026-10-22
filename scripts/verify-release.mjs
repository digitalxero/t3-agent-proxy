import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("t3-plugin.json", root), "utf8"));
const metadata = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
assert.equal(manifest.version, metadata.version, "Install manifest must match the package version");
const { default: plugin } = await import(new URL(manifest.main, root).href);
for (const key of ["apiVersion", "id", "name", "version"]) {
  assert.equal(plugin[key], manifest[key], `Release bundle must match install manifest: ${key}`);
}
console.log(`Verified installable release ${manifest.id} v${manifest.version}`);
