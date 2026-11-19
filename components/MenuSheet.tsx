'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { pad } from '@/lib/site';
import { PLATES } from './Chrome';

/* The mobile plate menu is a native <dialog>: Esc closes it, the browser owns
   the focus trap, and this component only supplies the two buttons that open
   and close it. */
export default function MenuSheet() {
  useEffect(() => {
    const btn = document.getElementById('menuBtn');
    const sheet = document.getElementById('menuSheet') as HTMLDialogElement | null;
    if (!btn || !sheet) return;

    const open = () => {
      if (typeof sheet.showModal === 'function') sheet.showModal();
      else sheet.setAttribute('open', '');
      btn.setAttribute('aria-expanded', 'true');
      const first = sheet.querySelector<HTMLElement>('.sheet-list a');
      first?.focus();
    };
    const closed = () => btn.setAttribute('aria-expanded', 'false');
    const close = () => sheet.close();
    const closeBtn = sheet.querySelector<HTMLElement>('[data-close-menu]');

    btn.addEventListener('click', open);
    sheet.addEventListener('close', closed);
    closeBtn?.addEventListener('click', close);
    return () => {
      btn.removeEventListener('click', open);
      sheet.removeEventListener('close', closed);
      closeBtn?.removeEventListener('click', close);
    };
  }, []);

  return (
    <dialog id="menuSheet" className="sheet" aria-label="Plate navigation">
      <div className="sheet-form">
        <ul className="sheet-list">
          {PLATES.map((p, i) => (
            <li key={p.id}>
              <Link href={`/#${p.id}`} data-nav={p.id}>
                <i className="sheet-n">{pad(i + 2)}</i>
                {p.id === 'work' ? 'Selected work' : p.id === 'cv' ? 'Experience / CV' : p.label}
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-ghost sheet-close" data-close-menu>Close</button>
      </div>
    </dialog>
  );
}
