'use client';

import type { CSSProperties } from 'react';
import { clearProjectFocus, focusProject } from '@/lib/field/state';
import type { Case } from '@/lib/feed';
import { pad } from '@/lib/site';
import Shot from './Shot';
import { PREVIEWS } from './Previews';

/* A curated plate on the runway. It is a link to a real page, and hovering or
   focusing it lights that project's own band of bars in the field. */
export default function WorkCard({ c, index, total }: { c: Case; index: number; total: number }) {
  const light = (on: boolean) => {
    if (on) focusProject(index, total); else clearProjectFocus();
    document.getElementById('cursor')?.classList.toggle('is-wide', on);
  };
  const Preview = c.previewKey ? PREVIEWS[c.previewKey] : null;

  return (
    <article className="work-item" id={`work-${c.id}`} style={{ transitionDelay: `${index * 42}ms` } as CSSProperties}>
      <div className="work-preview">
        {c.shot ? <Shot img={c.shot} /> : Preview ? <Preview /> : null}
      </div>

      <a
        className="work-open"
        href={`/work/${c.id}`}
        onPointerOver={() => light(true)}
        onPointerLeave={() => light(false)}
        onFocus={() => light(true)}
        onBlur={() => light(false)}
      >
        <div className="work-meta">
          <span>{pad(index + 1)} / {c.kind}</span>
          <span>{c.year}</span>
        </div>
        <h3>{c.title}</h3>
        <span className="work-line" />
        <span className="work-cta">Open case study</span>
      </a>
    </article>
  );
}
