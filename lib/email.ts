// Trimiterea e-mailurilor prin Resend (https://resend.com), cu un simplu apel HTTPS.
// Nu folosim pachetul npm Resend: un singur apel fetch este suficient și nu adaugă dependențe.
// Cheile stau doar în variabile de mediu (.env.local sau panoul găzduirii), niciodată în cod.

export type EmailMessage = { subject: string; text: string; replyTo?: string };
export type SendResult = "sent" | "not-configured" | "failed";

type Env = Record<string, string | undefined>;

const DEFAULT_API_URL = "https://api.resend.com/emails";

export async function sendEmail(message: EmailMessage, env: Env = process.env): Promise<SendResult> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.CONTACT_FROM_EMAIL;
  const to = env.CONTACT_TO_EMAIL;
  if (!apiKey || !from || !to) return "not-configured";

  try {
    const response = await fetch(env.RESEND_API_URL || DEFAULT_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      // Nu scriem în jurnal datele vizitatorului, doar codul de răspuns.
      console.error(`Resend a refuzat trimiterea (status ${response.status}).`);
      return "failed";
    }
    return "sent";
  } catch {
    console.error("Trimiterea prin Resend a eșuat (rețea indisponibilă sau timp depășit).");
    return "failed";
  }
}
