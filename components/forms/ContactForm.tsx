"use client";

import { LIMITS, validateContact } from "@/lib/validation";
import { ConsentField, Field, HoneypotField } from "./Field";
import { FormStatusMessage } from "./FormStatusMessage";
import { useFormSubmit } from "./useFormSubmit";

// Formularul de contact: doar câmpurile strict necesare (nume, telefon și/sau e-mail, mesaj).
export function ContactForm() {
  const { errors, status, onSubmit } = useFormSubmit("/api/contact", validateContact);
  const sending = status.type === "sending";

  return (
    <form className="form" noValidate onSubmit={onSubmit} aria-labelledby="mesaj-titlu">
      <p className="form__note">Completează cel puțin telefonul sau e-mailul, ca să te putem contacta.</p>

      <Field
        id="contact-nume"
        name="nume"
        label="Nume"
        autoComplete="name"
        required
        maxLength={LIMITS.nameMax}
        error={errors.nume}
      />

      <div className="form__row">
        <Field
          id="contact-telefon"
          name="telefon"
          label="Telefon"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          optional
          error={errors.telefon}
        />
        <Field
          id="contact-email"
          name="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          optional
          maxLength={LIMITS.emailMax}
          error={errors.email}
        />
      </div>

      <Field
        as="textarea"
        id="contact-mesaj"
        name="mesaj"
        label="Mesaj"
        required
        rows={5}
        maxLength={LIMITS.messageMax}
        error={errors.mesaj}
      />

      <ConsentField id="consimtamant-contact" error={errors.consimtamant} />
      <HoneypotField id="website-contact" />

      <FormStatusMessage status={status} />

      <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
        {sending ? "Se trimite…" : "Trimite mesajul"}
      </button>
    </form>
  );
}
