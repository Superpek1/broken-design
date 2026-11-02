'use client';

// Email-first sign-in: enter an email, we look it up, then ask for its password (known email) or register (new email),
// and finally verify with a 6-digit one-time code (OTP).
// UI only: the lookup is mocked (lib/auth.ts), no code is sent and nothing is sent to core-api yet.
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { checkEmail } from '@/lib/auth';
import { EMAIL_RE, FIELD, Field } from './Field';

type Step = 'email' | 'login' | 'signup' | 'otp';

interface Values {
  email: string;
  name: string;
  password: string;
  code: string;
}
type Errors = Partial<Record<keyof Values, string>>;

function validate(step: Step, v: Values): Errors {
  const errors: Errors = {};
  if (step === 'otp') {
    if (!/^\d{6}$/.test(v.code)) errors.code = 'Enter the 6-digit code.';
    return errors;
  }
  if (step === 'email') {
    if (!v.email.trim()) errors.email = 'Enter your email.';
    else if (!EMAIL_RE.test(v.email.trim())) errors.email = 'Enter a valid email address.';
    return errors;
  }
  if (step === 'signup' && !v.name.trim()) errors.name = 'Enter a display name.';
  if (!v.password) errors.password = step === 'login' ? 'Enter your password.' : 'Choose a password.';
  else if (step === 'signup' && v.password.length < 8) errors.password = 'Use at least 8 characters.';
  return errors;
}

// Brand mark, so it is inline SVG rather than a lucide icon.
function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 18 18" className="h-[18px] w-[18px]">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

const COPY = {
  email: {
    title: 'Welcome to Lixyte',
    lead: 'Enter your email. We’ll check whether you already have an account.',
    submit: 'Continue',
  },
  login: {
    title: 'Welcome back',
    lead: 'Enter your password to log in.',
    submit: 'Log in',
  },
  signup: {
    title: 'Create account',
    lead: 'No account for this email yet. Set one up to publish and embed 3D models.',
    submit: 'Create account',
  },
  otp: {
    title: 'Verify it’s you',
    lead: 'Enter the 6-digit code we sent to your email.',
    submit: 'Verify',
  },
} as const;

const PRIMARY =
  'mt-1 h-10 w-full rounded-lg bg-white text-[15px] font-medium text-black transition-colors hover:bg-white/85 disabled:opacity-60';

