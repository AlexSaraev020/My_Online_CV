'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

/* FieldCanvas is only ever loaded in a browser that can give us a WebGL
   context — no server render, no import of three.js into the shared bundle
   for someone whose device cannot use it. */
const FieldCanvas = dynamic(() => import('./FieldCanvas'), { ssr: false });

export default function FieldLayer() {
  const [prefs, setPrefs] = useState<{ small: boolean; reduce: boolean } | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    /* probe on a throwaway canvas: the first getContext() call on the real one
       would lock its context attributes and defeat alpha / antialias below */
    const probe = document.createElement('canvas');
    const ctx = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!ctx) {
      root.dataset.field = 'off';
      return;
    }
    const lose = ctx.getExtension?.('WEBGL_lose_context');
    if (lose) lose.loseContext();

    setPrefs({
      small: window.innerWidth < 768,
      reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    });
    root.dataset.field = 'on';
  }, []);

  return (
    <div className="field-layer" aria-hidden="true">
      {prefs ? <FieldCanvas small={prefs.small} reduce={prefs.reduce} /> : null}
      <div className="field-fallback" />
    </div>
  );
}
