import { Icon } from "../Icon";
import type { FormStatus } from "./useFormSubmit";

// Mesajul de stare al formularului, anunțat și de cititoarele de ecran (aria-live="polite").
// Elementul există mereu în pagină, ca anunțul să fie citit când apare textul.
export function FormStatusMessage({ status }: { status: FormStatus }) {
  const variant = status.type === "success" ? "success" : status.type === "error" ? "error" : "info";
  const text =
    status.type === "success" || status.type === "error"
      ? status.message
      : status.type === "sending"
        ? "Se trimite…"
        : "";

  return (
    <div role="status" aria-live="polite" className={`form-status form-status--${variant}`}>
      {text && (
        <>
          <Icon name={variant === "success" ? "check" : "alert"} size="sm" />
          <span>{text}</span>
        </>
      )}
    </div>
  );
}
