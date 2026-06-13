import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(
  new URL("../.github/workflows/pages.yml", import.meta.url),
  "utf8"
);

test("deploys GitHub Pages from pushes to main and manual runs", () => {
  assert.match(workflow, /on:\n\s+push:\n\s+branches:\s+\[main\]/);
  assert.match(workflow, /workflow_dispatch:/);
});

test("grants the permissions required by deploy-pages", () => {
  assert.match(workflow, /contents:\s+read/);
  assert.match(workflow, /pages:\s+write/);
  assert.match(workflow, /id-token:\s+write/);
});

test("opts official actions into the Node 24 runtime", () => {
  assert.match(workflow, /FORCE_JAVASCRIPT_ACTIONS_TO_NODE24:\s+true/);
});

test("tests and publishes only the static site artifact", () => {
  assert.match(workflow, /node --test tests\/bracket-html\.test\.mjs/);
  assert.match(workflow, /cp index\.html _site\/index\.html/);
  assert.match(workflow, /path:\s+_site/);
});

test("uses the official GitHub Pages actions", () => {
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
