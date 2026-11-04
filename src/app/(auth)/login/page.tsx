import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to check out and track your orders.</p>
      </div>
      <Suspense><LoginForm /></Suspense>
      <p className="text-center text-sm text-muted-foreground">
        New to somStore? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
