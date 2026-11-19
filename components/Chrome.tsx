import Link from 'next/link';
import { ISSUE, SITE, pad } from '@/lib/site';

/* ==========================================================================
   The chrome that stands around the plates: the printer's trim frame, the
   progress hairline, the opening sweep, the folio rail, the header, the
   footer. All of it is plain markup — the director in Experience.tsx is what
   makes it move, and none of it is needed to read the page.
   ========================================================================== */

export const PLATES = [
  { id: 'about', label: 'Approach' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'work', label: 'Work' },
  { id: 'process', label: 'Process' },
  { id: 'cv', label: 'CV' },
  { id: 'contact', label: 'Contact' }
];

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M25 21 13 32l12 11M39 21l12 11-12 11" />
    </svg>
  );
}

export function SkipLink() {
  return <a className="skip-link" href="#main">Skip to content</a>;
}

export function TrimFrame() {
  return (
    <div className="trim" aria-hidden="true">
      <i className="trim-mark tl" /><i className="trim-mark tr" />
      <i className="trim-mark bl" /><i className="trim-mark br" />
    </div>
  );
}

export function ScrollProgress() {
  return (
    <div className="scroll-progress" aria-hidden="true">
      <span id="scrollBar" />
    </div>
  );
}

export function Intro() {
  return (
    <div className="intro" id="intro" aria-hidden="true">
      <span className="intro-scan" />
      <span className="intro-glyph">&lt;/&gt;</span>
      <span className="intro-folio">Signal Field · Issue 01</span>
    </div>
  );
}

export function Cursor() {
  return (
    <div className="cursor" id="cursor" aria-hidden="true">
      <span className="cursor-ring" />
    </div>
  );
}

export function LiveRegion() {
  return <p id="live" className="sr" aria-live="polite" role="status" />;
}

export function FolioRail() {
  return (
    <aside className="rail" id="rail" aria-hidden="true">
      <p className="rail-state" id="railState">Field</p>
      <span className="rail-track"><i id="railFill" /></span>
      <ul className="rail-marks" id="railMarks" />
    </aside>
  );
}

export function SiteHead() {
  return (
    <header className="site-head">
      <Link className="wordmark" href="/#hero" data-nav="hero">
        <Mark />
        <span className="wordmark-text">
          <b>{SITE.name}</b>
          <i>{ISSUE}</i>
        </span>
      </Link>

      <nav className="nav" aria-label="Plates">
        <ul id="navList">
          {PLATES.map((p) => (
            <li key={p.id}>
              <Link href={`/#${p.id}`} data-nav={p.id}>{p.label}</Link>
            </li>
          ))}
        </ul>
        <span className="nav-indicator" aria-hidden="true" />
      </nav>

      <button className="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menuSheet">
        <span className="menu-btn-label">Plates</span>
      </button>
    </header>
  );
}

export function SiteFoot() {
  return (
    <footer className="site-foot">
      <div className="foot-bar">
        <Mark />
        <p className="foot-name">
          <b>{SITE.name}</b> — <span>{SITE.role.toLowerCase()}</span>
        </p>
        <p className="kicker foot-legal">Signal Field · Issue 01 · original build, Three.js, no template</p>
      </div>
    </footer>
  );
}

export function PlateKicker({ n, label }: { n: number; label: string }) {
  return (
    <p className="kicker">
      Plate {pad(n)} <em>— {label}</em>
    </p>
  );
}
