// Utilitare pentru testele end-to-end și verificarea în browser:
// pornesc serverul Next.js (din build-ul existent) și un server Resend fals, local.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:http";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Înlocuiește API-ul Resend în teste: reține e-mailurile primite, nu trimite nimic în realitate.
export async function startMockResend() {
  const received = [];
  const server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      received.push({ headers: request.headers, body: JSON.parse(body || "{}") });
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ id: `test-${received.length}` }));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}/emails`,
    received,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

export async function startNext({ port, env = {} }) {
  if (!existsSync(".next/BUILD_ID")) {
    throw new Error("Lipsește build-ul de producție. Rulează întâi: npm run build");
  }

  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (data) => (log += data));
  child.stderr.on("data", (data) => (log += data));

  const base = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 150; attempt++) {
    try {
      const response = await fetch(`${base}/`);
      if (response.ok) return { base, log: () => log, stop: () => child.kill() };
    } catch {
      // Serverul încă pornește.
    }
    await sleep(200);
  }
  child.kill();
  throw new Error(`Serverul Next.js nu a pornit:\n${log}`);
}
