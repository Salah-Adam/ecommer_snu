import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { emails, sendEmail } from "@/lib/email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.URL || "http://localhost:3000",
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: user.email, name: user.name, subject: "Reset your somStore password", html: emails.reset(user.name, url) });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({ to: user.email, name: user.name, subject: "Verify your somStore account", html: emails.verify(user.name, url) });
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, defaultValue: "CUSTOMER", required: false },
      phone: { type: "string", required: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30, cookieCache: { enabled: true, maxAge: 300 } },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser(callbackPath = "/account") {
  const session = await getSession();
  if (!session) redirect(`/login?callbackURL=${encodeURIComponent(callbackPath)}`);
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login?callbackURL=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}