export default function AuthForm() {
  const [step, setStep] = useState<Step>('email');
  const [values, setValues] = useState<Values>({ email: '', name: '', password: '', code: '' });
  const [flow, setFlow] = useState<'login' | 'signup'>('login');
  const [resent, setResent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [googleTried, setGoogleTried] = useState(false);
  const [done, setDone] = useState(false);

  const copy = COPY[step];

  const update = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (submitted) setErrors(validate(step, next));
  };

  // Digits only.
  const updateCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, code: e.target.value.replace(/\D/g, '') };
    setValues(next);
    if (submitted) setErrors(validate(step, next));
  };

  const goTo = (next: Step) => {
    setStep(next);
    setErrors({});
    setSubmitted(false);
    setDone(false);
    setGoogleTried(false);
    setShowPassword(false);
    setResent(false);
    if (next === 'email') setValues((v) => ({ ...v, password: '', code: '' }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (checking) return;
    const found = validate(step, values);
    setErrors(found);
    setSubmitted(true);
    setGoogleTried(false);
    if (Object.keys(found).length > 0) return;

    if (step === 'email') {
      setChecking(true);
      const exists = await checkEmail(values.email);
      setChecking(false);
      goTo(exists ? 'login' : 'signup');
      return;
    }
    if (step === 'login' || step === 'signup') {
      setFlow(step);
      goTo('otp');
      return;
    }
    setDone(true);
  };

  const fieldClass = (key: keyof Values) =>
    `${FIELD} ${errors[key] ? 'border-red-400/70 focus:border-red-300' : 'border-white/15 focus:border-white/50'}`;
  const described = (key: keyof Values) => (errors[key] ? `${key}-error` : undefined);

  const passwordField = (
    <Field id="password" label="Password" error={errors.password}>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete={step === 'login' ? 'current-password' : 'new-password'}
          autoFocus={step !== 'signup'}
          value={values.password}
          onChange={update('password')}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={described('password')}
          placeholder={step === 'signup' ? 'At least 8 characters' : 'Your password'}
          className={`${fieldClass('password')} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-white/65 transition-colors hover:text-white"
        >
          {showPassword ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
        </button>
      </div>
    </Field>
  );

  const statusText = googleTried
    ? "Google sign-in isn't connected yet. Nothing was sent."
    : done
      ? flow === 'login'
        ? "Sign-in isn't connected yet. Your details were not sent anywhere."
        : "Registration isn't connected yet. Your details were not sent anywhere."
      : step === 'otp'
        ? resent
          ? "Resend isn't connected yet. No code was sent."
          : "Verification isn't connected yet. No code was sent; any 6 digits will do for now."
        : '';

  return (
    <div className="w-full max-w-[420px]">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-hud/70">[ Account ]</p>
      <h1 className="mt-4 whitespace-nowrap font-display text-[clamp(12px,calc((100vw_-_32px)/23),18px)] uppercase leading-[1.05] text-white">{copy.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-white/65">{copy.lead}</p>

      <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-5 sm:p-6">
        {step === 'email' && (
          <>
            <button
              type="button"
              onClick={() => setGoogleTried(true)}
              className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-white/15 bg-white/5 text-[15px] text-white transition-colors hover:border-white/40"
            >
              <GoogleMark />
              Continue with Google
            </button>

            <div aria-hidden className="mt-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
              <span className="h-px flex-1 bg-white/10" />
              or
              <span className="h-px flex-1 bg-white/10" />
            </div>
          </>
        )}

        {step !== 'email' && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm">
            <span className="truncate text-white">{values.email.trim()}</span>
            <button
              type="button"
              onClick={() => goTo('email')}
              className="shrink-0 text-white/65 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Change
            </button>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className={`${step === 'email' ? 'mt-5' : 'mt-4'} grid gap-4`}>
          {step === 'email' && (
            <Field id="email" label="Email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={update('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={described('email')}
                placeholder="you@example.com"
                className={fieldClass('email')}
              />
            </Field>
          )}

          {step === 'signup' && (
            <Field id="name" label="Display name" error={errors.name}>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                autoFocus
                value={values.name}
                onChange={update('name')}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={described('name')}
                placeholder="Ada Lovelace"
                className={fieldClass('name')}
              />
            </Field>
          )}

          {(step === 'login' || step === 'signup') && passwordField}

          {step === 'otp' && (
            <Field id="code" label="Verification code" error={errors.code}>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
                value={values.code}
                onChange={updateCode}
                aria-invalid={Boolean(errors.code)}
                aria-describedby={described('code')}
                placeholder="123456"
                className={`${fieldClass('code')} text-center font-mono text-lg tracking-[0.5em]`}
              />
            </Field>
          )}

          {step === 'login' && (
            <div className="-mt-2 text-right">
              <Link href="/forgot-password" className="text-sm text-white/65 underline-offset-4 transition-colors hover:text-white hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <button type="submit" disabled={checking} className={PRIMARY}>
            {checking ? 'Checking…' : copy.submit}
          </button>

          {step === 'otp' && (
            <p className="-mt-1 text-center text-sm text-white/65">
              Didn&apos;t get it?{' '}
              <button
                type="button"
                onClick={() => setResent(true)}
                className="text-white underline-offset-4 hover:underline"
              >
                Resend code
              </button>
            </p>
          )}

          <div role="status" aria-live="polite">
            {statusText && (
              <p className="flex items-start gap-1.5 text-sm text-amber">
                <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                {statusText}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
