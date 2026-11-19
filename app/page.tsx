import Approach from '@/components/plates/Approach';
import Capabilities from '@/components/plates/Capabilities';
import Contact from '@/components/plates/Contact';
import Cover from '@/components/plates/Cover';
import Cv from '@/components/plates/Cv';
import Process from '@/components/plates/Process';
import Work from '@/components/plates/Work';
import { CURATED_CASES } from '@/lib/feed';

export default function Home() {
  return (
    <main id="main">
      <Cover />
      <Approach />
      <Capabilities />
      <Work curated={CURATED_CASES} />
      <Process />
      <Cv />
      <Contact />
    </main>
  );
}
