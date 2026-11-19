'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { CAPABILITIES, pad } from '@/lib/site';
import { PlateKicker } from '../Chrome';
import PlateNum from '../PlateNum';
import Words from '../Words';

/* A contents page you can actually read with a keyboard: the rows are tabs,
   arrows / Home / End move the selection, and the detail panel is the live
   region that announces what changed. */
export default function Capabilities() {
  const [active, setActive] = useState(CAPABILITIES[0].id);
  const rows = useRef<Record<string, HTMLButtonElement | null>>({});
  const i = Math.max(0, CAPABILITIES.findIndex((c) => c.id === active));
  const current = CAPABILITIES[i];

  function move(from: string, delta: number | 'first' | 'last') {
    const at = CAPABILITIES.findIndex((c) => c.id === from);
    const next = delta === 'first' ? 0
      : delta === 'last' ? CAPABILITIES.length - 1
      : (at + delta + CAPABILITIES.length) % CAPABILITIES.length;
    const id = CAPABILITIES[next].id;
    setActive(id);
    rows.current[id]?.focus();
  }

  function onKeyDown(ev: KeyboardEvent<HTMLDivElement>) {
    const id = (ev.target as HTMLElement).dataset.cap;
    if (!id) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') { ev.preventDefault(); move(id, 1); }
    else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') { ev.preventDefault(); move(id, -1); }
    else if (ev.key === 'Home') { ev.preventDefault(); move(id, 'first'); }
    else if (ev.key === 'End') { ev.preventDefault(); move(id, 'last'); }
  }

  return (
    <section id="capabilities" className="plate caps" data-scrub>
      <header className="sec-head">
        <PlateKicker n={3} label="capabilities" />
        <Words className="sec-title plate-title" text="Contents." />
      </header>

      <PlateNum n="03" />

      <div className="caps-grid">
        <div className="caps-index stagger" role="tablist" aria-label="Capabilities" onKeyDown={onKeyDown}>
          {CAPABILITIES.map((c, k) => (
            <button
              key={c.id}
              type="button"
              id={`tab-${c.id}`}
              data-cap={c.id}
              className="cap-row"
              role="tab"
              aria-controls="capDetail"
              aria-selected={c.id === active}
              tabIndex={c.id === active ? 0 : -1}
              style={{ transitionDelay: `${k * 42}ms` }}
              onClick={() => setActive(c.id)}
              ref={(el) => { rows.current[c.id] = el; }}
            >
              <span className="n">{pad(k + 1)}</span>
              <span className="cap-text">
                <b>{c.name}</b>
                <span>{c.line}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="caps-detail" id="capDetail" aria-live="polite">
          <p className="kicker">{pad(i + 1)} / {pad(CAPABILITIES.length)}</p>
          <h3>{current.name}</h3>
          <p>{current.body}</p>
          <ul className="stack-tags" aria-label={`Tools used for ${current.name}`}>
            {current.stack.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
