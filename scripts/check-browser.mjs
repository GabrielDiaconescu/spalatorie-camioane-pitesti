// Verificare automată într-un browser real (Chrome sau Edge instalat local), fără unelte suplimentare.
// Comunică direct cu browserul prin Chrome DevTools Protocol (WebSocket inclus în Node 22+).
//
// Ce verifică:
//  - lățimile 320, 360, 375, 768, 1024, 1440: scroll orizontal, ținte de atingere ≥ 44×44, un singur h1
//  - erori în consolă și resurse care nu se încarcă (404)
//  - butonul principal vizibil fără scroll pe 360×640
//  - navigarea din tastatură: focus vizibil, meniul mobil (Escape), galeria (Enter, săgeți, Escape)
//  - harta: nicio cerere către Google înainte de apăsarea butonului
//  - formularele: erori afișate sub câmpuri și trimitere reușită (către un server Resend fals)
//  - LCP și CLS pe mobil, cu rețea și procesor încetinite (aproximare a testului Lighthouse)
//
// Rulare: npm run build && npm run check:browser   (capturile de ecran ajung în test-results/)

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sleep, startMockResend, startNext } from "./lib-server.mjs";

const WIDTHS = [320, 360, 375, 768, 1024, 1440];
const PAGES = ["/", "/servicii", "/despre", "/contact", "/politica-de-confidentialitate", "/politica-de-cookie-uri"];
const OUT_DIR = "test-results/capturi";

const problems = [];
const notes = [];
const inlineLinks = new Set();
const fail = (message) => problems.push(message);

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) throw new Error("Nu am găsit Chrome sau Edge. Setează variabila CHROME_PATH.");
  return found;
}

