import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { validateBooking, validateContact } from "../lib/validation.ts";

// 12 octombrie 2026 este o zi de luni.
const TODAY = "2026-10-12";

const booking = {
  nume: "Transport Internațional SRL",
  telefon: "0745 123 456",
  vehicul: "cap-tractor",
  numarVehicule: "3",
  data: "2026-10-14",
  interval: "09-12",
  observatii: "",
  consimtamant: true,
};

const contact = {
  nume: "Ion Popescu",
  telefon: "",
  email: "ion@firma.ro",
  mesaj: "Aș dori o ofertă pentru 10 camioane.",
  consimtamant: true,
};

function bookingErrors(changes: Record<string, unknown>) {
  const result = validateBooking({ ...booking, ...changes }, TODAY);
  return result.ok ? {} : result.errors;
}

function contactErrors(changes: Record<string, unknown>) {
  const result = validateContact({ ...contact, ...changes });
  return result.ok ? {} : result.errors;
}

describe("cererea de programare", () => {
  test("acceptă date valide și transformă numărul de vehicule în număr", () => {
    const result = validateBooking(booking, TODAY);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.data.numarVehicule, 3);
  });

  test("acceptă programarea pentru ziua curentă și „+40”", () => {
    assert.deepEqual(bookingErrors({ data: TODAY, telefon: "+40 745 123 456" }), {});
  });

  test("respinge trimiterea fără acord GDPR (inclusiv valori care nu sunt boolean)", () => {
    assert.ok(bookingErrors({ consimtamant: false }).consimtamant);
    assert.ok(bookingErrors({ consimtamant: "da" }).consimtamant);
  });

  test("respinge duminica, datele din trecut, inexistente sau prea îndepărtate", () => {
    assert.match(bookingErrors({ data: "2026-10-18" }).data, /Duminica/);
    assert.match(bookingErrors({ data: "2026-10-11" }).data, /astăzi încolo/);
    assert.match(bookingErrors({ data: "2026-02-30" }).data, /dată validă/);
    assert.match(bookingErrors({ data: "14.10.2026" }).data, /dată validă/);
    assert.match(bookingErrors({ data: "2027-01-11" }).data, /90 de zile/);
    assert.deepEqual(bookingErrors({ data: "2027-01-09" }), {});
  });

  test("respinge tipuri de vehicul și intervale necunoscute", () => {
    assert.ok(bookingErrors({ vehicul: "avion" }).vehicul);
    assert.ok(bookingErrors({ vehicul: "toString" }).vehicul);
    assert.ok(bookingErrors({ interval: "18-21" }).interval);
  });

  test("respinge un număr de vehicule în afara intervalului 1–100", () => {
    for (const value of ["0", "101", "2.5", "abc", "", -1]) {
      assert.ok(bookingErrors({ numarVehicule: value }).numarVehicule, `valoarea ${value}`);
    }
    assert.deepEqual(bookingErrors({ numarVehicule: 100 }), {});
  });

  test("cere telefon valid (confirmarea se face telefonic)", () => {
    for (const value of ["", "123", "telefon", "0745 123 456 789 0123"]) {
      assert.ok(bookingErrors({ telefon: value }).telefon, `valoarea „${value}”`);
    }
  });

  test("respinge nume prea scurte, prea lungi sau cu caractere de control", () => {
    assert.ok(bookingErrors({ nume: "I" }).nume);
    assert.ok(bookingErrors({ nume: "a".repeat(101) }).nume);
    assert.ok(bookingErrors({ nume: "Ion\nPopescu" }).nume);
  });

  test("limitează observațiile la 1.000 de caractere", () => {
    assert.ok(bookingErrors({ observatii: "a".repeat(1001) }).observatii);
    assert.deepEqual(bookingErrors({ observatii: "Rând unu\nRând doi" }), {});
  });

  test("tratează datele lipsă sau de alt tip fără să se blocheze", () => {
    for (const input of [null, undefined, "text", 42, []]) {
      const result = validateBooking(input, TODAY);
      assert.equal(result.ok, false);
      if (!result.ok) assert.ok(result.errors.nume && result.errors.telefon && result.errors.consimtamant);
    }
  });
});

describe("formularul de contact", () => {
  test("acceptă doar e-mail sau doar telefon", () => {
    assert.deepEqual(contactErrors({}), {});
    assert.deepEqual(contactErrors({ email: "", telefon: "0745123456" }), {});
  });

  test("cere cel puțin telefonul sau e-mailul", () => {
    assert.match(contactErrors({ email: "", telefon: "" }).telefon, /telefon sau o adresă de e-mail/);
  });

  test("respinge e-mailuri invalide", () => {
    for (const value of ["adresa-gresita", "ion@", "ion@firma", "ion @firma.ro", `${"a".repeat(250)}@firma.ro`]) {
      assert.ok(contactErrors({ email: value }).email, `valoarea „${value}”`);
    }
  });

  test("verifică lungimea mesajului", () => {
    assert.ok(contactErrors({ mesaj: "Salut" }).mesaj);
    assert.ok(contactErrors({ mesaj: "a".repeat(2001) }).mesaj);
  });

  test("respinge trimiterea fără acord GDPR", () => {
    assert.ok(contactErrors({ consimtamant: undefined }).consimtamant);
  });

  test("elimină spațiile de la început și sfârșit", () => {
    const result = validateContact({ ...contact, nume: "  Ion Popescu  " });
    assert.ok(result.ok && result.data.nume === "Ion Popescu");
  });
});
