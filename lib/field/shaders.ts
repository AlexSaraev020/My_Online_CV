/* ==========================================================================
   The GLSL, unchanged from the original build.

   Bars: one shader for ~780 instanced bars. The three formations (pA field,
   pB committed lines of code, pC delivered object) are mixed by scroll
   progress inside the vertex shader, so the re-formation is not an animation
   of objects but a function of one number. Depth of field, the section wipe,
   the cursor ripple and the project focus band are all in the same two shaders.

   Band: the sculptural ribbon — graphite base, iridescent fresnel banding,
   warm rim light, breathing along its own length.
   ========================================================================== */

export const BARS_VERT = /* glsl */ `
attribute float aIndex;
attribute float aSeed;
attribute float aTone;

uniform float uProgress;
uniform float uTime;
uniform float uCols;
uniform float uRows;
uniform float uAssemble;
uniform float uFocusA;
uniform float uFocusB;
uniform float uFocus;
uniform float uTakeover;
uniform vec3 uPointer;

varying vec3 vNormal;
varying vec3 vView;
varying float vTone;
varying float vSeed;
varying float vDist;
varying float vSide;
varying float vDof;
varying float vFocus;
varying float vAppear;

float hash1(float n) { return fract(sin(n * 127.1) * 43758.5453123); }
float hash2(float n) { return fract(sin(n * 269.5) * 18273.9174313); }
mat2 rot2(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }
float ease(float t) { return t * t * (3.0 - 2.0 * t); }

void main() {
  float i = aIndex;
  float total = uRows * uCols;
  float norm = (i + 0.5) / total;
  float r1 = hash1(i + 1.0);
  float r2 = hash2(i + 17.0);
  float r3 = hash1(i * 0.37 + 5.0);

  float tAB = ease(clamp(uProgress / 0.55, 0.0, 1.0));
  float tBC = ease(clamp((uProgress - 0.55) / 0.45, 0.0, 1.0));

  /* A — scattered signal field */
  vec3 pA = vec3((r1 * 2.0 - 1.0) * 24.0 + 7.0, (r2 * 2.0 - 1.0) * 12.0, (r3 * 2.0 - 1.0) * 11.0);
  float aA = (r2 * 2.0 - 1.0) * 1.1;
  float bA = (r3 * 2.0 - 1.0) * 0.5;
  float lA = mix(1.2, 7.0, r3);

  /* B — committed lines of code */
  float col = mod(i, uCols);
  float row = floor(i / uCols);
  float indent = floor(hash1(row * 3.1) * 3.0);
  vec3 pB = vec3((col + indent - uCols * 0.5) * 0.9,
                 (uRows * 0.5 - row) * 0.55,
                 sin(row * 0.4) * 0.9);
  float lB = mix(1.2, 7.0, hash2(row * 1.7 + col * 0.21));

  /* C — the delivered object */
  vec3 pC = vec3(sin(norm * 24.0) * 2.6 + (r1 * 2.0 - 1.0) * 1.4,
                 (norm * 2.0 - 1.0) * 15.0,
                 cos(norm * 18.0) * 2.6 + (r2 * 2.0 - 1.0) * 1.4);
  float aC = 1.5707963;
  float bC = norm * 1.4;
  float lC = mix(2.2, 5.4, r3);

  vec3 p = mix(pA, pB, tAB);
  p = mix(p, pC, tBC);
  float ang = mix(mix(aA, 0.0, tAB), aC, tBC);
  float yaw = mix(mix(bA, 0.0, tAB), bC, tBC);
  float len = mix(mix(lA, lB, tAB), lC, tBC);
  float thick = mix(0.035, 0.115, hash2(i * 0.11 + 3.0));

  /* depth of field without a post pass: far bars widen, flatten and dim */
  float dof = clamp(abs(p.z + 1.0) * 0.07, 0.0, 1.0);
  thick *= 1.0 + dof * 1.15;
  vDof = dof;

  /* opening assembly: bars arrive left to right, in index order */
  float appear = clamp((uAssemble - norm) * 9.0, 0.0, 1.0);
  appear = ease(appear);
  vAppear = appear;
  len *= mix(0.12, 1.0, appear);
  p.x = mix(-34.0, p.x, appear);

  /* cursor ripple: a local swell that fades with distance from the pointer */
  vec2 pu = uPointer.xy * vec2(22.0, 11.0);
  float d2 = dot(p.xy - pu, p.xy - pu);
  float ripple = exp(-d2 * 0.012) * uPointer.z;
  p.z += ripple * 2.2;
  p.y += ripple * 0.5;
  thick += ripple * 0.05;

  /* a hovered or open project keeps its own band of bars lit */
  vFocus = (i >= uFocusA && i < uFocusB) ? uFocus : 0.0;

  vec3 pos = position * vec3(len, thick, thick);
  pos.xy = rot2(ang) * pos.xy;
  pos.zy = rot2(yaw) * pos.zy;
  pos += p;
  float breathe = 1.0 - tBC * 0.7;
  pos.y += sin(uTime * 0.55 + r1 * 6.2831) * 0.14 * breathe;
  pos.x += cos(uTime * 0.40 + r2 * 6.2831) * 0.10 * breathe;

  vec3 nrm = normal;
  nrm.xy = rot2(ang) * nrm.xy;
  nrm.zy = rot2(yaw) * nrm.zy;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vNormal = normalize(normalMatrix * nrm);
  vView = mv.xyz;
  vDist = -mv.z;
  vSide = mv.x;
  vTone = aTone;
  vSeed = aSeed;
  gl_Position = projectionMatrix * mv;
}
`;

