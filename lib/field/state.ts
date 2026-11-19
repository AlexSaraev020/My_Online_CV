/* ==========================================================================
   The one place the DOM layer and the WebGL layer meet.

   The scroll director writes these targets; the field reads them inside its
   render loop and eases toward them. Nothing is passed through React state,
   because a value that changes every frame must not re-render a tree.
   ========================================================================== */

export interface FieldTargets {
  progress: number;
  pointerX: number;
  pointerY: number;
  pulse: number;
  focusA: number;
  focusB: number;
  takeover: number;
  dim: number;
  wipeRequested: boolean;
}

export const targets: FieldTargets = {
  progress: 0,
  pointerX: 0,
  pointerY: 0,
  pulse: 0,
  focusA: 0,
  focusB: 0,
  takeover: 0,
  dim: 1,
  wipeRequested: false
};

const noop = (): void => {};

export interface FieldApi {
  ready: boolean;
  count: number;
  setProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  setFocus: (a: number, b: number) => void;
  setTakeover: (on: boolean) => void;
  setDim: (v: number) => void;
  wipe: () => void;
  bandFor: (slice: [number, number]) => [number, number];
}

export const fieldApi: FieldApi = {
  ready: false,
  count: 0,
  setProgress: noop,
  setPointer: noop,
  setFocus: noop,
  setTakeover: noop,
  setDim: noop,
  wipe: noop,
  bandFor: (slice) => slice
};

export function resetFieldApi(): void {
  fieldApi.ready = false;
  fieldApi.count = 0;
  fieldApi.setProgress = noop;
  fieldApi.setPointer = noop;
  fieldApi.setFocus = noop;
  fieldApi.setTakeover = noop;
  fieldApi.setDim = noop;
  fieldApi.wipe = noop;
  fieldApi.bandFor = (slice) => slice;
}

/* a project's own band of bars, from its position in the plate list */
export function focusProject(index: number, total: number): void {
  if (!fieldApi.ready || !total || index < 0) return;
  const [a, b] = fieldApi.bandFor([index / total, (index + 1) / total]);
  fieldApi.setFocus(a, b);
}

export function clearProjectFocus(): void {
  if (fieldApi.ready) fieldApi.setFocus(0, 0);
}
