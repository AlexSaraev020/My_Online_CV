import type { FC, SVGProps } from 'react';
import type { PreviewKey } from '@/lib/curated';

/* ==========================================================================
   The four diagrams for the CV engagements. Each one is a picture of the
   *shape* of a build — a ticket panel and its app tiles, a conversation rail
   and a classified ticket, two phone screens and a bar chart, three platforms
   joined by a routed line — drawn in code, never photographed.

   A project that has a real screenshot uses it instead (see WorkCard).
   ========================================================================== */

function Diagram({ children, label }: { children: React.ReactNode; label: string }) {
  const props: SVGProps<SVGSVGElement> = {
    className: 'pv', viewBox: '0 0 640 400', role: 'img', 'aria-label': label
  };
  return <svg {...props}>{children}</svg>;
}

const Zaf: FC = () => (
  <Diagram label="Diagram: a ticket panel with lines of text on the left, and a three by three grid of custom application tiles on the right, two of them active.">
    <rect className="pv-plate" width="640" height="400" />
    <g className="pv-frame">
      <rect x="40" y="52" width="288" height="296" />
      <line x1="40" y1="92" x2="328" y2="92" />
      <line x1="40" y1="236" x2="328" y2="236" />
    </g>
    <g className="pv-head"><rect x="64" y="64" width="120" height="14" /></g>
    <g className="pv-lines">
      <line x1="64" y1="124" x2="292" y2="124" /><line x1="64" y1="146" x2="258" y2="146" />
      <line x1="64" y1="168" x2="284" y2="168" /><line x1="64" y1="190" x2="222" y2="190" />
      <line x1="64" y1="262" x2="268" y2="262" /><line x1="64" y1="284" x2="206" y2="284" />
      <line x1="64" y1="306" x2="280" y2="306" />
    </g>
    <g className="pv-grid">
      {[0, 1, 2].map((c) => [0, 1, 2].map((r) => (
        <rect key={`${c}-${r}`} x={376 + c * 80} y={60 + r * 82} width="64" height="64" />
      )))}
    </g>
    <g className="pv-hold">
      <rect x="376" y="60" width="64" height="64" />
      <rect x="456" y="224" width="64" height="64" />
    </g>
    <g className="pv-dot">
      <circle cx="552" cy="330" r="5" /><circle cx="576" cy="330" r="5" /><circle cx="600" cy="330" r="5" />
    </g>
    <line className="pv-rule" x1="376" y1="348" x2="600" y2="348" />
  </Diagram>
);

const Flint: FC = () => (
  <Diagram label="Diagram: a conversation rail with alternating message blocks, one generated response filled in mint, and a classified ticket below.">
    <rect className="pv-plate" width="640" height="400" />
    <g className="pv-frame">
      <rect x="40" y="48" width="252" height="304" />
      <line x1="40" y1="88" x2="292" y2="88" />
      <line x1="166" y1="48" x2="166" y2="352" />
    </g>
    <g className="pv-head"><rect x="60" y="60" width="84" height="12" /></g>
    <g className="pv-lines">
      <line x1="60" y1="120" x2="140" y2="120" /><line x1="60" y1="140" x2="118" y2="140" />
      <line x1="60" y1="220" x2="140" y2="220" /><line x1="60" y1="240" x2="126" y2="240" />
      <line x1="60" y1="260" x2="144" y2="260" />
    </g>
    <rect className="pv-soft" x="190" y="112" width="84" height="58" />
    <g className="pv-lines">
      <line x1="208" y1="134" x2="258" y2="134" /><line x1="208" y1="152" x2="240" y2="152" />
    </g>
    <rect className="pv-soft" x="190" y="300" width="124" height="36" />
    <g className="pv-frame">
      <rect x="332" y="72" width="268" height="150" />
      <line x1="332" y1="108" x2="600" y2="108" />
    </g>
    <g className="pv-lines">
      <line x1="356" y1="132" x2="560" y2="132" /><line x1="356" y1="154" x2="512" y2="154" />
      <line x1="356" y1="176" x2="548" y2="176" />
    </g>
    <g className="pv-frame">
      <rect x="332" y="248" width="268" height="104" />
      <line x1="332" y1="284" x2="600" y2="284" />
    </g>
    <g className="pv-hold"><rect x="356" y="300" width="140" height="28" /></g>
    <line className="pv-rule" x1="40" y1="372" x2="600" y2="372" />
  </Diagram>
);

