// src/components/auth/auth-shell.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Leaf, Route, ShoppingBasket, Sprout, Truck, type LucideIcon } from "lucide-react";
import styles from "./auth-shell.module.css";
import { AuthStageProvider, useAuthStage, type AuthMode } from "./auth-stage";

export type { AuthMode } from "./auth-stage";

export function getAuthMode(pathname: string | null): AuthMode {
  return pathname?.startsWith("/sign-up") ? "sign-up" : "sign-in";
}

/* ------------------------------------------------------------------ */
/* Photo panel content                                                */
/* ------------------------------------------------------------------ */

type SceneId = "default" | "farmer" | "buyer" | "truck_operator" | "driver";
type RoleId = Exclude<SceneId, "default">;

// Every photo stays mounted and cross-fades, so nothing reloads when the
// person switches tabs or picks a role. `position` keeps each subject in
// frame when the tall panel crops a wide photo.
const SCENES: ReadonlyArray<{ id: SceneId; src: string; alt: string; position: string }> = [
  { id: "default", src: "/images/auth/default.png", alt: "A farmer and a Rova team member inspecting fresh greens at sunrise, with a delivery truck loading crates behind them", position: "50% 55%" },
  { id: "farmer", src: "/images/auth/farmer.png", alt: "A Rova farmer holding ripe rice stalks and looking over green paddies", position: "78% 50%" },
  { id: "buyer", src: "/images/auth/buyer.png", alt: "A farmer pointing across a field to three smiling Rova team members", position: "58% 50%" },
  { id: "truck_operator", src: "/images/auth/truck-operator.png", alt: "A Rova truck operator standing with arms crossed in front of a branded truck", position: "64% 50%" },
  { id: "driver", src: "/images/auth/truck-driver.png", alt: "A Rova driver holding up a phone from the cab of a delivery truck", position: "40% 50%" },
];

type CopyKey = AuthMode | RoleId;

const COPY: Record<CopyKey, { icon: LucideIcon; chip: string; lead: string; accent: string; text: string; credit?: string }> = {
  "sign-in": {
    icon: Leaf,
    chip: "Shared agricultural freight",
    lead: "Every harvest.",
    accent: "A way forward.",
    text: "From the first pickup to the final delivery, a better journey starts with connection.",
  },
  "sign-up": {
    icon: Leaf,
    chip: "Shared agricultural freight",
    lead: "Good things",
    accent: "grow together.",
    text: "For the hands that grow our food, and everyone who helps it reach the table.",
  },
  farmer: {
    icon: Sprout,
    chip: "For farmers",
    lead: "Your harvest,",
    accent: "matched to buyers.",
    text: "List what you have grown and Rova lines up buyers and a shared ride to market.",
  },
  buyer: {
    icon: ShoppingBasket,
    chip: "For buyers",
    lead: "Fresh supply,",
    accent: "delivered together.",
    text: "Post what you need and receive consolidated deliveries from farms near your route.",
  },
  truck_operator: {
    icon: Truck,
    chip: "For truck operators",
    lead: "Every trip",
    accent: "runs fuller.",
    text: "Manage your trucks and drivers, and accept route jobs built around shared loads.",
  },
  driver: {
    icon: Route,
    chip: "For drivers",
    lead: "Your route,",
    accent: "clear from the start.",
    text: "See every pickup and drop-off on your assigned route and run it with confidence.",
  },
};

const COPY_KEYS = Object.keys(COPY) as CopyKey[];

function isRoleId(value: string): value is RoleId {
  return value === "farmer" || value === "buyer" || value === "truck_operator" || value === "driver";
}

/* ------------------------------------------------------------------ */
/* Shell                                                              */
/* ------------------------------------------------------------------ */

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthStageProvider>
      <AuthFrame>{children}</AuthFrame>
    </AuthStageProvider>
  );
}