async function launchBrowser() {
  const userDataDir = mkdtempSync(join(tmpdir(), "verificare-site-"));
  const proc = spawn(
    findBrowser(),
    ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${userDataDir}`, "--no-first-run", "--mute-audio", "about:blank"],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const wsUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Browserul nu a pornit.")), 20_000);
    proc.stderr.on("data", (chunk) => {
      const match = String(chunk).match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
  return {
    wsUrl,
    close: () => {
      proc.kill();
      try {
        rmSync(userDataDir, { recursive: true, force: true });
      } catch {
        // Folderul temporar poate fi încă blocat de browser; îl lasă sistemul.
      }
    },
  };
}

class Cdp {
  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    return new Cdp(socket);
  }

  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Set();
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
      } else if (message.method) {
        for (const listener of this.listeners) listener(message);
      }
    };
  }

  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

async function openPage(cdp) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => cdp.send(method, params, sessionId);
  await Promise.all(["Page.enable", "Runtime.enable", "Network.enable", "Log.enable"].map((m) => send(m)));

  const events = { errors: [], requests: [] };
  cdp.on((message) => {
    if (message.sessionId !== sessionId) return;
    const { method, params } = message;
    if (method === "Runtime.exceptionThrown") events.errors.push(`Excepție JS: ${params.exceptionDetails.text}`);
    if (method === "Runtime.consoleAPICalled" && params.type === "error") {
      events.errors.push(`console.error: ${params.args.map((a) => a.value ?? a.description).join(" ")}`);
    }
    if (method === "Log.entryAdded" && params.entry.level === "error") events.errors.push(`Log: ${params.entry.text} ${params.entry.url ?? ""}`);
    if (method === "Network.requestWillBeSent") events.requests.push(params.request.url);
    if (method === "Network.responseReceived" && params.response.status >= 400) {
      events.errors.push(`HTTP ${params.response.status}: ${params.response.url}`);
    }
    if (method === "Network.loadingFailed" && !params.canceled) events.errors.push(`Resursă eșuată: ${params.errorText}`);
  });

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(`Eroare în pagină: ${result.exceptionDetails.text}`);
    return result.result.value;
  }

  async function goto(url) {
    events.errors.length = 0;
    events.requests.length = 0;
    const loaded = new Promise((resolve) => {
      const off = cdp.on((message) => {
        if (message.sessionId === sessionId && message.method === "Page.loadEventFired") {
          off();
          resolve();
        }
      });
    });
    await send("Page.navigate", { url });
    await loaded;
    await sleep(400);
  }

  async function press(key, extra = {}) {
    const codes = { Tab: 9, Enter: 13, Escape: 27, ArrowRight: 39, ArrowLeft: 37 };
    // Enter trebuie să trimită și caracterul „\r”, altfel browserul nu activează butonul.
    const text = key === "Enter" ? { text: "\r", unmodifiedText: "\r" } : {};
    const base = { key, code: key, windowsVirtualKeyCode: codes[key], ...text, ...extra };
    await send("Input.dispatchKeyEvent", { type: "keyDown", ...base });
    await send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
    await sleep(120);
  }

  async function viewport(width, height = width < 768 ? 740 : 900) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  }

  return { send, evaluate, goto, press, viewport, events, close: () => cdp.send("Target.closeTarget", { targetId }) };
}

const LAYOUT_CHECK = `(() => {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"
      && !el.closest('[aria-hidden="true"]') && !el.closest("dialog:not([open])");
  };
  const small = [];
  for (const el of document.querySelectorAll("a, button, input, select, textarea, summary")) {
    if (!visible(el)) continue;
    const target = el.type === "checkbox" ? el.closest("label") : el;
    const r = target.getBoundingClientRect();
    if (r.width >= 44 && r.height >= 44) continue;
    // WCAG 2.5.8: linkurile din interiorul unui text sunt exceptate.
    const inline = el.tagName === "A" && getComputedStyle(el).display === "inline";
    small.push({ text: (el.getAttribute("aria-label") || el.innerText || el.name || el.tagName).trim().slice(0, 50), w: Math.round(r.width), h: Math.round(r.height), inline });
  }
  return {
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    h1: document.querySelectorAll("h1").length,
    small,
  };
})()`;

async function checkLayouts(page, base) {
  mkdirSync(OUT_DIR, { recursive: true });
  // Pentru capturi dezactivăm animațiile (mișcare redusă), ca tot conținutul să fie vizibil.
  await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });

  for (const path of PAGES) {
    for (const width of WIDTHS) {
      await page.viewport(width);
      await page.goto(base + path);
      const label = `${path === "/" ? "/acasa" : path} @ ${width}px`;
      const result = await page.evaluate(LAYOUT_CHECK);
      if (result.overflow > 0) fail(`${label}: scroll orizontal de ${result.overflow}px`);
      if (result.h1 !== 1) fail(`${label}: ${result.h1} elemente h1 (trebuie exact 1)`);
      for (const item of result.small) {
        if (item.inline) inlineLinks.add(item.text);
        else fail(`${label}: țintă prea mică „${item.text}” ${item.w}×${item.h}`);
      }
      for (const error of page.events.errors) fail(`${label}: ${error}`);

      const { cssContentSize } = await page.send("Page.getLayoutMetrics");
      const shot = await page.send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 70,
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height: Math.ceil(cssContentSize.height), scale: 1 },
      });
      const name = `${(path === "/" ? "acasa" : path.slice(1)).replace(/\//g, "-")}-${width}.jpg`;
      writeFileSync(join(OUT_DIR, name), Buffer.from(shot.data, "base64"));
    }
  }

  // Butonul principal trebuie să fie vizibil fără scroll pe 360×640, deasupra barei de apel.
  await page.viewport(360, 640);
  await page.goto(`${base}/`);
  const cta = await page.evaluate(`(() => {
    const button = document.querySelector(".hero .btn--primary").getBoundingClientRect();
    const bar = document.querySelector(".contact-bar");
    const limit = bar && getComputedStyle(bar).display !== "none" ? bar.getBoundingClientRect().top : innerHeight;
    return { bottom: Math.round(button.bottom), limit: Math.round(limit) };
  })()`);
  if (cta.bottom > cta.limit) fail(`Acasă @ 360×640: butonul principal se termină la ${cta.bottom}px, dar zona vizibilă e ${cta.limit}px`);
  else notes.push(`Acasă @ 360×640: butonul principal vizibil fără scroll (jos la ${cta.bottom}px din ${cta.limit}px)`);

  await page.send("Emulation.setEmulatedMedia", { features: [] });
}

