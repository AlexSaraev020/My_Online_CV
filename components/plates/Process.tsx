import { PROCESS } from '@/lib/site';
import { PlateKicker } from '../Chrome';
import PlateNum from '../PlateNum';
import Words from '../Words';

/* The line is drawn by the scroll: the director reads its length and sets
   stroke-dashoffset as the plate travels through the viewport. */
export default function Process() {
  return (
    <section id="process" className="plate process" data-scrub>
      <header className="sec-head">
        <PlateKicker n={5} label="process" />
        <Words className="sec-title plate-title" text="One line, five checkpoints." />
      </header>

      <PlateNum n="05" />

      <div className="process-track">
        <svg className="process-line" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
          <path
            id="processPath"
            d="M8 138 C 150 22, 300 22, 440 118 S 700 150, 860 40 S 1090 16, 1192 96"
          />
        </svg>

        <ol className="process-steps stagger">
          {PROCESS.map((s, i) => (
            <li key={s.n} className="process-step" style={{ transitionDelay: `${i * 42}ms` }}>
              <span className="n">{s.n}</span>
              <h3>{s.name}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
