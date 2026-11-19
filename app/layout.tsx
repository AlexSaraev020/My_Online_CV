import type { Metadata, Viewport } from 'next';
import { Cursor, FolioRail, Intro, LiveRegion, ScrollProgress, SiteFoot, SiteHead, SkipLink, TrimFrame } from '@/components/Chrome';
import Experience from '@/components/Experience';
import FieldLayer from '@/components/FieldLayer';
import MenuSheet from '@/components/MenuSheet';
import { CAPABILITIES, SITE, SITE_URL } from '@/lib/site';
import './globals.css';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=IBM+Plex+Mono:wght@400;500&display=swap';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE.name,
  jobTitle: SITE.role,
  description: `Full-stack developer in ${SITE.location}. React and Next.js interfaces, Node.js services, Zendesk App Framework tooling and workflow automation.`,
  image: `${SITE_URL}/assets/avatar.png`,
  email: `mailto:${SITE.email}`,
  telephone: SITE.tel,
  address: { '@type': 'PostalAddress', addressLocality: 'Bucharest', addressCountry: 'RO' },
  sameAs: Object.values(SITE.links),
  knowsAbout: CAPABILITIES.map((c) => c.name)
};

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.role} · Signal Field Issue 01`,
    template: `%s · ${SITE.name}`
  },
  description:
    'Signal Field, Issue 01 — the interactive portfolio and online CV of Alexandru Saraev, a full-stack developer in Bucharest: React and Next.js interfaces, Node.js services, Zendesk App Framework tooling and workflow automation.',
  applicationName: 'Signal Field',
  /* social crawlers need absolute URLs; every relative one in this block resolves against it */
  metadataBase: new URL(SITE_URL),
  authors: [{ name: SITE.name, url: SITE.links.GitHub }],
  creator: SITE.name,
  openGraph: {
    type: 'website',
    siteName: 'Signal Field, Issue 01',
    title: `${SITE.name} — ${SITE.role}`,
    description: 'React and Next.js interfaces, Node.js services, support-platform tooling and workflow automation. Bucharest, Romania.',
    images: [{ url: '/assets/avatar.png', width: 1254, height: 1254, alt: 'Illustrated portrait of Alexandru Saraev on a dark disc with a mint code glyph.' }]
  },
  twitter: { card: 'summary_large_image', title: `${SITE.name} — ${SITE.role}`, description: 'The interactive portfolio and online CV of a full-stack developer in Bucharest.' },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0e12',
  colorScheme: 'dark'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // the inline script below sets data-js on <html> before React hydrates, so that node is expected to
  // differ — without suppressHydrationWarning React logs it as a hydration failure on every load
  return (
    <html lang="en" data-field="boot" suppressHydrationWarning>
      <body>
        {/* the entrance styles only apply once scripting is confirmed running */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.dataset.js="on";' }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_HREF} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <SkipLink />
        <Experience>
          <FieldLayer />
          <TrimFrame />
          <ScrollProgress />
          <Intro />
          <SiteHead />
          <MenuSheet />
          <FolioRail />
          {children}
          <SiteFoot />
          <Cursor />
          <LiveRegion />
        </Experience>
      </body>
    </html>
  );
}
