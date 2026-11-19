'use client';

import { useEffect, useRef, useState } from 'react';
import { ENGAGEMENT_KINDS, SITE } from '@/lib/site';

/* There is no backend, and none is faked: the outline is packaged and opened
   in the visitor's own mail client. Errors appear on blur, next to the field
   that caused them, and say what to do about it. */

const RULES = {
  name: {
    label: 'your name',
    test: (v: string) => (v.trim().length >= 2 ? '' : 'Tell me who you are — a first name is enough.')
  },
  email: {
    label: 'your email',
    test: (v: string) => {
      if (!v.trim()) return 'An email address is the only part I actually need.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
        ? ''
        : 'That address looks incomplete — check for a missing domain or a stray space.';
    }
  },
  message: {
    label: 'project outline',
    test: (v: string) => (v.trim().length >= 20 ? '' : 'A sentence or two gets us started — at least 20 characters.')
  }
} as const;

type Field = keyof typeof RULES;
const FIELDS = Object.keys(RULES) as Field[];
const EMPTY: Record<Field, string> = { name: '', email: '', message: '' };

export default function ContactForm() {
  const [values, setValues] = useState<Record<Field, string>>(EMPTY);
  const [errors, setErrors] = useState<Record<Field, string>>(EMPTY);
  const [summary, setSummary] = useState<Field[]>([]);
  const [status, setStatus] = useState<'idle' | 'packing' | 'sent'>('idle');
  const [kind, setKind] = useState(ENGAGEMENT_KINDS[0]);
  const [mailto, setMailto] = useState('');

  const inputs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const link = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (status === 'sent') link.current?.focus();
  }, [status]);

  const announce = (msg: string) => {
    const live = document.getElementById('live');
    if (live) live.textContent = msg;
  };

  const check = (field: Field, value: string) => RULES[field].test(value);

  function onBlur(field: Field) {
    const message = check(field, values[field]);
    setErrors((e) => ({ ...e, [field]: message }));
    if (!message) setSummary((s) => s.filter((f) => f !== field));
  }

  function onInput(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    const message = check(field, value);
    setErrors((e) => (e[field] ? { ...e, [field]: message } : e));
    /* a field you have just fixed must stop being listed as missing */
    if (!message) setSummary((s) => s.filter((f) => f !== field));
  }

  function send() {
    const found = FIELDS.filter((f) => check(f, values[f]));
    if (found.length) {
      setErrors((e) => {
        const next = { ...e };
        FIELDS.forEach((f) => { next[f] = found.includes(f) ? check(f, values[f]) : ''; });
        return next;
      });
      setSummary(found);
      inputs.current[found[0]]?.focus();
      announce(found.length === 1
        ? 'One thing is missing before this can go.'
        : `${found.length} things need attention before this can go.`);
      return;
    }

    setSummary([]);
    setStatus('packing');
    window.setTimeout(() => {
      const body = `${values.message.trim()}\n\n— ${values.name.trim()} (${values.email.trim()})`;
      setMailto(
        `mailto:${SITE.email}?subject=${encodeURIComponent(`[${kind}] ${values.name.trim()}`)}` +
        `&body=${encodeURIComponent(body)}`
      );
      setStatus('sent');
    }, 700);
  }

  function reset() {
    setValues(EMPTY);
    setErrors(EMPTY);
    setSummary([]);
    setStatus('idle');
    setKind(ENGAGEMENT_KINDS[0]);
    setMailto('');
    /* focus after the success block has actually been removed from the page */
    requestAnimationFrame(() => inputs.current.name?.focus());
  }

  const summaryText = summary.length === 1
    ? 'One thing is missing before this can go.'
    : `${summary.length} things need attention before this can go.`;

  return (
    <form className={`form${status === 'sent' ? ' is-sent' : ''}`} noValidate onSubmit={(e) => e.preventDefault()}>
      <p className="form-status" hidden={summary.length === 0} role="alert">
        {summary.length ? summaryText : ''}
        {summary.map((f) => (
          <span key={f}>
            {' '}
            <button type="button" className="sheet-chip" onClick={() => inputs.current[f]?.focus()}>
              {RULES[f].label}
            </button>
          </span>
        ))}
      </p>

      <div className={`od-field form-field${errors.name ? ' is-bad' : ''}`}>
        <label htmlFor="fName">Your name <span className="req">required</span></label>
        <input
          id="fName" name="name" type="text" autoComplete="name" required
          aria-describedby="eName" aria-invalid={errors.name ? 'true' : undefined}
          value={values.name}
          onChange={(e) => onInput('name', e.target.value)}
          onBlur={() => onBlur('name')}
          ref={(el) => { inputs.current.name = el; }}
        />
        <output className="form-error" id="eName" hidden={!errors.name}>{errors.name}</output>
      </div>

      <div className={`od-field form-field${errors.email ? ' is-bad' : ''}`}>
        <label htmlFor="fEmail">Email <span className="req">required</span></label>
        <input
          id="fEmail" name="email" type="email" autoComplete="email" required
          aria-describedby="eEmail" aria-invalid={errors.email ? 'true' : undefined}
          value={values.email}
          onChange={(e) => onInput('email', e.target.value)}
          onBlur={() => onBlur('email')}
          ref={(el) => { inputs.current.email = el; }}
        />
        <output className="form-error" id="eEmail" hidden={!errors.email}>{errors.email}</output>
      </div>

      <div className="od-field form-field">
        <label htmlFor="fKind">What is this about?</label>
        <select id="fKind" name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
          {ENGAGEMENT_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className={`od-field form-field${errors.message ? ' is-bad' : ''}`}>
        <label htmlFor="fMsg">Project outline <span className="req">required, 20+ characters</span></label>
        <textarea
          id="fMsg" name="message" rows={5} required minLength={20}
          aria-describedby="eMsg" aria-invalid={errors.message ? 'true' : undefined}
          value={values.message}
          onChange={(e) => onInput('message', e.target.value)}
          onBlur={() => onBlur('message')}
          ref={(el) => { inputs.current.message = el; }}
        />
        <output className="form-error" id="eMsg" hidden={!errors.message}>{errors.message}</output>
      </div>

      <div className="form-foot">
        <button type="button" className="btn btn-solid" id="sendBtn" onClick={send} disabled={status === 'packing'}>
          {status === 'packing' ? 'Packaging…' : 'Send the outline'}
        </button>
        <p className="form-note">
          No backend here yet — sending opens a pre-filled email from your own client.
        </p>
      </div>

      <div className="form-success" hidden={status !== 'sent'}>
        <p className="kicker">Ready to send</p>
        <p>Your outline is packaged. Open it, check it, and send it — or copy the address and write it your own way.</p>
        <div className="od-row od-cluster">
          <a className="btn btn-solid" id="mailtoLink" href={mailto} ref={link}>Open in mail client</a>
          <button type="button" className="btn btn-line" onClick={reset}>Write another</button>
        </div>
      </div>
    </form>
  );
}
