import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Icon } from "../Icon";

// Un câmp de formular: etichetă vizibilă deasupra, indiciu opțional și mesaj de eroare sub câmp.
// Eroarea este text (nu doar culoare) și este legată de câmp prin aria-describedby.

type Common = {
  id: string;
  name: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
};

type InputProps = Common & { as?: "input" } & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = Common & { as: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement>;
type SelectProps = Common & { as: "select"; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>;

export function Field(props: InputProps | TextareaProps | SelectProps) {
  const { id, name, label, error, hint, optional } = props;
  const hintId = hint ? `${id}-indiciu` : undefined;
  const errorId = error ? `${id}-eroare` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const shared = {
    id,
    name,
    className: "field__input",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  let control: ReactNode;
  if (props.as === "textarea") {
    const { as: _as, name: _n, label: _l, error: _e, hint: _h, optional: _o, ...rest } = props;
    control = <textarea {...rest} {...shared} />;
  } else if (props.as === "select") {
    const { as: _as, name: _n, label: _l, error: _e, hint: _h, optional: _o, children, ...rest } = props;
    control = (
      <select {...rest} {...shared}>
        {children}
      </select>
    );
  } else {
    const { as: _as, name: _n, label: _l, error: _e, hint: _h, optional: _o, ...rest } = props;
    control = <input {...rest} {...shared} />;
  }

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label} {optional && <span className="field__optional">(opțional)</span>}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          <Icon name="alert" size="sm" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function ConsentField({ id, error }: { id: string; error?: string }) {
  const errorId = error ? `${id}-eroare` : undefined;
  return (
    <div className="field">
      <label className="checkbox" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          name="consimtamant"
          value="da"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
        />
        <span>
          Sunt de acord cu prelucrarea datelor mele pentru a primi un răspuns, conform{" "}
          <a href="/politica-de-confidentialitate" target="_blank" rel="noopener noreferrer">
            Politicii de confidențialitate
          </a>{" "}
          (se deschide într-un tab nou).
        </span>
      </label>
      {error && (
        <p id={errorId} className="field__error">
          <Icon name="alert" size="sm" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

// Câmp-capcană pentru roboți. Oamenii nu îl văd și nu ajung la el cu Tab.
export function HoneypotField({ id }: { id: string }) {
  return (
    <div className="hp" aria-hidden="true">
      <label htmlFor={id}>Nu completa acest câmp</label>
      <input type="text" id={id} name="website" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
