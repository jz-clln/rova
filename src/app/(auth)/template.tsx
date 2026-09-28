// src/app/(auth)/template.tsx
// A template remounts on every navigation, so the heading and form play a
// short entrance each time while the shell around them stays put. While the
// next page is still on its way, the current one eases out (data-leaving) so
// the switch never looks frozen.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import styles from "@/components/auth/auth-shell.module.css";
import { getAuthMode } from "@/components/auth/auth-shell";
import { useAuthStage } from "@/components/auth/auth-stage";

const COPY = {
  "sign-in": {
    title: "Welcome back",
    text: "Sign in to manage your harvests, orders, and deliveries.",
    altText: "New to Rova?",
    altLabel: "Create an account",
    altHref: "/sign-up",
    altMode: "sign-up",
  },
  "sign-up": {
    title: "Create your account",
    text: "",
    altText: "Already have an account?",
    altLabel: "Sign in",
    altHref: "/sign-in",
    altMode: "sign-in",
  },
} as const;

export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  const mode = getAuthMode(usePathname());
  const { pendingMode, beginSwitch } = useAuthStage();
  const copy = COPY[mode];
  const leaving = pendingMode !== null && pendingMode !== mode;

  return (
    <div className={styles.page} data-mode={mode} data-leaving={leaving} inert={leaving}>
      <div className={styles.intro}>
        <h1 id="auth-title">{copy.title}</h1>
        {copy.text ? <p>{copy.text}</p> : null}
      </div>
      <div className={styles.body}>{children}</div>
      <p className={styles.alternate}>
        {copy.altText}{" "}
        <Link href={copy.altHref} scroll={false} prefetch onClick={(event) => beginSwitch(event, copy.altMode)}>
          {copy.altLabel} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}