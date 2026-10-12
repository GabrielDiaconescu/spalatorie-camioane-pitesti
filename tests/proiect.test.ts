// Verificări statice ale proiectului, legate de criteriile de acceptare:
// culori doar în :root, diacritice corecte, fără console.log, imagini mici, linkuri externe sigure, fără chei.

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { test } from "node:test";

const SOURCE_DIRS = ["app", "components", "lib"];
const HEX_COLOR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

function files(dir: string, extensions: string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, extensions);
    return extensions.includes(extname(path)) ? [path] : [];
  });
}

const sourceFiles = SOURCE_DIRS.flatMap((dir) => files(dir, [".ts", ".tsx", ".css"]));

test("culorile hex apar doar în blocul :root din globals.css", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const rootStart = css.indexOf(":root {");
  const rootEnd = css.indexOf("}", rootStart);
  const outsideRoot = css.slice(0, rootStart) + css.slice(rootEnd);
  assert.deepEqual(outsideRoot.match(HEX_COLOR), null);

  for (const file of sourceFiles.filter((path) => !path.endsWith("globals.css"))) {
    assert.deepEqual(readFileSync(file, "utf8").match(HEX_COLOR), null, file);
  }
});

test("textele folosesc ș și ț cu virgulă (fără caracterele cu sedilă)", () => {
  for (const file of sourceFiles) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /[ŞşŢţ]/, file);
  }
});

test("nu există console.log în codul publicat", () => {
  for (const file of sourceFiles) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /console\.log\(/, file);
  }
});

test("imaginile respectă limitele de mărime", () => {
  for (const file of files("public/images", [".webp", ".jpg", ".png", ".avif"])) {
    const kb = statSync(file).size / 1024;
    assert.ok(kb < 300, `${file}: ${kb.toFixed(0)} KB`);
    if (file.includes("hero-")) assert.ok(kb < 250, `${file}: ${kb.toFixed(0)} KB (hero < 250 KB)`);
    if (file.includes("galerie-") && !file.includes("-1280")) assert.ok(kb < 120, `${file}: ${kb.toFixed(0)} KB (card < 120 KB)`);
  }
});

test("fiecare <img> are width, height și alt", () => {
  for (const file of sourceFiles.filter((path) => path.endsWith(".tsx"))) {
    for (const tag of readFileSync(file, "utf8").match(/<img\b[^>]*>/gs) ?? []) {
      for (const attribute of ["width=", "height=", "alt="]) assert.ok(tag.includes(attribute), `${file}: ${attribute} lipsește`);
    }
  }
});

test("linkurile deschise în tab nou au rel=\"noopener noreferrer\"", () => {
  for (const file of sourceFiles.filter((path) => path.endsWith(".tsx"))) {
    for (const tag of readFileSync(file, "utf8").match(/<a\b[^>]*target="_blank"[^>]*>/gs) ?? []) {
      assert.ok(tag.includes('rel="noopener noreferrer"'), `${file}: ${tag.slice(0, 60)}`);
    }
  }
});

test("nu există chei sau parole reale în cod", () => {
  const all = [...sourceFiles, ...files("scripts", [".mjs"]), "next.config.ts", ".env.example"];
  for (const file of all) {
    const content = readFileSync(file, "utf8");
    assert.doesNotMatch(content, /re_[A-Za-z0-9_]{16,}/, `${file}: cheie Resend`);
    // Valorile false folosite în teste conțin cuvântul „test” și sunt permise.
    for (const match of content.matchAll(/(password|secret|api_key|token)\s*[:=]\s*["'](?<value>[^"']{6,})["']/gi)) {
      assert.match(match.groups?.value ?? "", /test/i, `${file}: ${match[0]}`);
    }
  }
  for (const line of readFileSync(".env.example", "utf8").split("\n")) {
    if (/^[A-Z_]+=/.test(line)) assert.match(line, /^[A-Z_]+=$/, `.env.example nu trebuie să conțină valori: ${line}`);
  }
});
