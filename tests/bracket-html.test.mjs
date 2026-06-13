import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

const count = (needle) => html.match(new RegExp(needle, "g"))?.length ?? 0;

test("provides exactly eight participant inputs", () => {
  assert.equal(count("data-player-input=\""), 8);
});

test("maps all eight participants into first-round bracket slots", () => {
  for (let seed = 1; seed <= 8; seed += 1) {
    assert.match(html, new RegExp(`data-seed="${seed}"`));
  }
});

test("orders first-round bracket seeds top to bottom", () => {
  const firstRound = Array.from(html.matchAll(/<div class="slot"[^>]*data-seed="(\d)"/g))
    .map((match) => Number(match[1]));

  assert.deepEqual(firstRound, [1, 5, 3, 7, 2, 6, 4, 8]);
});

test("uses A4 landscape print sizing and hides editing controls for print", () => {
  assert.match(html, /@page\s*{[^}]*size:\s*A4 landscape;/s);
  assert.match(html, /@media print\s*{[^}]*\.editor-panel\s*{[^}]*display:\s*none/s);
});

test("provides a language dropdown with five requested language codes", () => {
  const select = html.match(/<select[^>]*id="language-select"[\s\S]*?<\/select>/)?.[0];
  assert.ok(select);

  const options = Array.from(select.matchAll(/<option value="([a-z]{2})">/g))
    .map((match) => match[1]);

  assert.deepEqual(options, ["it", "en", "fr", "es", "de"]);
});

test("includes translation data and language switching behavior", () => {
  for (const language of ["it", "en", "fr", "es", "de"]) {
    assert.match(html, new RegExp(`${language}:\\s*{`));
  }

  assert.match(html, /function applyLanguage\(/);
  assert.match(html, /document\.documentElement\.lang = language/);
});

test("includes a print command and live bracket update script", () => {
  assert.match(html, /window\.print\(\)/);
  assert.match(html, /function updateBracket\(\)/);
});

test("inline script has valid JavaScript syntax", () => {
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotThrow(() => new Function(script));
});
