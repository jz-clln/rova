// src/app/(auth)/sign-up/sign-up-form.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, LoaderCircle, ArrowRight, ArrowLeft, Sprout, ShoppingBasket, Truck, Route, Check, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStage } from "@/components/auth/auth-stage";
import { signUp, type SignUpState } from "./actions";
import styles from "./sign-up-form.module.css";

const ROLE_OPTIONS = [
  { value: "farmer", icon: Sprout, title: "Farmer", description: "List your harvest and get matched to buyers." },
  { value: "buyer", icon: ShoppingBasket, title: "Buyer", description: "Post produce requirements and receive shared deliveries." },
  { value: "truck_operator", icon: Truck, title: "Truck operator", description: "Manage trucks and drivers, and accept route jobs." },
  { value: "driver", icon: Route, title: "Driver", description: "Run assigned pickup and delivery routes." },
] as const;

const BUSINESS_LABEL: Record<string, string> = {
  farmer: "Farm name",
  buyer: "Business name",
  truck_operator: "Company name",
};

const STEPS = [
  { label: "Your role", title: "How will you use Rova?" },
  { label: "About you", title: "A little about you" },
  { label: "Your account", title: "Secure your account" },
] as const;
const LAST = STEPS.length - 1;

export function SignUpForm() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUp, { error: "" });
  const [role, setRole] = useState(state.values?.role ?? "");
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const firstRender = useRef(true);
  const { setRole: setStageRole } = useAuthStage();

  // Tell the photo panel which role is picked so it can swap the picture.
  // UI only: the form still submits its own "role" radio exactly as before.
  useEffect(() => {
    setStageRole(role);
  }, [role, setStageRole]);

  // Leaving this form (for example, switching to Sign in) resets the panel to the default photo.
  useEffect(() => () => setStageRole(""), [setStageRole]);

  // On desktop, move the cursor into the new step. Phones skip this so the
  // keyboard does not pop up on its own.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const target = panelRefs.current[step]?.querySelector<HTMLElement>(
      "input:not([type=radio]):not([type=checkbox]), input[type=radio]:checked",
    );
    const timer = window.setTimeout(() => target?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(timer);
  }, [step]);

  if (state.notice) {
    return (
      <div role="status" className="auth-notice">
        <MailCheck size={30} strokeWidth={1.5} aria-hidden="true" />
        <h2>You&apos;re almost there.</h2>
        <p>{state.notice}</p>
      </div>
    );
  }

  const businessLabel = BUSINESS_LABEL[role];
  const selectedRole = ROLE_OPTIONS.find((option) => option.value === role);
  const panelState = (index: number) => (index === step ? "current" : index < step ? "before" : "after");

  function next() {
    if (pending) return;
    if (step === 0 && !role) return;
    const fields = panelRefs.current[step]?.querySelectorAll<HTMLInputElement>("input") ?? [];
    for (const field of Array.from(fields)) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return;
      }
    }
    setStep((current) => Math.min(current + 1, LAST));
  }

  // Enter moves to the next step. Only the last step submits.
  function onKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || step === LAST) return;
    if ((event.target as HTMLElement).tagName !== "INPUT") return;
    event.preventDefault();
    next();
  }

  return (
    <form action={action} className="auth-form" aria-busy={pending} onKeyDown={onKeyDown}>
      <div className={styles.progress}>
        <ol className={styles.segments} aria-label="Sign-up progress">
          {STEPS.map((item, index) => (
            <li key={item.label}>
              <button
                type="button"
                className={styles.segment}
                data-state={index < step ? "done" : index === step ? "current" : "todo"}
                disabled={index >= step || pending}
                onClick={() => setStep(index)}
                aria-current={index === step ? "step" : undefined}
                aria-label={`Step ${index + 1}: ${item.label}`}
              >
                <span className={styles.track}><span className={styles.fill} /></span>
              </button>
            </li>
          ))}
        </ol>
        <p className={styles.stepLabel}>Step {step + 1} of {STEPS.length} <span>· {STEPS[step].label}</span></p>
      </div>

      <div className={styles.steps}>
        {/* Step 1: role */}
        <div ref={(el) => { panelRefs.current[0] = el; }} className={styles.panel} data-state={panelState(0)} inert={step !== 0} aria-hidden={step !== 0}>
          <h2 className={styles.title}>{STEPS[0].title}</h2>
          <fieldset className={styles.roles} disabled={pending}>
            <legend className="sr-only">Choose your role</legend>
            {ROLE_OPTIONS.map((option) => (
              <label key={option.value} className={styles.role} data-checked={role === option.value}>
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value)}
                  required
                  className="sr-only"
                />
                <span className={styles.roleIcon}><option.icon size={24} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className={styles.roleTitle}>{option.title}</span>
                <span className={styles.roleCheck}><Check size={13} strokeWidth={3} aria-hidden="true" /></span>
              </label>
            ))}
          </fieldset>
          <p key={role || "none"} className={styles.roleHint} data-empty={!selectedRole} aria-live="polite">
            {selectedRole ? <selectedRole.icon size={18} strokeWidth={1.8} aria-hidden="true" /> : null}
            <span>{selectedRole ? selectedRole.description : "Choose the role that fits you best."}</span>
          </p>
        </div>

        {/* Step 2: about you */}
        <div ref={(el) => { panelRefs.current[1] = el; }} className={styles.panel} data-state={panelState(1)} inert={step !== 1} aria-hidden={step !== 1}>
          <h2 className={styles.title}>{STEPS[1].title}</h2>
          <div className={styles.fields}>
            <div className={styles.field}>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" autoComplete="name" required maxLength={200} defaultValue={state.values?.full_name} readOnly={pending} />
            </div>
            <div className={styles.split} data-single={businessLabel ? "false" : "true"}>
              {businessLabel ? (
                <div className={styles.field}>
                  <Label htmlFor="business_name">{businessLabel} <span className={styles.optional}>(optional)</span></Label>
                  <Input id="business_name" name="business_name" autoComplete="organization" maxLength={200} defaultValue={state.values?.business_name} readOnly={pending} />
                </div>
              ) : null}
              <div className={styles.field}>
                <Label htmlFor="phone">Phone number <span className={styles.optional}>(optional)</span></Label>
                <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder="09XX XXX XXXX" defaultValue={state.values?.phone} readOnly={pending} />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: account */}
        <div ref={(el) => { panelRefs.current[2] = el; }} className={styles.panel} data-state={panelState(2)} inert={step !== 2} aria-hidden={step !== 2}>
          <h2 className={styles.title}>{STEPS[2].title}</h2>
          <div className={styles.fields}>
            <div className={styles.field}>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} placeholder="you@example.com" defaultValue={state.values?.email} readOnly={pending} />
            </div>
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <Label htmlFor="password">Password</Label>
                <span className={styles.hint}>8+ characters</span>
              </div>
              <div className={styles.passwordWrap}>
                <Input id="password" name="password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} readOnly={pending} className="auth-pass" />
                <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide passwords" : "Show passwords"} aria-pressed={visible} className="auth-eye">
                  {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input id="confirm_password" name="confirm_password" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} readOnly={pending} />
            </div>
          </div>
          <label className={styles.consent}>
            <input type="checkbox" name="consent" required />
            <span>I agree to Rova&apos;s Terms of Service and Privacy Policy, and to Rova processing my details to coordinate deliveries.</span>
          </label>
        </div>
      </div>

      <div className={styles.alert} aria-live="polite" aria-atomic="true">
        {state.error && step === LAST ? <p role="alert" className="auth-error">{state.error}</p> : null}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.back}
          data-visible={step > 0}
          disabled={step === 0 || pending}
          aria-hidden={step === 0}
          aria-label="Back"
          onClick={() => setStep((current) => Math.max(current - 1, 0))}
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        {step < LAST ? (
          <Button key="continue" type="button" onClick={next} disabled={step === 0 && !role} className="auth-submit flex-1 gap-2">
            Continue <ArrowRight size={20} aria-hidden="true" />
          </Button>
        ) : (
          <Button key="submit" type="submit" disabled={pending} className="auth-submit flex-1 gap-2">
            {pending ? <><LoaderCircle size={20} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Creating account…</> : <>Create account <ArrowRight size={20} aria-hidden="true" /></>}
          </Button>
        )}
      </div>

      <p className={styles.fine} data-show={step === LAST} aria-hidden={step !== LAST}>
        By signing up, you agree to our Terms and Conditions.
      </p>
    </form>
  );
}