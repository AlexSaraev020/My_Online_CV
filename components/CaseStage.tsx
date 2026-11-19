'use client';


import { useEffect } from 'react';
import { clearProjectFocus, fieldApi, focusProject } from '@/lib/field/state';

/* The field hands itself over to the project you are reading: its own band of
   bars stays lit, the rest recede, the camera pulls in. Arrow keys walk the
   portfolio the way the old sheet did — never while a form field is focused. */
export default function CaseStage({ index, total, prev, next }: { index: number; total: number; prev: string; next: string }) {
  

  useEffect(() => {
    fieldApi.setTakeover(true);
    focusProject(index, total);

    const onKey = (ev: KeyboardEvent) => {
      const el = ev.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); window.location.assign(`/work/${next}`); }
      else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); window.location.assign(`/work/${prev}`); }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      fieldApi.setTakeover(false);
      clearProjectFocus();
    };
  }, [index, total, prev, next]);

  return null;
}
