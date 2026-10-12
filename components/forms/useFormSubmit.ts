"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import type { FieldErrors, ValidationResult } from "@/lib/validation";

export type FormStatus =
  | { type: "idle" }
  | { type: "sending" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

function focusFirstError(form: HTMLFormElement, errors: FieldErrors) {
  const first = Object.keys(errors)[0];
  if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
}

// Trimiterea unui formular: validare în browser, apoi POST către ruta API.
// Datele nu se salvează nicăieri în browser (fără localStorage) și nu se afișează în consolă.
export function useFormSubmit(endpoint: string, validate: (input: unknown) => ValidationResult<unknown>) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, unknown> = Object.fromEntries(formData);
    payload.consimtamant = formData.get("consimtamant") === "da";

    const result = validate(payload);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus({ type: "error", message: "Formularul nu a fost trimis. Verifică câmpurile marcate mai jos." });
      focusFirstError(form, result.errors);
      return;
    }

    setErrors({});
    setStatus({ type: "sending" });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: FieldErrors;
      };

      if (response.ok && body.ok) {
        form.reset();
        setStatus({ type: "success", message: body.message ?? "Mulțumim! Mesajul a fost trimis." });
        return;
      }

      if (body.errors) {
        setErrors(body.errors);
        focusFirstError(form, body.errors);
      }
      setStatus({
        type: "error",
        message: body.message ?? `Mesajul nu a putut fi trimis. Te rugăm să ne suni la ${site.phone.display}.`,
      });
    } catch {
      setStatus({
        type: "error",
        message: `Nu am putut trimite mesajul. Verifică conexiunea la internet sau sună-ne la ${site.phone.display}.`,
      });
    }
  }

  return { errors, status, onSubmit };
}
