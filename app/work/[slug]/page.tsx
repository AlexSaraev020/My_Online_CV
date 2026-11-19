import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CaseArticle from '@/components/CaseArticle';
import CaseStage from '@/components/CaseStage';
import { CASES, getCase, neighbours } from '@/lib/feed';

/* Every case page is a real page: built at build time, with its own address,
   its own title and its own description for search engines and link previews. */
export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return { title: 'Project not found' };
  return {
    title: `${c.title} — ${c.kind}`,
    description: (c.subtitle || c.description).slice(0, 200)
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();

  const nav = neighbours(c.id);
  if (!nav) notFound();

  return (
    <main id="main">
      <CaseStage index={nav.index} total={nav.total} prev={nav.prev.id} next={nav.next.id} />
      <CaseArticle c={c} />
    </main>
  );
}