const FOCUS_INFO = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const style = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    text: (el.getAttribute("aria-label") || el.innerText || el.name || el.tagName).trim().slice(0, 40),
    outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2,
    visible: r.width > 0 && r.height > 0 && !el.closest(".hp"),
  };
})()`;

async function checkKeyboard(page, base) {
  // Parcurgem fiecare pagină cu Tab și verificăm că fiecare element focalizat are contur vizibil.
  for (const width of [375, 1440]) {
    await page.viewport(width);
    for (const path of PAGES) {
      await page.goto(base + path);
      for (let step = 0; step < 80; step++) {
        await page.press("Tab");
        const info = await page.evaluate(FOCUS_INFO);
        if (!info) continue;
        // Am parcurs toată pagina când focusul revine la primul link.
        if (step > 0 && info.text === "Sari la conținut") break;
        if (step === 0 && info.text !== "Sari la conținut") fail(`${path} @ ${width}px: primul Tab nu ajunge la „Sari la conținut”`);
        if (!info.visible) fail(`${path} @ ${width}px: focus pe un element invizibil („${info.text}”)`);
        if (!info.outline) fail(`${path} @ ${width}px: focus fără contur vizibil pe „${info.text}”`);
      }
    }
  }

  // Meniul mobil: se deschide cu Enter și se închide cu Escape, cu focusul înapoi pe buton.
  await page.viewport(375);
  await page.goto(`${base}/`);
  await page.evaluate(`document.querySelector(".menu-toggle").focus()`);
  await page.press("Enter");
  const opened = await page.evaluate(`document.querySelector(".menu-toggle").getAttribute("aria-expanded")`);
  await page.press("Escape");
  const closed = await page.evaluate(`({ expanded: document.querySelector(".menu-toggle").getAttribute("aria-expanded"), focus: document.activeElement === document.querySelector(".menu-toggle") })`);
  if (opened !== "true" || closed.expanded !== "false" || !closed.focus) {
    fail(`Meniul mobil: deschis=${opened}, după Escape=${closed.expanded}, focus pe buton=${closed.focus}`);
  } else notes.push("Meniul mobil: Enter deschide, Escape închide și focusul revine pe buton");

  // Galeria: Enter deschide, săgeata schimbă imaginea, Escape închide, focusul revine pe imaginea de pornire.
  await page.viewport(1440);
  await page.goto(`${base}/despre`);
  await page.evaluate(`document.querySelectorAll(".gallery__button")[1].focus()`);
  await page.press("Enter");
  const dialog = await page.evaluate(`({ open: document.querySelector("dialog").open, inside: document.querySelector("dialog").contains(document.activeElement) })`);
  await page.press("ArrowRight");
  const caption = await page.evaluate(`document.querySelector(".lightbox__caption").textContent`);
  await page.press("Escape");
  const after = await page.evaluate(`({ open: document.querySelector("dialog").open, back: document.activeElement === document.querySelectorAll(".gallery__button")[1] })`);
  if (!dialog.open || !dialog.inside || !caption.includes("3 din") || after.open || !after.back) {
    fail(`Galeria: deschisă=${dialog.open}, focus în dialog=${dialog.inside}, „${caption}”, închisă=${!after.open}, focus înapoi=${after.back}`);
  } else notes.push("Galeria: Enter, săgeți și Escape funcționează; focusul revine pe imaginea de pornire");
}

async function checkMapAndForms(page, base, mock) {
  await page.viewport(1440);
  await page.goto(`${base}/contact`);
  const googleBefore = page.events.requests.filter((url) => url.includes("google")).length;
  if (googleBefore > 0) fail(`Harta: ${googleBefore} cereri către Google înainte de acord`);
  else notes.push("Harta: nicio cerere către Google la încărcarea paginii");
  await page.evaluate(`[...document.querySelectorAll("button")].find((b) => b.textContent.includes("Încarcă harta")).click()`);
  await sleep(300);
  const iframe = await page.evaluate(`document.querySelector(".map iframe")?.getAttribute("title") ?? null`);
  if (!iframe) fail("Harta: iframe-ul nu apare după apăsarea butonului");

  // Cererea de programare trimisă goală: erori sub câmpuri, focus pe primul câmp greșit, fără cerere la server.
  await page.goto(`${base}/contact`);
  await page.evaluate(`document.querySelector("#programare form button[type=submit]").click()`);
  await sleep(200);
  const bookingErrors = await page.evaluate(`(() => {
    const form = document.querySelector("#programare form");
    const invalid = [...form.querySelectorAll('[aria-invalid="true"]')];
    const linked = invalid.every((field) => (field.getAttribute("aria-describedby") || "").split(" ").some((id) => id && document.getElementById(id)?.classList.contains("field__error")));
    return { count: invalid.length, linked, focus: document.activeElement?.name, status: form.querySelector('[role="status"]').textContent };
  })()`);
  const apiCalls = page.events.requests.filter((url) => url.includes("/api/")).length;
  if (bookingErrors.count < 5 || !bookingErrors.linked || bookingErrors.focus !== "nume" || apiCalls > 0) {
    fail(`Programare goală: ${JSON.stringify(bookingErrors)}, cereri API=${apiCalls}`);
  } else notes.push(`Programare goală: ${bookingErrors.count} erori sub câmpuri, legate cu aria-describedby, focus pe „nume”`);

  // Formularul de contact: e-mail invalid și fără acord → blocat.
  await page.evaluate(`(() => {
    const form = document.querySelector("#mesaj-titlu").closest("section").querySelector("form");
    const set = (name, value) => { form.elements[name].value = value; };
    set("nume", "Ion Popescu"); set("email", "adresa-gresita"); set("mesaj", "Aș dori o ofertă pentru 10 camioane.");
    form.querySelector("button[type=submit]").click();
  })()`);
  await sleep(200);
  const contactErrors = await page.evaluate(`(() => {
    const form = document.querySelector("#mesaj-titlu").closest("section").querySelector("form");
    return [...form.querySelectorAll('[aria-invalid="true"]')].map((f) => f.name);
  })()`);
  if (!contactErrors.includes("email") || !contactErrors.includes("consimtamant")) fail(`Contact invalid: câmpuri marcate ${contactErrors.join(", ")}`);
  else notes.push("Contact: e-mail invalid și lipsa acordului sunt blocate cu mesaj sub câmp");

  // Trimitere validă: mesajul ajunge la serverul Resend fals, formularul se golește, apare confirmarea.
  const before = mock.received.length;
  await page.evaluate(`(() => {
    const form = document.querySelector("#mesaj-titlu").closest("section").querySelector("form");
    form.elements.email.value = "ion@firma.ro";
    form.elements.consimtamant.checked = true;
    form.querySelector("button[type=submit]").click();
  })()`);
  await sleep(1500);
  const success = await page.evaluate(`document.querySelector("#mesaj-titlu").closest("section").querySelector('[role="status"]').textContent`);
  if (mock.received.length !== before + 1 || !success.includes("Mulțumim")) fail(`Contact valid: e-mailuri=${mock.received.length - before}, mesaj „${success}”`);
  else notes.push(`Contact valid: e-mail trimis către ${mock.received.at(-1).body.to}, mesaj „${success}”`);
}

async function checkVideoAndVitals(page, base) {
  for (const [width, expected] of [[1440, "1280"], [375, "854"]]) {
    await page.viewport(width);
    await page.goto(`${base}/`);
    await sleep(1500);
    const video = await page.evaluate(`(() => { const v = document.querySelector(".hero video"); return { paused: v.paused, src: v.currentSrc }; })()`);
    if (video.paused || !video.src.includes(expected)) fail(`Video @ ${width}px: paused=${video.paused}, sursă=${video.src}`);
    else notes.push(`Video @ ${width}px: rulează, sursa ${video.src.split("/").pop()}`);
  }

  // Mobil, „4G lent” ca în Lighthouse: 150 ms latență, 1,6 Mbps, procesor de 4× mai lent.
  await page.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.__vitals = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__vitals.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value; }).observe({ type: "layout-shift", buffered: true });`,
  });
  await page.send("Network.setCacheDisabled", { cacheDisabled: true });
  await page.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await page.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.viewport(412, 823);

  for (const path of PAGES.slice(0, 4)) {
    await page.goto(base + path);
    await sleep(2500);
    const vitals = await page.evaluate(`(() => {
      const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
      return { fcp: Math.round(fcp), lcp: Math.round(window.__vitals.lcp), cls: Number(window.__vitals.cls.toFixed(3)) };
    })()`);
    const label = path === "/" ? "/acasa" : path;
    notes.push(`Performanță mobil ${label}: FCP ${vitals.fcp} ms, LCP ${vitals.lcp} ms, CLS ${vitals.cls}`);
    if (vitals.lcp > 2500) fail(`${label}: LCP ${vitals.lcp} ms (peste 2,5 s)`);
    if (vitals.cls >= 0.1) fail(`${label}: CLS ${vitals.cls} (peste 0,1)`);
  }

  await page.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await page.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
}

