export async function sendEmailViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "EcoColones <no-reply@eco-colones.local>";
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY no configurada" } as const;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return { ok: false, error: txt || `HTTP ${res.status}` } as const;
  }
  const data = await res.json().catch(() => ({}));
  return { ok: true, data } as const;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string; }) {
  // Por ahora solo Resend; se puede extender a SMTP/nodemailer.
  return sendEmailViaResend(to, subject, html);
}
