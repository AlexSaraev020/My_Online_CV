import type { CSSProperties } from 'react';
import type { CaseImage } from '@/lib/feed';
import { asset } from '@/lib/site';

/* A local screenshot, sized from the pixel dimensions measured off the file
   when the feed was generated — never a guessed box, and never hotlinked. */
export default function Shot({ img }: { img: CaseImage }) {
  const style = img.w && img.h ? ({ aspectRatio: `${img.w} / ${img.h}` } as CSSProperties) : undefined;
  return (
    <img
      className="od-media pv-shot"
      src={asset(img.src)}
      alt={img.alt}
      width={img.w ?? undefined}
      height={img.h ?? undefined}
      style={style}
      loading="lazy"
      decoding="async"
    />
  );
}
