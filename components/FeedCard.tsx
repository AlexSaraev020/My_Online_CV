'use client';

import { useState } from 'react';
import type { Case } from '@/lib/feed';
import { asset } from '@/lib/site';
import Shot from './Shot';

/* A repository published through PORTFOLIO.md, set as an index row rather than
   a plate: same type roles, same hairline rules, same stack chips. A project
   with several photos shows one at a time — the first by default — and the
   arrows under it move through the rest. */
export default function FeedCard({ c, index }: { c: Case; index: number }) {
  const [at, setAt] = useState(0);
  const last = c.images.length - 1;
  const cover = c.images[Math.min(at, Math.max(last, 0))];

  const step = (d: number) => setAt((cur) => (cur + d < 0 ? last : cur + d > last ? 0 : cur + d));

  return (
    <li className={`repo-row${cover ? '' : ' repo-row--noimg'}`} style={{ transitionDelay: `${index * 42}ms` }}>
      {cover ? (
        <div className="repo-thumb">
          <Shot img={cover} />
          {last > 0 ? (
            <div className="repo-carousel">
              <button type="button" onClick={() => step(-1)} aria-label={`Previous photo of ${c.title}`}>&#8592;</button>
              <span aria-live="polite">{`${at + 1} / ${c.images.length}`}</span>
              <button type="button" onClick={() => step(1)} aria-label={`Next photo of ${c.title}`}>&#8594;</button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="repo-body">
        <p className="repo-title">
          <a href={asset(`/work/${c.id}`)}>{c.title}</a>
          <i>{c.year || c.status}</i>
        </p>
        {c.subtitle ? <p className="repo-sub">{c.subtitle}</p> : null}
        <p className="repo-line">{c.description}</p>
        {c.stack.length ? (
          <ul className="stack-tags" aria-label={`Technologies in ${c.title}`}>
            {c.stack.map((s) => <li key={s}>{s}</li>)}
          </ul>
        ) : null}
      </div>

      <div className="repo-links">
        <a href={asset(`/work/${c.id}`)}>Case study</a>
        {c.live ? <a href={c.live} target="_blank" rel="noopener noreferrer">Live</a> : null}
        {c.source ? <a href={c.source} target="_blank" rel="noopener noreferrer">Code</a> : null}
      </div>
    </li>
  );
}
