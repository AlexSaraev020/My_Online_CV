'use client';

/* ==========================================================================
   The signal field, as a React Three Fiber scene.

   Same object as the original build: ~780 instanced bars on one custom shader
   that re-form through the journey, the dust that gives it atmosphere, and the
   sculptural metal band. The scroll value arrives through lib/field/state, so
   a frame costs no React render.
   ========================================================================== */

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BAND_FRAG, BAND_VERT, BARS_FRAG, BARS_VERT } from '@/lib/field/shaders';
import { fieldApi, resetFieldApi, targets } from '@/lib/field/state';

const COLORS = { ink: '#2f3e4c', mint: '#42e3a8', sand: '#f0a97a', cyan: '#63dbe8', graphite: '#243040' };

type Uniforms = { [name: string]: THREE.IUniform };

/* a real THREE.Curve so TubeGeometry can compute its frames */
class TrefoilCurve extends THREE.Curve<THREE.Vector3> {
  constructor() { super(); }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const a = t * Math.PI * 2;
    return target.set(
      (Math.sin(a) + 2 * Math.sin(2 * a)) * 0.34,
      (Math.cos(a) - 2 * Math.cos(2 * a)) * 0.34,
      -Math.sin(3 * a) * 0.42
    );
  }
}

interface Layout { small: boolean; cols: number; rows: number; count: number }

