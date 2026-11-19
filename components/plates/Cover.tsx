import Link from 'next/link';
import { DISCIPLINES, SITE, asset } from '@/lib/site';
import PlateNum from '../PlateNum';
import Words from '../Words';

const AVATAR_ALT = 'Illustrated portrait of the developer in profile, on a dark disc with a mint code glyph and a terminal window beside it.';

export default function Cover() {
  return (
    <section id="hero" className="plate hero plate-cover" data-scrub>
      <p className="folio cover-folio" aria-hidden="true">Issue 01 — {SITE.role}</p>
      <PlateNum n="01" className="cover-num" />

      <p className="masthead">
        Signal Field <i>/</i> Issue 01 <i>/</i> <span>{SITE.availability}</span>
      </p>

      <Words tag="h1" base={260} className="hero-title cover-type" text="Software that holds up." />

      <div className="hero-portrait cover-disc" data-parallax="0.06">
        <img
          className="od-media od-media-cover avatar"
          src={asset('/assets/avatar.png')}
          width={1254}
          height={1254}
          alt={AVATAR_ALT}
        />
        <span className="portrait-ring" aria-hidden="true" />
      </div>

      <p className="hero-lead cover-caption">
        I work on the whole shape of a build — the interface, the services underneath it, the
        automations in between, and the parts that have to survive real users, real deadlines and the
        second year.
      </p>

      <ul className="hero-strip stagger" aria-label="What I build">
        {DISCIPLINES.map((d, i) => (
          <li key={d.label} style={{ transitionDelay: `${i * 42}ms` }}>
            <b>{d.label}</b>
            <span>{d.value}</span>
          </li>
        ))}
      </ul>

      <div className="hero-actions">
        <Link className="btn btn-solid magnetic" href="/#contact" data-nav="contact">Start a conversation</Link>
        <Link className="btn btn-line magnetic" href="/#work" data-nav="work">Read the plates</Link>
      </div>

      <p className="micro cover-micro" aria-hidden="true">Seven plates · one field</p>
      <div className="scroll-cue" aria-hidden="true"><span /><i>01</i></div>
    </section>
  );
}
