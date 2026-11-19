import ContactForm from '../ContactForm';
import CopyEmail from '../CopyEmail';
import { PlateKicker } from '../Chrome';
import PlateNum from '../PlateNum';
import Words from '../Words';
import { SITE } from '@/lib/site';

function Arrow() {
  return (
    <svg className="od-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="plate contact" data-scrub>
      <PlateNum n="07" />

      <header className="sec-head">
        <PlateKicker n={7} label="contact" />
        <Words className="sec-title plate-title contact-title" text="Tell me what you are building." />
      </header>

      <div className="contact-grid">
        <div className="contact-intro" data-reveal>
          <p>
            Send the messy version — the constraint, the deadline, the thing that is currently wobbling.
            I will tell you plainly whether I am the right person for it.
          </p>
          <p className="kicker">Direct</p>
          <p className="contact-mail">
            <a className="od-nowrap" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
          <p className="contact-mail">
            <a className="od-nowrap" href={`tel:${SITE.tel}`}>{SITE.phone}</a>
          </p>
          <p className="note">
            Based in {SITE.location} — available for remote, hybrid or on-site work.
          </p>
          <CopyEmail />
          <ul className="socials">
            {Object.entries(SITE.links).map(([label, href]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer">{label}<Arrow /></a>
              </li>
            ))}
          </ul>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
