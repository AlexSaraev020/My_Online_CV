import Link from 'next/link';
import { FEED_CASES, META, plateHeadline, skippedSummary, type Case } from '@/lib/feed';
import { SITE } from '@/lib/site';
import FeedCard from '../FeedCard';
import { PlateKicker } from '../Chrome';
import PlateNum from '../PlateNum';
import Words from '../Words';
import WorkCard from '../WorkCard';

const ACCOUNT = `github.com/${META.user || SITE.links.GitHub.split('/').pop()}`;

export default function Work({ curated }: { curated: Case[] }) {
  const total = curated.length + FEED_CASES.length;

  return (
    <section id="work" className="plate work" data-scrub>
      <header className="sec-head">
        <PlateKicker n={4} label="selected work" />
        <Words className="sec-title plate-title" text={plateHeadline()} />
        <p className="sec-note">
          Every build here publishes its own PORTFOLIO.md and arrives through the synchroniser. Where a
          build has screenshots they are its real interface, and the arrows move through them.
        </p>
      </header>

      <PlateNum n="04" />

      <div className="work-list stagger">
        {curated.map((c, i) => <WorkCard key={c.id} c={c} index={i} total={total} />)}
      </div>

      <h3 className="kicker repo-head">
        From GitHub —{' '}
        <a className="repo-profile" href={SITE.links.GitHub} target="_blank" rel="noopener noreferrer">{ACCOUNT}</a>
      </h3>
      <p className="feed-status">{feedStatus()}</p>

      {FEED_CASES.length ? (
        <ul className="repo-list stagger">
          {FEED_CASES.map((c, i) => <FeedCard key={c.id} c={c} index={i} />)}
        </ul>
      ) : (
        <div className="plate-empty">
          <p className="plate-empty-lead">Nothing published yet — and that is the mechanism working.</p>
          <p>
            A repository appears here only when it carries a file named <b>PORTFOLIO.md</b> in its root.
            That file is the whole qualification test: no topics, no tags, no manual entry in the site.
            The format every one must follow is written out in <b>PORTFOLIO_SCHEMA.md</b>, with a
            copy-paste example for a large build and a five-field example for a small one.
          </p>
          <p className="note">{skippedSummary()}</p>
          <div className="od-row od-cluster">
            <a className="btn btn-line" href={SITE.links.GitHub} target="_blank" rel="noopener noreferrer">Open the account</a>
            <Link className="btn btn-ghost" href="/#contact" data-nav="contact">Ask how the schema works</Link>
          </div>
        </div>
      )}
    </section>
  );
}

function feedStatus(): string {
  if (!META.generatedAt) return 'No feed yet — run npm run sync and this plate fills itself.';
  const when = new Date(META.generatedAt);
  const stamp = Number.isNaN(when.getTime())
    ? 'date unknown'
    : when.toUTCString().replace(/\s\d{2}:\d{2}:\d{2}\sGMT$/, '');
  return `${META.eligible || FEED_CASES.length} of ${META.accountRepos || 0} repositories publish PORTFOLIO.md · ${(META.skipped || []).length} not listed · feed generated ${stamp}`;
}
