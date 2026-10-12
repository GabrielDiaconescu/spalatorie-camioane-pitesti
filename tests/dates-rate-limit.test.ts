import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { addDays, formatDateRo, isSunday, isValidIsoDate, todayInBucharest } from "../lib/dates.ts";
import { createRateLimiter } from "../lib/rate-limit.ts";

describe("datele calendaristice", () => {
  test("ziua curentă se calculează pe ora României, nu pe ora serverului", () => {
    // 21:30 UTC pe 12 octombrie = 00:30 pe 13 octombrie la București (UTC+3 vara).
    assert.equal(todayInBucharest(new Date("2026-10-12T21:30:00Z")), "2026-10-13");
    // Iarna, București este UTC+2.
    assert.equal(todayInBucharest(new Date("2026-12-31T21:59:00Z")), "2026-12-31");
    assert.equal(todayInBucharest(new Date("2026-12-31T22:00:00Z")), "2027-01-01");
  });

  test("recunoaște datele valide și inexistente", () => {
    assert.equal(isValidIsoDate("2028-02-29"), true);
    assert.equal(isValidIsoDate("2026-02-29"), false);
    assert.equal(isValidIsoDate("2026-13-01"), false);
    assert.equal(isValidIsoDate("2026-1-5"), false);
  });

  test("adună zile peste lună și an", () => {
    assert.equal(addDays("2026-10-12", 90), "2027-01-10");
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  });

  test("identifică duminica și formatează data în română", () => {
    assert.equal(isSunday("2026-10-18"), true);
    assert.equal(isSunday("2026-10-17"), false);
    assert.equal(formatDateRo("2026-10-12"), "luni, 12 octombrie 2026");
  });
});

describe("limitarea numărului de cereri", () => {
  test("permite primele cereri și le blochează pe cele în plus", () => {
    const check = createRateLimiter({ limit: 3, windowMs: 60_000 });
    const now = 1_000_000;
    assert.equal(check("1.2.3.4", now).allowed, true);
    assert.equal(check("1.2.3.4", now).allowed, true);
    assert.equal(check("1.2.3.4", now).allowed, true);
    const blocked = check("1.2.3.4", now + 10_000);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.retryAfterSeconds, 50);
  });

  test("fiecare adresă IP are propria limită, iar limita se resetează", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    assert.equal(check("a", 0).allowed, true);
    assert.equal(check("a", 1).allowed, false);
    assert.equal(check("b", 1).allowed, true);
    assert.equal(check("a", 60_001).allowed, true);
  });
});
