import Link from 'next/link';
import PlateNum from '@/components/PlateNum';
import Words from '@/components/Words';

export default function NotFound() {
  return (
    <main id="main">
      <section id="missing" className="plate" data-scrub>
        <PlateNum n="00" />
        <header className="sec-head">
          <p className="kicker">Page <em>— not in this issue</em></p>
          <Words className="sec-title plate-title" text="That plate was never printed." />
        </header>

        <div className="plate-empty">
          <p className="plate-empty-lead">Nothing lives at this address.</p>
          <p>
            Either the project was never published through <b>PORTFOLIO.md</b>, or it was removed and the
            next synchronisation took it off the plate. The work that is here now is listed below.
          </p>
          <div className="od-row od-cluster">
            <Link className="btn btn-solid" href="/#work" data-nav="work">Back to selected work</Link>
            <Link className="btn btn-line" href="/#contact" data-nav="contact">Ask about a project</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
