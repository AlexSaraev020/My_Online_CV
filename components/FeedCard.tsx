import type { Case } from '@/lib/feed';
import Shot from './Shot';

/* A repository published through PORTFOLIO.md, set as an index row rather than
   a plate: same type roles, same hairline rules, same stack chips. */
export default function FeedCard({ c, index }: { c: Case; index: number }) {
  const cover = c.images[0];
  return (
    <li className={`repo-row${cover ? '' : ' repo-row--noimg'}`} style={{ transitionDelay: `${index * 42}ms` }}>
      {cover ? <div className="repo-thumb"><Shot img={cover} /></div> : null}

      <div className="repo-body">
        <p className="repo-title">
          <a href={`/work/${c.id}`}>{c.title}</a>
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
        <a href={`/work/${c.id}`}>Case study</a>
        {c.live ? <a href={c.live} target="_blank" rel="noopener noreferrer">Live</a> : null}
        {c.source ? <a href={c.source} target="_blank" rel="noopener noreferrer">Code</a> : null}
      </div>
    </li>
  );
}
