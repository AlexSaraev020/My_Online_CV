import type { CSSProperties } from 'react';
import { EDUCATION, EXTRA_SKILLS, EXPERIENCE, SKILLS, type CvEntry, type SkillTier } from '@/lib/site';
import { PlateKicker } from '../Chrome';
import PlateNum from '../PlateNum';
import Words from '../Words';

/* tier is a judgement with three bands, not a score: the meter length comes
   from the band, and the screen-reader text says the band, never a number */
const BAND: Record<SkillTier, number> = { deep: 100, strong: 66, working: 40 };

function CvRow({ e, i }: { e: CvEntry; i: number }) {
  return (
    <li className="cv-row" style={{ transitionDelay: `${i * 42}ms` }}>
      <span className="period">{e.period}</span>
      <div>
        <b>{e.role}</b>
        <i>{e.org}</i>
        <p>{e.body}</p>
      </div>
    </li>
  );
}

export default function Cv() {
  return (
    <section id="cv" className="plate paper-sec" data-scrub>
      <PlateNum n="06" className="plate-num--paper" />

      <header className="sec-head">
        <PlateKicker n={6} label="experience & education" />
        <Words className="sec-title plate-title" text="The CV, as a printed page." />
        <p className="sec-note">
          Three roles, one course, and the tooling that came with them. Counts and percentages are the
          ones on the CV.
        </p>
      </header>

      <div className="cv-grid">
        <div className="cv-main">
          <h3 className="cv-sub">Experience</h3>
          <ol className="cv-timeline stagger">
            {EXPERIENCE.map((e, i) => <CvRow key={e.org} e={e} i={i} />)}
          </ol>

          <h3 className="cv-sub">Education</h3>
          <ol className="cv-timeline stagger">
            {EDUCATION.map((e, i) => <CvRow key={e.org} e={e} i={i} />)}
          </ol>
        </div>

        <div className="cv-side">
          <h3 className="cv-sub">Capabilities</h3>
          <ul className="cv-skills stagger">
            {SKILLS.map((s, i) => {
              const tier: SkillTier = BAND[s.tier] ? s.tier : 'working';
              return (
                <li key={s.name} className="skill" style={{ transitionDelay: `${i * 42}ms` }}>
                  <span className="name">
                    {s.name}
                    <span className="sr"> — {tier} knowledge</span>
                  </span>
                  <span className="meter" aria-hidden="true">
                    <i style={{ '--w': `${BAND[tier]}%` } as CSSProperties} />
                  </span>
                </li>
              );
            })}
          </ul>

          <h3 className="cv-sub">Also fluent in</h3>
          <ul className="chips stagger">
            {EXTRA_SKILLS.map((x, i) => (
              <li key={x} style={{ transitionDelay: `${i * 42}ms` }}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="paper-marginalia" aria-hidden="true">
        Set in Bricolage Grotesque &amp; IBM Plex Mono · Ink №01 · Paper №06
      </p>
    </section>
  );
}
