import "server-only";
import { STORE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

type Mail = { to: string; name?: string; subject: string; html: string };

/** Sends email via Gmail SMTP if configured, otherwise Brevo's API; logs in development when neither is set. */
export async function sendEmail({ to, name, subject, html }: Mail) {
  const gUser = process.env.GMAIL_USER, gPass = process.env.GMAIL_APP_PASSWORD;
  if (gUser && gPass) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user: gUser, pass: gPass.replace(/\s/g, "") } });
    try {
      await transport.sendMail({ from: `"${STORE.name}" <${gUser}>`, to: name ? `"${name}" <${to}>` : to, subject, html });
    } catch (e) {
      console.error("[email] Gmail error", e);
    }
    return;
  }
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn(`[email] BREVO_API_KEY/EMAIL_FROM not set — email to ${to} not sent. Subject: ${subject}`);
    console.warn(html.match(/href="([^"]+)"/)?.[1] ?? "");
    return;
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: from, name: STORE.name },
      to: [{ email: to, name: name ?? to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) console.error("[email] Brevo error", res.status, await res.text());
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#111">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
    <tr><td style="background:#2563eb;padding:20px 28px;color:#fff;font-size:22px;font-weight:bold">som<span style="color:#c7d2fe">Store</span></td></tr>
    <tr><td style="padding:28px">
      <h1 style="margin:0 0 16px;font-size:20px">${title}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:12px">${STORE.name} · ${STORE.address} · ${STORE.phone}</td></tr>
  </table></td></tr></table></body></html>`;
}

const button = (url: string, label: string) =>
  `<p style="margin:24px 0"><a href="${url}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;display:inline-block">${label}</a></p>`;

export const emails = {
  verify: (name: string, url: string) =>
    layout("Verify your email", `<p>Hi ${name},</p><p>Welcome to ${STORE.name}! Please confirm your email address to activate your account.</p>${button(url, "Verify email")}<p style="color:#6b7280;font-size:13px">If you did not create an account, you can ignore this email.</p>`),
  reset: (name: string, url: string) =>
    layout("Reset your password", `<p>Hi ${name},</p><p>We received a request to reset your password. The link expires in 1 hour.</p>${button(url, "Reset password")}<p style="color:#6b7280;font-size:13px">If you did not request this, you can ignore this email.</p>`),
  order: (o: {
    name: string; orderNumber: string; url: string; paymentLabel: string; paid: boolean;
    items: { name: string; quantity: number; unitPrice: number }[]; subtotal: number; deliveryFee: number; total: number; address: string;
  }) =>
    layout(`Order ${o.orderNumber} confirmed`, `<p>Hi ${o.name},</p><p>Thank you for shopping with ${STORE.name}! ${o.paid ? "Your payment was received" : "Please have the cash ready on delivery"}.</p>
      <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin:16px 0">
      ${o.items.map((i) => `<tr style="border-bottom:1px solid #eee"><td>${i.name} × ${i.quantity}</td><td align="right">${formatPrice(i.unitPrice * i.quantity)}</td></tr>`).join("")}
      <tr><td style="color:#6b7280">Subtotal</td><td align="right">${formatPrice(o.subtotal)}</td></tr>
      <tr><td style="color:#6b7280">Delivery</td><td align="right">${o.deliveryFee ? formatPrice(o.deliveryFee) : "Free"}</td></tr>
      <tr><td><b>Total</b></td><td align="right"><b>${formatPrice(o.total)}</b></td></tr></table>
      <p style="font-size:14px"><b>Payment:</b> ${o.paymentLabel}<br/><b>Deliver to:</b> ${o.address}</p>${button(o.url, "View your order")}`),
  status: (name: string, orderNumber: string, status: string, url: string) =>
    layout(`Order ${orderNumber}: ${status}`, `<p>Hi ${name},</p><p>Your order <b>${orderNumber}</b> is now <b>${status}</b>.</p>${button(url, "Track your order")}`),
};