async function main() {
  const mock = await startMockResend();
  const server = await startNext({
    port: 3210,
    env: {
      RESEND_API_KEY: "cheie-de-test",
      RESEND_API_URL: mock.url,
      CONTACT_FROM_EMAIL: "Site <site@test.local>",
      CONTACT_TO_EMAIL: "client@test.local",
    },
  });
  const browser = await launchBrowser();

  try {
    const cdp = await Cdp.connect(browser.wsUrl);
    const page = await openPage(cdp);
    await checkLayouts(page, server.base);
    await checkKeyboard(page, server.base);
    await checkMapAndForms(page, server.base, mock);
    await checkVideoAndVitals(page, server.base);
    await page.close();
  } finally {
    browser.close();
    server.stop();
    await mock.close();
  }

  if (inlineLinks.size > 0) notes.push(`Linkuri din text sub 44px (exceptate de WCAG 2.5.8): ${[...inlineLinks].join("; ")}`);
  console.info("\nObservații:");
  for (const note of notes) console.info(`  • ${note}`);
  console.info(`\nCapturi de ecran: ${OUT_DIR}/`);
  if (problems.length > 0) {
    console.error(`\n${problems.length} probleme găsite:`);
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    process.exit(1);
  }
  console.info("\n✓ Toate verificările din browser au trecut.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
