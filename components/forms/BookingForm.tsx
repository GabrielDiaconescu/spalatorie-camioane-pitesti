"use client";

import { useEffect, useState } from "react";
import { addDays, todayInBucharest } from "@/lib/dates";
import { LIMITS, TIME_SLOTS, VEHICLE_TYPES, validateBooking } from "@/lib/validation";
import { ConsentField, Field, HoneypotField } from "./Field";
import { FormStatusMessage } from "./FormStatusMessage";
import { useFormSubmit } from "./useFormSubmit";

// Cererea de programare: vizitatorul alege data și intervalul preferat, iar clientul sună pentru confirmare.
// Colectăm doar datele necesare confirmării (fără e-mail, fără adresă).
export function BookingForm() {
  const { errors, status, onSubmit } = useFormSubmit("/api/programare", (input) => validateBooking(input));
  const [dateRange, setDateRange] = useState<{ min: string; max: string }>();

  // Limitele calendarului se calculează în browser, ca să fie mereu „de azi încolo”.
  useEffect(() => {
    const today = todayInBucharest();
    setDateRange({ min: today, max: addDays(today, LIMITS.bookingDaysAhead) });
  }, []);

  const sending = status.type === "sending";

  return (
    <form className="form" noValidate onSubmit={onSubmit} aria-labelledby="programare-titlu">
      <p className="form__note">Toate câmpurile sunt obligatorii, cu excepția celor marcate „opțional”.</p>

      <div className="form__row">
        <Field
          id="programare-nume"
          name="nume"
          label="Nume sau firmă"
          autoComplete="organization"
          required
          maxLength={LIMITS.nameMax}
          error={errors.nume}
        />
        <Field
          id="programare-telefon"
          name="telefon"
          label="Telefon"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          hint="Te sunăm la acest număr pentru confirmare."
          error={errors.telefon}
        />
      </div>

      <div className="form__row">
        <Field as="select" id="programare-vehicul" name="vehicul" label="Tip vehicul" required defaultValue="" error={errors.vehicul}>
          <option value="" disabled>
            Alege tipul de vehicul
          </option>
          {Object.entries(VEHICLE_TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Field>
        <Field
          id="programare-numarVehicule"
          name="numarVehicule"
          label="Număr de vehicule"
          type="number"
          inputMode="numeric"
          min={1}
          max={LIMITS.vehiclesMax}
          step={1}
          defaultValue={1}
          required
          error={errors.numarVehicule}
        />
      </div>

      <div className="form__row">
        <Field
          id="programare-data"
          name="data"
          label="Data preferată"
          type="date"
          required
          min={dateRange?.min}
          max={dateRange?.max}
          hint="De luni până sâmbătă. Duminica suntem închiși."
          error={errors.data}
        />
        <Field as="select" id="programare-interval" name="interval" label="Interval orar preferat" required defaultValue="" error={errors.interval}>
          <option value="" disabled>
            Alege intervalul
          </option>
          {Object.entries(TIME_SLOTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Field>
      </div>

      <Field
        as="textarea"
        id="programare-observatii"
        name="observatii"
        label="Observații"
        optional
        maxLength={LIMITS.notesMax}
        rows={4}
        hint="De exemplu: serviciul dorit sau detalii despre flotă."
        error={errors.observatii}
      />

      <ConsentField id="consimtamant-programare" error={errors.consimtamant} />
      <HoneypotField id="website-programare" />

      <FormStatusMessage status={status} />

      <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
        {sending ? "Se trimite…" : "Trimite cererea de programare"}
      </button>
    </form>
  );
}
