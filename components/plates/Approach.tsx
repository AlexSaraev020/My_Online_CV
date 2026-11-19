import { PRINCIPLES } from '@/lib/site';
import { PlateKicker } from '../Chrome';
import PlateNum from '../PlateNum';
import Words from '../Words';

export default function Approach() {
  return (
    <section id="about" className="plate about" data-scrub>
      <header className="sec-head">
        <PlateKicker n={2} label="approach" />
        <Words className="sec-title plate-title" text="Most software fails quietly." />
      </header>

      <PlateNum n="02" />

      <div className="about-grid">
        <p className="pull-quote" data-reveal>
          Not in a fire. In the second year — when someone else has to change it, when the third-party
          service moves, when the team that built it has gone. I build for that moment, because that is
          where the cost actually lives.
        </p>

        <ol className="principles stagger">
          {PRINCIPLES.map((p, i) => (
            <li key={p.n} className="principle" style={{ transitionDelay: `${i * 42}ms` }}>
              <span className="n">{p.n}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="about-side" data-reveal>
          <p className="kicker">Colophon</p>
          <p>
            I take a problem end to end rather than a slice of it: framing, architecture, interface,
            deployment, and the handover that lets a client stop needing me on retainer to make a small
            change.
          </p>
          <p className="note">
            Engagements are direct — no agency layer, no account manager between you and the person
            writing the code.
          </p>
        </div>
      </div>
    </section>
  );
}
