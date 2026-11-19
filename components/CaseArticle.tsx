import Link from 'next/link';
import type { Block } from '@/lib/portfolio';
import type { Case } from '@/lib/feed';
import { neighbours } from '@/lib/feed';
import { pad } from '@/lib/site';
import Shot from './Shot';
import { PREVIEWS } from './Previews';

/* ==========================================================================
   The case study page. Same sheet design the takeover used in the no-build
   version — narrative on the left, facts on the right, the picture spanning
   beneath them, prev / next along the bottom — but standing as its own page so
   it has a real address, its own title in the tab and its own metadata.
   ========================================================================== */

function CloseIcon() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" style={{ '--od-icon-size': '20px' } as React.CSSProperties} aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* Markdown never reaches the page as HTML: the parser already stripped every
   tag, and each block becomes an element. */
function RenderBlock({ b }: { b: Block }) {
  if (b.type === 'ul') {
    return <ul className="case-list">{(b.items || []).map((t, i) => <li key={`${t}-${i}`}>{t}</li>)}</ul>;
  }
  if (b.type === 'h') return <h4 className="case-sub">{b.text}</h4>;
  if (b.type === 'code') return <pre className="case-code">{b.text}</pre>;
  return <p>{b.text}</p>;
}

function Fact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  const isLink = /^https:\/\//.test(value);
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        {isLink
          ? <a className="case-link" href={value} target="_blank" rel="noopener noreferrer">{label === 'Live site' ? 'Open it' : 'Read the code'}</a>
          : value}
      </dd>
    </div>
  );
}

export default function CaseArticle({ c }: { c: Case }) {
  const nav = neighbours(c.id);
  if (!nav) return null;
  const Preview = c.previewKey ? PREVIEWS[c.previewKey] : null;
  const cover = c.shot || c.images[0] || null;
  const rest = c.shot ? [] : c.images.slice(1);

  return (
    <div className="case is-open">
      <div className="case-inner">
        <header className="case-head">
          <p className="kicker">{[c.kind, c.year].filter(Boolean).join(' · ')}</p>
          <h3>{c.title}</h3>
          <Link className="case-close" href={`/#work-${c.id}`}>
            <span className="sr">Back to the work plate</span>
            <CloseIcon />
          </Link>
        </header>

        {c.subtitle ? <p className="case-sub">{c.subtitle}</p> : null}

        <div className="case-body">
          <div className="case-narrative">
            {c.sections.map((row) => (
              <div key={row.label}>
                <p className="kicker">{row.label}</p>
                {row.blocks.map((b, i) => <RenderBlock key={`${row.label}-${i}`} b={b} />)}
              </div>
            ))}
            {c.tags.length ? (
              <div>
                <p className="kicker">Tags</p>
                <ul className="stack-tags" aria-label={`Tags for ${c.title}`}>
                  {c.tags.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
            ) : null}
          </div>

          <dl className="case-facts">
            <Fact label="Role" value={c.role} />
            <Fact label="Stack" value={c.stack.join(', ')} />
            <Fact label="Status" value={c.status} />
            <Fact label="Live site" value={c.live} />
            <Fact label="Repository" value={c.source} />
            <Fact label="Updated" value={c.updated} />
          </dl>

          {cover ? (
            <div className="case-preview"><Shot img={cover} /></div>
          ) : Preview ? (
            <div className="case-preview"><Preview /></div>
          ) : null}

          {rest.length ? (
            <ul className="case-gallery">
              {rest.map((img) => <li key={img.src}><Shot img={img} /></li>)}
            </ul>
          ) : null}
        </div>

        <nav className="case-foot" aria-label="Project navigation">
          <a className="btn btn-line" href={`/work/${nav.prev.id}`}>Previous — {nav.prev.title}</a>
          <p className="kicker">{pad(nav.index + 1)} / {pad(nav.total)}</p>
          <a className="btn btn-solid" href={`/work/${nav.next.id}`}>Next — {nav.next.title}</a>
        </nav>
      </div>
    </div>
  );
}