function AuthFrame({ children }: { children: React.ReactNode }) {
  const routeMode = getAuthMode(usePathname());
  const { role, pendingMode, setPendingMode, beginSwitch } = useAuthStage();

  // The clicked tab wins immediately; the route catches up a moment later.
  const mode: AuthMode = pendingMode ?? routeMode;
  const switching = pendingMode !== null && pendingMode !== routeMode;

  // A role only matters on sign-up. Sign-in always shows the default photo.
  const activeRole = mode === "sign-up" && isRoleId(role) ? role : null;
  const sceneId: SceneId = activeRole ?? "default";
  const copyKey: CopyKey = activeRole ?? mode;

  // The route arrived, so the optimistic state is no longer needed.
  useEffect(() => {
    setPendingMode(null);
  }, [routeMode, setPendingMode]);

  // Safety net: never leave the UI stuck if a navigation is cancelled.
  useEffect(() => {
    if (!pendingMode) return;
    const timer = window.setTimeout(() => setPendingMode(null), 4000);
    return () => window.clearTimeout(timer);
  }, [pendingMode, setPendingMode]);

  // The card grows and shrinks to fit its content instead of jumping.
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    const element = innerRef.current;
    if (!element) return;
    const measure = () => setHeight(element.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.root} data-mode={mode}>
      <a href="#auth-form" className={styles.skip}>Skip to form</a>

      <aside className={styles.story} aria-label="The Rova journey">
        {SCENES.map((scene) => (
          <figure key={scene.id} className={styles.scene} data-active={scene.id === sceneId} aria-hidden={scene.id !== sceneId}>
            <Image
              src={scene.src}
              alt={scene.alt}
              fill
              sizes="(max-width: 1023px) 0px, 52vw"
              quality={80}
              style={{ objectPosition: scene.position }}
              {...(scene.id === "default" ? { priority: true } : { loading: "eager" as const, fetchPriority: "low" as const })}
            />
          </figure>
        ))}
        <div className={styles.shade} aria-hidden="true" />

        <div className={styles.storyInner}>
          <div className={styles.chipStack}>
            {COPY_KEYS.map((key) => {
              const Icon = COPY[key].icon;
              return (
                <span key={key} className={styles.chip} data-active={key === copyKey} aria-hidden={key !== copyKey}>
                  <Icon size={15} aria-hidden="true" /> {COPY[key].chip}
                </span>
              );
            })}
          </div>

          <div className={styles.copyStack}>
            {COPY_KEYS.map((key) => (
              <div key={key} className={styles.copy} data-active={key === copyKey} aria-hidden={key !== copyKey}>
                <h2>{COPY[key].lead}<br /><em>{COPY[key].accent}</em></h2>
                <p>{COPY[key].text}</p>
                {COPY[key].credit ? <small>{COPY[key].credit}</small> : null}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.header}>
          <Link href="/" aria-label="Rova home" className={styles.logo}>
            <Image src="/brand/rova-icon.png" alt="" width={38} height={38} priority />
            <Image src="/brand/rova-wordmark.png" alt="Rova" width={96} height={32} priority />
          </Link>
          <Link href="/" className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> Home</Link>
        </header>

        <div className={styles.stage}>
          <section id="auth-form" className={styles.card} aria-labelledby="auth-title" tabIndex={-1}>
            <nav className={styles.switcher} data-mode={mode} aria-label="Account access" aria-busy={switching}>
              <span className={styles.indicator} aria-hidden="true" />
              <Link href="/sign-in" scroll={false} prefetch onClick={(event) => beginSwitch(event, "sign-in")} aria-current={mode === "sign-in" ? "page" : undefined}>
                {switching && pendingMode === "sign-in" ? <span className={styles.tabLoader} aria-hidden="true" /> : null}
                Sign in
              </Link>
              <Link href="/sign-up" scroll={false} prefetch onClick={(event) => beginSwitch(event, "sign-up")} aria-current={mode === "sign-up" ? "page" : undefined}>
                {switching && pendingMode === "sign-up" ? <span className={styles.tabLoader} aria-hidden="true" /> : null}
                Create account
              </Link>
            </nav>
            <div className={styles.morph} style={height ? { height } : undefined}>
              <div ref={innerRef}>{children}</div>
            </div>
          </section>
        </div>

        <footer className={styles.footer}>Progress, together.</footer>
      </div>
    </main>
  );
}