const Mvphub: FC = () => (
  <Diagram label="Diagram: two tall mobile screen frames, one showing a list of applications with one row active, the other a form step, beside a short bar chart.">
    <rect className="pv-plate" width="640" height="400" />
    <g className="pv-frame pv-frame--accent">
      <rect x="48" y="40" width="176" height="320" />
      <line x1="48" y1="84" x2="224" y2="84" />
    </g>
    <g className="pv-head"><rect x="72" y="56" width="88" height="12" /></g>
    <g className="pv-grid">
      <rect x="72" y="108" width="128" height="44" /><rect x="72" y="164" width="128" height="44" />
      <rect x="72" y="220" width="128" height="44" /><rect x="72" y="276" width="128" height="44" />
    </g>
    <g className="pv-hold"><rect x="72" y="164" width="128" height="44" /></g>
    <g className="pv-frame">
      <rect x="256" y="40" width="176" height="320" />
      <line x1="256" y1="84" x2="432" y2="84" />
    </g>
    <g className="pv-head"><rect x="280" y="56" width="72" height="12" /></g>
    <rect className="pv-soft" x="280" y="112" width="128" height="56" />
    <g className="pv-grid">
      <rect x="280" y="188" width="128" height="40" /><rect x="280" y="240" width="128" height="40" />
    </g>
    <g className="pv-bars">
      <rect x="472" y="288" width="22" height="48" /><rect x="506" y="256" width="22" height="80" />
      <rect x="540" y="224" width="22" height="112" /><rect className="pv-hot" x="574" y="188" width="22" height="148" />
    </g>
    <g className="pv-dot">
      <circle cx="483" cy="160" r="5" /><circle cx="517" cy="140" r="5" />
      <circle cx="551" cy="124" r="5" /><circle cx="585" cy="104" r="5" />
    </g>
    <line className="pv-spark" x1="472" y1="160" x2="585" y2="104" />
    <line className="pv-rule" x1="472" y1="348" x2="596" y2="348" />
  </Diagram>
);

const Commerce: FC = () => (
  <Diagram label="Diagram: three platform boxes joined by a routed line, with a rule branch leaving the middle node.">
    <rect className="pv-plate" width="640" height="400" />
    <g className="pv-frame">
      <rect x="40" y="248" width="112" height="64" />
      <rect x="264" y="64" width="112" height="64" />
      <rect x="488" y="248" width="112" height="64" />
    </g>
    <g className="pv-head">
      <rect x="64" y="266" width="64" height="12" /><rect x="288" y="82" width="64" height="12" />
      <rect x="512" y="266" width="64" height="12" />
    </g>
    <g className="pv-lines">
      <line x1="64" y1="292" x2="128" y2="292" /><line x1="288" y1="108" x2="352" y2="108" />
      <line x1="512" y1="292" x2="576" y2="292" />
    </g>
    <g className="pv-wire">
      <path d="M152 280 L216 280 L216 96 L264 96" />
      <path d="M376 96 L440 96 L440 280 L488 280" />
      <path d="M216 188 L336 188" />
    </g>
    <g className="pv-dot">
      <circle cx="216" cy="280" r="5" /><circle cx="216" cy="96" r="5" />
      <circle cx="440" cy="96" r="5" /><circle className="pv-warm" cx="216" cy="188" r="5" />
    </g>
    <g className="pv-hold"><rect x="336" y="164" width="120" height="48" /></g>
    <line className="pv-rule" x1="40" y1="352" x2="600" y2="352" />
  </Diagram>
);

export const PREVIEWS: Record<PreviewKey, FC> = { zaf: Zaf, flint: Flint, mvphub: Mvphub, commerce: Commerce };
