import { Fragment, type ElementType } from 'react';

/* ==========================================================================
   A title set word by word so each one can rise out of a mask. The reveal
   class itself is added by the director when the plate arrives.
   ========================================================================== */

interface WordsProps {
  text: string;
  /** ms before the first word starts, then 70ms per word */
  base?: number;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3';
  id?: string;
}

export default function Words({ text, base = 60, className, tag = 'h2', id }: WordsProps) {
  const Tag = tag as ElementType;
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag data-words className={className} id={id}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="w">
            <span style={{ transitionDelay: `${base + i * 70}ms` }}>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