export const BARS_FRAG = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uMint;
uniform vec3 uSand;
uniform float uWipePos;
uniform float uWipeOn;
uniform float uTakeover;
uniform float uDim;

varying vec3 vNormal;
varying vec3 vView;
varying float vTone;
varying float vSeed;
varying float vDist;
varying float vSide;
varying float vDof;
varying float vFocus;
varying float vAppear;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vView);
  float fres = pow(1.0 - abs(dot(N, V)), 2.0);
  float lam = max(dot(N, normalize(vec3(0.35, 0.65, 0.67))), 0.0);

  fres *= 1.0 - vDof * 0.65;

  vec3 base = mix(uInk * 0.62, uInk * 1.32, lam);
  vec3 accent = mix(uMint, uSand, step(0.86, vSeed));
  float gain = (0.35 + 0.75 * vTone) + vFocus * 1.15;
  vec3 col = base + accent * fres * gain + accent * 0.05 * vTone;
  col = mix(col, uInk * 0.92, vDof * 0.42);

  /* non-focused bars recede while a project owns the field */
  col *= mix(1.0, 0.62, uTakeover * (1.0 - vFocus));

  /* section-change wipe: a light band travelling across the field */
  float band = exp(-pow((vSide - uWipePos) * 0.28, 2.0)) * uWipeOn;
  col += uMint * band * 0.55;

  /* depth fade in-shader: atmosphere without a post-processing pass */
  float fog = 1.0 - exp(-pow(max(vDist - 13.0, 0.0) * 0.055, 2.0));
  float side = mix(0.30, 1.0, smoothstep(-17.0, -3.0, vSide));
  float alpha = (0.55 + 0.35 * lam + 0.6 * fres) * (1.0 - fog) * side;
  alpha *= 1.0 - vDof * 0.30;
  alpha += band * 0.22 + vFocus * 0.16;
  alpha *= vAppear;
  /* the field steps back while you are reading, and comes forward again */
  alpha *= uDim;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.96));
}
`;

export const BAND_VERT = /* glsl */ `
uniform float uTime;
uniform float uProgress;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec3 pos = position;
  /* controlled motion: the band breathes along its own length */
  float wob = sin(uv.x * 19.0 + uTime * 0.7) * 0.05 + sin(uv.x * 7.0 - uTime * 0.4) * 0.035;
  pos *= 1.0 + wob;
  float a = uv.x * 6.28318 * 2.0 + uTime * 0.18 + uProgress * 2.2;
  float s = sin(a), c = cos(a);
  mat2 r = mat2(c, -s, s, c);
  pos.xz = mix(pos.xz, r * pos.xz, 0.42);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const BAND_FRAG = /* glsl */ `
uniform vec3 uMint;
uniform vec3 uSand;
uniform vec3 uCyan;
uniform vec3 uGraphite;
uniform float uTime;
uniform float uDim;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vView);
  float fres = pow(1.0 - abs(dot(N, V)), 2.4);
  float key = max(dot(N, normalize(vec3(0.42, 0.72, 0.55))), 0.0);
  float rim = max(dot(N, normalize(vec3(-0.65, -0.15, 0.45))), 0.0);
  vec3 band = mix(uMint, uCyan, 0.5 + 0.5 * sin(N.x * 5.0 + N.y * 3.0 + uTime * 0.25));
  vec3 col = mix(uGraphite * 0.6, uGraphite * 2.1, key);
  col += band * fres * 1.2;
  col += uSand * pow(rim, 4.0) * 0.2;
  /* the band steps back with the field while copy is on screen */
  col *= mix(0.42, 1.0, uDim);
  gl_FragColor = vec4(col, 1.0);
}
`;