function Scene({ layout, reduce }: { layout: Layout; reduce: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const bandRef = useRef<THREE.Mesh>(null);
  const dustRef = useRef<THREE.Points>(null);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);

  const uniforms = useMemo<Uniforms>(() => ({
    uProgress: { value: reduce ? 0.06 : 0 },
    uTime: { value: 0 },
    uCols: { value: layout.cols },
    uRows: { value: layout.rows },
    uAssemble: { value: reduce ? 1 : 0 },
    uFocusA: { value: 0 },
    uFocusB: { value: 0 },
    uFocus: { value: 0 },
    uTakeover: { value: 0 },
    uPointer: { value: new THREE.Vector3(0, 0, 0) },
    uWipePos: { value: -30 },
    uWipeOn: { value: 0 },
    uDim: { value: 1 },
    uInk: { value: new THREE.Color(COLORS.ink) },
    uMint: { value: new THREE.Color(COLORS.mint) },
    uSand: { value: new THREE.Color(COLORS.sand) },
    uCyan: { value: new THREE.Color(COLORS.cyan) },
    uGraphite: { value: new THREE.Color(COLORS.graphite) }
  }), [layout, reduce]);

  /* bars: one instanced box, one shader, per-instance index / seed / tone */
  const barsGeo = useMemo(() => {
    const base = new THREE.BoxGeometry(1, 1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position as THREE.BufferAttribute);
    geo.setAttribute('normal', base.attributes.normal as THREE.BufferAttribute);
    geo.instanceCount = layout.count;

    const idx = new Float32Array(layout.count);
    const seed = new Float32Array(layout.count);
    const tone = new Float32Array(layout.count);
    for (let i = 0; i < layout.count; i++) {
      idx[i] = i;
      seed[i] = Math.random();
      const roll = Math.random();
      tone[i] = roll < 0.14 ? 1 : roll < 0.42 ? 0.45 : 0.08;
    }
    geo.setAttribute('aIndex', new THREE.InstancedBufferAttribute(idx, 1));
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1));
    geo.setAttribute('aTone', new THREE.InstancedBufferAttribute(tone, 1));
    return geo;
  }, [layout.count]);

  const barsMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms, vertexShader: BARS_VERT, fragmentShader: BARS_FRAG, transparent: true, depthWrite: false
  }), [uniforms]);

  const dustGeo = useMemo(() => {
    const n = layout.small ? 110 : 240;
    const pos = new Float32Array(n * 3);
    for (let j = 0; j < n; j++) {
      pos[j * 3] = (Math.random() * 2 - 1) * 30;
      pos[j * 3 + 1] = (Math.random() * 2 - 1) * 15;
      pos[j * 3 + 2] = (Math.random() * 2 - 1) * 14;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [layout.small]);

  const dustMat = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color(COLORS.mint),
    size: layout.small ? 0.11 : 0.08,
    transparent: true, opacity: 0.4, sizeAttenuation: true, depthWrite: false
  }), [layout.small]);

  const bandGeo = useMemo(() => new THREE.TubeGeometry(
    new TrefoilCurve(),
    layout.small ? 140 : 260,
    layout.small ? 0.13 : 0.17,
    layout.small ? 10 : 16,
    true
  ), [layout.small]);

  const bandMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms, vertexShader: BAND_VERT, fragmentShader: BAND_FRAG
  }), [uniforms]);

  const bandStart: [number, number, number] = layout.small ? [1.8, -4.2, -4.0] : [11.0, 1.8, -4.5];

  /* the eased values live here, not in React state */
  const k = useRef({
    prog: reduce ? 0.06 : 0, px: 0, py: 0, focus: 0, take: 0,
    ripple: 0, dim: 1, assemble: reduce ? 1 : 0, wipeClock: -1
  });

  useEffect(() => {
    fieldApi.ready = true;
    fieldApi.count = layout.count;
    fieldApi.setProgress = (p) => { targets.progress = p; };
    fieldApi.setPointer = (x, y) => { targets.pointerX = x; targets.pointerY = y; targets.pulse = Math.min(1, targets.pulse + 0.09); };
    fieldApi.setFocus = (a, b) => { targets.focusA = a; targets.focusB = b; };
    fieldApi.setTakeover = (on) => { targets.takeover = on ? 1 : 0; };
    fieldApi.setDim = (v) => { targets.dim = v; };
    fieldApi.wipe = () => { targets.wipeRequested = true; };
    fieldApi.bandFor = (slice) => [Math.round(slice[0] * layout.count), Math.round(slice[1] * layout.count)];

    return () => { resetFieldApi(); };
  }, [layout.count]);

  /* reduced motion: one composed still frame, no loop */
  useEffect(() => {
    if (!reduce) return;
    pose(0.06, 0, 0);
    invalidate();
  }, [reduce, invalidate]);

  function pose(p: number, time: number, take: number) {
    camera.position.z = 27 - 9 * p + 5 * p * p - take * 3.2;
    camera.position.y = -1.2 + 2.6 * p;
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y = -0.30 + 0.34 * p;
    g.rotation.x = 0.12 - 0.16 * p;
    g.rotation.z = -0.04 + 0.06 * p + Math.sin(time * 0.09) * 0.015;
  }

  useFrame((state) => {
    if (document.hidden) return;
    const s = k.current;
    const t = state.clock.elapsedTime;

    s.prog += (targets.progress - s.prog) * 0.06;
    s.px += (targets.pointerX - s.px) * 0.05;
    s.py += (targets.pointerY - s.py) * 0.05;
    s.focus += ((targets.focusB > targets.focusA ? 1 : 0) - s.focus) * 0.09;
    s.take += (targets.takeover - s.take) * 0.05;
    s.assemble += (1 - s.assemble) * 0.022;
    s.dim += (targets.dim - s.dim) * 0.045;

    uniforms.uTime.value = t;
    uniforms.uProgress.value = s.prog;
    uniforms.uAssemble.value = s.assemble;
    uniforms.uFocus.value = s.focus;
    uniforms.uFocusA.value = targets.focusA;
    uniforms.uFocusB.value = targets.focusB;
    uniforms.uTakeover.value = s.take;
    uniforms.uDim.value = s.dim;
    (uniforms.uPointer.value as THREE.Vector3).set(s.px, s.py, s.ripple);
    s.ripple *= 0.93;

    if (targets.wipeRequested && s.wipeClock < 0) { s.wipeClock = 0; targets.wipeRequested = false; }
    if (s.wipeClock >= 0) {
      s.wipeClock += 0.022;
      if (s.wipeClock >= 1) { s.wipeClock = -1; uniforms.uWipeOn.value = 0; }
      else {
        uniforms.uWipePos.value = -30 + s.wipeClock * 60;
        uniforms.uWipeOn.value = Math.sin(s.wipeClock * Math.PI);
      }
    }

    const dust = dustRef.current;
    if (dust) (dust.material as THREE.PointsMaterial).opacity = 0.18 + 0.22 * s.assemble;

    /* the band travels the journey: cover sculpture at the start, a diagonal
       element through the plates, settling behind the closing plate */
    const band = bandRef.current;
    if (band) {
      band.rotation.y = 0.2 + s.prog * 1.15 + s.px * 0.26;
      band.rotation.x = 0.5 - s.prog * 0.42 - s.py * 0.16;
      band.position.x = bandStart[0] - s.prog * (layout.small ? 2.6 : 18.0);
      band.position.y = bandStart[1] + s.prog * (layout.small ? 2.2 : 2.8);
      band.position.z = bandStart[2] + s.prog * (layout.small ? 6.0 : 8.5);
    }

    camera.position.x = s.px * 1.6;
    const g = groupRef.current;
    if (g) {
      g.rotation.y = -0.30 + 0.34 * s.prog + s.px * 0.16;
      g.rotation.x = 0.12 - 0.16 * s.prog - s.py * 0.09;
      g.rotation.z = -0.04 + 0.06 * s.prog + Math.sin(t * 0.09) * 0.015;
    }
    camera.position.z = 27 - 9 * s.prog + 5 * s.prog * s.prog - s.take * 3.2;
    camera.position.y = -1.2 + 2.6 * s.prog;
  });

  useEffect(() => () => {
    barsGeo.dispose();
    barsMat.dispose();
    dustGeo.dispose();
    dustMat.dispose();
    bandGeo.dispose();
    bandMat.dispose();
  }, [barsGeo, barsMat, dustGeo, dustMat, bandGeo, bandMat]);

  return (
    <group ref={groupRef}>
      <mesh geometry={barsGeo} material={barsMat} frustumCulled={false} />
      <points ref={dustRef} geometry={dustGeo} material={dustMat} frustumCulled={false} />
      <mesh
        ref={bandRef}
        geometry={bandGeo}
        material={bandMat}
        scale={layout.small ? [4.6, 4.6, 1.6] : [7.0, 7.0, 2.2]}
        position={bandStart}
        rotation={[0.5, 0.2, 0.18]}
      />
    </group>
  );
}

export default function FieldCanvas({ small, reduce }: { small: boolean; reduce: boolean }) {
  const layout = useMemo<Layout>(() => {
    const cols = small ? 18 : 30;
    const rows = small ? 14 : 26;
    return { small, cols, rows, count: cols * rows };
  }, [small]);

  return (
    <Canvas
      className="field-canvas"
      style={{ position: 'absolute', inset: 0 }}
      frameloop={reduce ? 'demand' : 'always'}
      dpr={[1, small ? 1.5 : 1.75]}
      camera={{ fov: 42, near: 0.1, far: 200, position: [0, -1.2, 27] }}
      gl={{ antialias: !small, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Scene layout={layout} reduce={reduce} />
    </Canvas>
  );
}
