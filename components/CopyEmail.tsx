'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site';

/* Clipboard access can be refused — the fallback tells you what to do instead
   of failing quietly. */
export default function CopyEmail() {
  const [state, setState] = useState<'idle' | 'copied' | 'blocked'>('idle');

  async function copy() {
    const done = (ok: boolean) => {
      setState(ok ? 'copied' : 'blocked');
      const live = document.getElementById('live');
      if (live) live.textContent = ok ? 'Email address copied to your clipboard.' : 'Clipboard blocked here — select the address and copy it yourself.';
      window.setTimeout(() => setState('idle'), 1800);
    };
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(SITE.email); done(true); } catch { done(false); }
    } else done(false);
  }

  return (
    <button type="button" className="btn btn-line" onClick={copy}>
      {state === 'copied' ? 'Copied' : state === 'blocked' ? 'Select it manually' : 'Copy address'}
    </button>
  );
}
