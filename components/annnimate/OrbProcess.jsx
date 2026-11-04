'use client';

import { forwardRef, useId, useImperativeHandle, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import './orb-process.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);
  CustomEase.create('annnimate', 'M0,0 C0.3,0.9 0.1,1 1,1');
  CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1');
}

import { elevatorProcess } from '@/lib/elevator-process';

const DEFAULT_TITLE = elevatorProcess.title;
const DEFAULT_INTRO = elevatorProcess.intro;
const DEFAULT_STEPS = elevatorProcess.steps;

// labels sit this far (px) outside the ring, always upright
const LABEL_GAP = 14;
// the ring rests this long (in steps) before the first turn and after the
// last, so the first and last step sit at 12 o'clock at the track's ends
const HOLD = 0.35;
const SCRUB = 0.8;
// the ring turns evenly with the scroll; snap mode is what settles it on a step
const RING_EASE = 'none';
// inactive step names stay readable: 0.92 ink x 0.45
const DIM = 0.65;
const HIGHLIGHT_DUR = 0.5;
const TEXT_OUT_DUR = 0.3;
const TEXT_IN_DUR = 0.6;
const TEXT_SHIFT = 10;
const ROLL_DUR = 0.6;
// snap mode: the ring glides to the nearest step instead of following the scroll
const SNAP_DUR = 0.7;
const SNAP_EASE = 'annnimateInOut';
// a ripple's spread is damped: it leaves the impact fast and slows as it
// loses energy, travel = (1 - e^(-k t)) normalised. A step change is the
// same ripple from the centre, carrying the step's colour inside its ring
const RIPPLE_DAMP = 3;
// the painting every step frames a region of: one continuous field mapped
// through the ramp, so the colour is always a blend of shades, never a blot
const PAINT_SIZE = 256;
// big shapes per painting width, noise octaves, and how far a second field
// bends the first into flowing bands
const PAINT_PERIOD = 3;
const PAINT_OCTAVES = 4;
const PAINT_FLOW = 0.3;
// field values onto the ramp: below LO is the deepest colour, above HI the lightest
const PAINT_LO = 0.2;
const PAINT_HI = 0.56;
// the darkest spots that steps frame, and how far apart they sit (in painting widths)
const POOL_COUNT = 6;
const POOL_GAP = 0.22;
// noise-time units per second at drift 1: the colour drifts, it never stops
const DRIFT = 0.12;
// a framing's centre sits this far (in painting widths) off its pool, so
// the colour core lands off-centre in the orb
const CORE_JITTER = 0.1;
// Scrolling rolls the ball through its painting: each step moves this far
// across it (painting widths), so the colours slide up with the page,
// and lands on the deep spot nearest to where the roll would end
const ROLL_STEP = [0.06, -0.32];
const POOL_REACH = 0.25;
// how hard rolling stirs the paint (per step per second), and how fast
// the stir rises and settles (seconds)
const STIR_GAIN = 0.9;
const STIR_RISE = 0.12;
const STIR_SETTLE = 0.7;
// click ripples at once
const RIPPLE_SLOTS = 3;
// a click ring runs this far (in orb radii) over this many seconds
const RIPPLE_REACH = 1.6;
const RIPPLE_LIFE = 1.6;
// radians the CSS fallback's clouds turn per step
const TURN_STEP = 0.9;
// seconds between ambient-only frames (~30fps); a step change renders every frame
const AMBIENT_GAP = 0.03;
// the orb is soft, a denser buffer buys nothing
const DPR_CAP = 1.5;
// the glyphs on each counter reel
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// 3D simplex noise: Ashima Arts / Stefan Gustavson, MIT (github.com/stegu/webgl-noise)
const NOISE_GLSL = `
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }
    `;

const ORB_VERT = `
      attribute vec2 aPos;
      varying vec2 vUv;
      void main() {
        vUv = aPos * 0.5 + 0.5;
        gl_Position = vec4(aPos, 0.0, 1.0);
      }
    `;

// One quad, no mesh and no lights: a lens on the UVs makes the ball, a
// warped noise field streaks the painting, and steps are framings of it.
const ORB_FRAG = `
      precision highp float;
      uniform sampler2D uPaint;
      uniform float uTime;
      uniform float uPx;
      // where the ball has rolled to in its painting: x zoom, y turn, zw offset
      uniform vec4 uFrame;
      // how much rolling is stirring the paint right now, 0 when still
      uniform float uStir;
      uniform float uWarp;
      uniform float uBulge;
      uniform float uGrain;
      uniform float uShade;
      uniform float uSoft;
      // xy origin (orb space, -1..1), z age in seconds, w strength (0 = idle)
      uniform vec4 uRip[${RIPPLE_SLOTS}];
      // the seconds a click ring takes to run its course
      uniform float uRipTime;
      // the colour that always sits on the orb's edge, and how much
      uniform vec3 uRimColor;
      uniform float uRim;
      varying vec2 vUv;
      ${NOISE_GLSL}
      const float SPHERE_SCALE = 1.5;
      const float SPHERE_POWER = 1.1;
      const float WARP_SCALE = 1.1;
      const float WARP_PUSH = 0.12;
      const float WARP_STREAK = 0.07;
      const float WOBBLE = 0.05;
      // the ripple ring: width in orb radii, the push it gives the image and
      // the light it carries
      const float RIPPLE_WIDTH = 0.12;
      const float RIPPLE_PUSH = 0.03;
      const float RIPPLE_GLOW = 0.05;
      // a lit inner edge and a shaded outer edge, so the ring reads on white too
      const float RIPPLE_SHADE = 0.06;
      // a click ring starts hard, then loses its energy
      const float RIPPLE_KICK = 2.4;
      // stirring: the warp swells and the paint twists toward the middle
      const float STIR_WARP = 1.2;
      const float STIR_TWIST = 0.7;
      const float RIPPLE_REACH = ${RIPPLE_REACH.toFixed(2)};
      const float RIPPLE_DAMP = ${RIPPLE_DAMP.toFixed(2)};
      // how far in from the edge the rim colour reaches, in orb radii
      const float RIM_WIDTH = 0.65;
      // cool shade on the side away from the light, light from the top right
      const vec3 SHADE_TINT = vec3(0.8, 0.83, 0.92);
      const vec2 LIGHT = vec2(0.57, 0.82);
      float hash2(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      float fbm(vec3 p) {
        float sum = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 3; i++) {
          sum += amp * snoise(p);
          p = p * 2.03 + 11.7;
          amp *= 0.5;
        }
        return sum;
      }
      // the ball's current view of the painting
      vec3 frame(vec4 fr, vec2 uv) {
        vec2 p = (uv - 0.5) / fr.x;
        float c = cos(fr.y);
        float s = sin(fr.y);
        p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
        return texture2D(uPaint, p + 0.5 + fr.zw).rgb;
      }
      // a click ring's damped spread
      float travel(float age) {
        float a = clamp(age / uRipTime, 0.0, 1.0);
        return (1.0 - exp(-RIPPLE_DAMP * a)) / (1.0 - exp(-RIPPLE_DAMP)) * RIPPLE_REACH;
      }
      // A ring is measured over the ball's surface, not across the flat disc,
      // so it slows and thins on screen as it rounds toward the rim, the way
      // the painting is squeezed there: geodesic distance between two points
      float across(vec2 a, vec2 b) {
        vec3 pa = vec3(a, sqrt(max(1.0 - dot(a, a), 0.0)));
        vec3 pb = vec3(b, sqrt(max(1.0 - dot(b, b), 0.0)));
        float arc = acos(clamp(dot(pa, pb), -1.0, 1.0)) / 1.5707963;
        return mix(length(a - b), arc, clamp(uBulge, 0.0, 1.0));
      }
      vec3 overlay(vec3 a, vec3 b) {
        return mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, a));
      }
      void main() {
        vec2 rim = (vUv - 0.5) * 2.0;
        float dist = length(rim);
        // sphere lens: magnified in the middle, squeezed toward the edge
        float depth = pow(sqrt(1.0 - clamp(dist * dist, 0.0, 1.0)), SPHERE_POWER);
        depth = max(mix(1.0, depth, uBulge), 0.05);
        vec2 uv = rim / ((depth + 1.0) * SPHERE_SCALE) * 0.5 + 0.5;
        // ripples: one ring runs outward from where it started and bends the
        // image as it passes
        float glow = 0.0;
        float slope = 0.0;
        for (int i = 0; i < ${RIPPLE_SLOTS}; i++) {
          vec4 rp = uRip[i];
          if (rp.w <= 0.0) continue;
          vec2 d = rim - rp.xy;
          float rd = max(across(rim, rp.xy), 0.001);
          // damped spread: fast from the impact, slowing as it loses energy
          float a = clamp(rp.z / uRipTime, 0.0, 1.0);
          float radius = travel(rp.z);
          // the ring broadens as it travels; its height drops with time and with
          // the circle it has to fill, and it is never drawn as a point
          float width = RIPPLE_WIDTH * (1.0 + radius * 0.6);
          float fade = rp.w * RIPPLE_KICK * exp(-2.0 * a) / sqrt(1.0 + radius)
            * (1.0 - smoothstep(0.85, 1.0, a)) * smoothstep(0.0, 0.15, rd);
          float band = (rd - radius) / width;
          // one wave: pushed out ahead of the ring, pulled in behind it
          float wave = band * exp(-band * band);
          uv += d / max(length(d), 0.001) * wave * RIPPLE_PUSH * fade;
          glow += max(wave, 0.0) * fade;
          slope += wave * fade;
        }
        // domain-warped noise: the field bends the colour into soft streaks and
        // pushes it along the sphere's normals
        float t = uTime;
        // rolling stirs the paint: it twists toward the middle while it moves
        float twist = uStir * STIR_TWIST * (1.0 - dist * dist);
        vec2 tc = uv - 0.5;
        uv = vec2(cos(twist) * tc.x - sin(twist) * tc.y, sin(twist) * tc.x + cos(twist) * tc.y) + 0.5;
        float stir = 1.0 + uStir * STIR_WARP;
        vec2 w = uv * WARP_SCALE;
        vec2 q = vec2(fbm(vec3(w, t * 0.4)), fbm(vec3(w + vec2(5.2, 1.3), t * 0.4)));
        vec2 r = vec2(fbm(vec3(w + 1.6 * q + vec2(1.7, 9.2), t)), fbm(vec3(w + 1.6 * q + vec2(8.3, 2.8), t * 0.9)));
        float f = fbm(vec3(w + 1.6 * r, t * 0.5));
        uv += (rim * f * WARP_PUSH + r * WARP_STREAK) * uWarp * stir;
        uv += vec2(snoise(vec3(vUv * 0.7, t * 0.6)), snoise(vec3(vUv * 0.7 + 54.0, t * 0.6))) * WOBBLE * uWarp * stir;
        vec3 col = frame(uFrame, uv);
        col = clamp(col * 1.06, 0.0, 1.0);
        col = mix(col, vec3(1.0), clamp(glow * RIPPLE_GLOW, 0.0, 1.0));
        col *= 1.0 - clamp(slope, -1.0, 1.0) * RIPPLE_SHADE;
        // a cool shade on the far side gives the ball its volume
        float facing = dot(rim, LIGHT);
        float shade = smoothstep(0.35, 1.05, dist) * (0.5 - 0.5 * facing);
        col = mix(col, col * SHADE_TINT, shade * uShade);
        // the edge always carries colour, so the silhouette reads as a clean circle
        float rimMix = smoothstep(1.0 - RIM_WIDTH, 1.0, dist);
        col = mix(col, uRimColor, rimMix * rimMix * uRim);
        // fine grain that holds still while the colour moves under it
        float g = hash2(floor(gl_FragCoord.xy));
        col = mix(col, overlay(col, vec3(0.5 + (g - 0.5) * 0.28)), uGrain);
        float soft = max(uPx * 2.0, uSoft * 0.18);
        float alpha = 1.0 - smoothstep(1.0 - soft, 1.0 + uPx, dist);
        gl_FragColor = vec4(col * alpha, alpha);
      }
    `;

function pad2(v) {
  return String(v).padStart(2, '0');
}

function hexToRgb(hex) {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function smooth01(lo, hi, x) {
  const t = Math.min(Math.max((x - lo) / (hi - lo), 0), 1);
  return t * t * (3 - 2 * t);
}

// Value noise on a wrapping lattice, so the painting tiles without a seam.
function lattice(rand, period) {
  const cells = new Float32Array(period * period);
  for (let k = 0; k < cells.length; k++) cells[k] = rand();
  return function (x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const x0 = ((xi % period) + period) % period;
    const y0 = ((yi % period) + period) % period;
    const x1 = (x0 + 1) % period;
    const y1 = (y0 + 1) % period;
    const a = cells[y0 * period + x0];
    const b = cells[y0 * period + x1];
    const c = cells[y1 * period + x0];
    const d = cells[y1 * period + x1];
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

// fbm over the painting's 0..1 space, each octave on its own wrapping lattice
function field(rand) {
  const octaves = [];
  for (let o = 0; o < PAINT_OCTAVES; o++) octaves.push(lattice(rand, PAINT_PERIOD << o));
  return function (u, v) {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    for (let o = 0; o < PAINT_OCTAVES; o++) {
      const p = PAINT_PERIOD << o;
      sum += amp * octaves[o](u * p, v * p);
      norm += amp;
      amp *= 0.5;
    }
    return sum / norm;
  };
}

function wrapGap(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 1 - d);
}

function seeded(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function wrapDelta(x) {
  return x - Math.round(x);
}

function compile(ctx, type, source) {
  const sh = ctx.createShader(type);
  ctx.shaderSource(sh, source);
  ctx.compileShader(sh);
  return ctx.getShaderParameter(sh, ctx.COMPILE_STATUS) ? sh : null;
}

/**
 * OrbProcess
 *
 * A how-we-work section: the headline, an intro and the active step on the
 * left, a living orb inside a ring of step names on the right. As the page
 * scrolls, the ring turns each step to the top, a hairline trail fills behind
 * it and the orb rolls like a glass ball of paint to that step's colours.
 * Click a step's name to jump to it, or click the orb to send a ripple
 * through it. Without WebGL the CSS orb shows instead. Reduced motion jumps
 * the ring from step to step and holds the orb still.
 *
 * Config props are read when the section builds; changing one tears the build
 * down and runs it again. The section is the track the sticky stage rides in,
 * so never give it overflow hidden.
 *
 * @param {string} [className=''] - Additional CSS classes for the root section
 * @param {Array} [steps=DEFAULT_STEPS] - The steps: {num, name, meta, desc}. num
 *   defaults to 01, 02, ...; meta is optional. 4 to 6 steps read best
 * @param {string} [title=DEFAULT_TITLE] - Section headline
 * @param {string} [intro=DEFAULT_INTRO] - The paragraph under the headline
 * @param {number} [stepHeight=80] - Scroll per step, in vh (40-160)
 * @param {boolean} [snap=false] - Snap the ring from step to step instead of turning it with the scroll
 * @param {number} [inertia=0.35] - How long the ball takes to catch up with the scroll, in seconds (0.05-1.2)
 * @param {number} [stir=1] - How much the paint swirls while the ball rolls (0-2). 0 rolls it without stirring
 * @param {string} [colorDeep='#142a9c'] - The deepest shade, at the core of each step
 * @param {string} [colorPrimary='#1a44ff'] - The main colour
 * @param {string} [colorMid='#3f7cff'] - The middle shade
 * @param {string} [colorAccent='#8a94ff'] - A second hue between the mid and the light shade
 * @param {string} [colorLight='#c9d8ff'] - The light shade
 * @param {string} [colorHighlight='#f7f9ff'] - The lightest shade
 * @param {string} [rimColor=''] - The colour on the orb's edge. Empty follows colorPrimary
 * @param {number} [rim=0.3] - How strongly the edge colour rings the orb (0-1)
 * @param {number} [clickRipple=1] - How strongly a click sends a ripple through the orb (0-2). 0 turns clicks off
 * @param {number} [seed=7] - Which arrangement of the palette the orb paints (1-99)
 * @param {number} [drift=1] - How fast the colours drift on their own (0-3). 0 holds the painting still between steps
 * @param {number} [warp=0.8] - How much the colour is pulled into streaks (0-2)
 * @param {number} [bulge=1] - How round the orb looks (0-1.5). 0 is a flat disc
 * @param {number} [shading=0.5] - How much cool shade sits on the side away from the light (0-1)
 * @param {number} [grain=0.35] - How much fine grain sits on the orb (0-1)
 * @param {number} [softness=0.3] - How soft the orb's outline is (0-1)
 */
const OrbProcess = forwardRef(function OrbProcess({
  className = '',
  steps = DEFAULT_STEPS,
  title = DEFAULT_TITLE,
  intro = DEFAULT_INTRO,
  stepHeight = 80,
  snap = false,
  inertia = 0.35,
  stir = 1,
  colorDeep = '#142a9c',
  colorPrimary = '#1a44ff',
  colorMid = '#3f7cff',
  colorAccent = '#8a94ff',
  colorLight = '#c9d8ff',
  colorHighlight = '#f7f9ff',
  rimColor = '',
  rim = 0.3,
  clickRipple = 1,
  seed = 7,
  drift = 1,
  warp = 0.8,
  bulge = 1,
  shading = 0.5,
  grain = 0.35,
  softness = 0.3,
}, ref) {
  const containerRef = useRef(null);
  const ringRef = useRef(null);
  const labelHostRef = useRef(null);
  const trailRef = useRef(null);
  const orbRef = useRef(null);
  const stepRefs = useRef([]);
  const itemLabelRefs = useRef([]);
  const ringLabelRefs = useRef([]);
  const textItemRefs = useRef([]);
  const reelRefs = useRef([]);
  const apiRef = useRef(null);
  const titleId = useId();

  // a step without a number takes its place in the list, as in the vanilla
  const stepList = steps.map((s, i) => ({
    num: s.num || pad2(i + 1),
    name: s.name || '',
    meta: s.meta || '',
    desc: s.desc || '',
  }));
  // one reel per digit of the longest step number
  const counterWidth = Math.max(0, ...stepList.map((s) => s.num.length));

  // The vanilla's config block: each prop parsed the way the vanilla parses
  // its data-anm-* string. The build reads it under the vanilla's names.
  const config = {
    stepHeight: parseFloat(stepHeight),
    snap: snap === true || snap === 'true',
    // the ramp, deepest first; each shade can be set on its own
    colorDeep,
    colorPrimary,
    colorMid,
    colorAccent,
    colorLight,
    colorHighlight,
    rimColor: rimColor || colorPrimary,
    rimAmt: parseFloat(rim),
    inertia: parseFloat(inertia),
    stirAmt: parseFloat(stir),
    drift: parseFloat(drift),
    warp: parseFloat(warp),
    bulge: parseFloat(bulge),
    clickRipple: parseFloat(clickRipple),
    grain: parseFloat(grain),
    shading: parseFloat(shading),
    softness: parseFloat(softness),
    paintSeed: parseInt(seed, 10),
  };

  // goTo() and refresh() mirror window.Anm.OrbProcess; unmounting is kill()
  useImperativeHandle(ref, () => ({
    goTo: (index) => {
      if (apiRef.current) apiRef.current.goTo(index);
    },
    refresh: () => {
      if (apiRef.current) apiRef.current.refresh();
    },
  }), []);

  useGSAP(() => {
    // --- Selectors ---
    const container = containerRef.current;
    const stepEls = stepList.map((_, i) => stepRefs.current[i]).filter(Boolean);
    const orb = orbRef.current;
    const ringEl = ringRef.current;
    const labelHost = labelHostRef.current;
    const trail = trailRef.current;

    if (!container || stepEls.length < 2 || !orb || !ringEl || !labelHost) return undefined;

    // React hands a rebuild (StrictMode, a prop change) the same nodes, and a
    // canvas whose context the last build released stays lost for good, so
    // every build draws on a fresh canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'obp_canvas';
    canvas.setAttribute('data-anm-obp-canvas', '');
    canvas.setAttribute('aria-hidden', 'true');
    orb.appendChild(canvas);

    // --- Config ---
    const {
      stepHeight,
      snap,
      colorDeep,
      colorPrimary,
      colorMid,
      colorAccent,
      colorLight,
      colorHighlight,
      rimColor,
      rimAmt,
      inertia,
      stirAmt,
      drift,
      warp,
      bulge,
      clickRipple,
      grain,
      shading,
      softness,
      paintSeed,
    } = config;

    // --- State ---
    const n = stepEls.length;
    const steps = [];
    const ring = { pos: 0 };
    // what the ring shows in snap mode, gliding after the nearest step
    const ringShown = { pos: 0 };
    let snapTarget = 0;
    // ripple slots, flattened into uRip on every frame they live
    const ripples = [];
    const rippleData = new Float32Array(RIPPLE_SLOTS * 4);
    let rippleNext = 0;
    const ripTime = RIPPLE_LIFE;
    // the ball's roll: where it is (in steps) and how stirred the paint is.
    // It follows the ring's position with inertia, so it answers every bit of
    // scroll and coasts to a stop.
    let stepFrames = null;
    const frameNow = new Float32Array(4);
    let orbPos = 0;
    let stir = 0;
    const palette = [colorDeep, colorPrimary, colorMid, colorAccent, colorLight, colorHighlight];
    const mm = gsap.matchMedia();
    let labels = [];
    let ringLabels = [];
    // one reel of 0-9 per counter digit, so only the digits that change roll
    let digitReels = [];
    let textItems = [];
    let labelRadius = 0;
    // the trail's circumference on screen: its hairline keeps a fixed
    // on-screen width, so its dashes are measured in screen pixels too
    let trailLength = 0;
    let active = -1;
    let reduced = false;
    let tl = null;
    let gl = null;
    let looping = false;
    let onScreen = false;
    let dirty = false;
    let lastFrame = 0;
    let resizeTimer = null;
    let io = null;

    // --- Helpers ---
    function dur(seconds) {
      return reduced ? 0 : seconds;
    }

    // The painting: one flowing field whose values are mapped onto the palette
    // ramp, so every pixel is a blend of neighbouring shades, the way a painted
    // gradient is. The shader only moves and frames it. The darkest spots are
    // kept: each step frames one, so every step has a deep core.
    function paint(pools) {
      const size = PAINT_SIZE;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const g = c.getContext('2d');
      const img = g.createImageData(size, size);
      const rand = seeded(paintSeed);
      const tone = field(rand);
      const flowX = field(rand);
      const flowY = field(rand);
      const ramp = palette.map(hexToRgb);
      const last = ramp.length - 1;
      const values = new Float32Array(size * size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const u = x / size;
          const v = y / size;
          const t = smooth01(PAINT_LO, PAINT_HI, tone(u + PAINT_FLOW * (flowX(u, v) - 0.5), v + PAINT_FLOW * (flowY(u, v) - 0.5)));
          const i = y * size + x;
          const pos = t * last;
          const k = Math.min(Math.floor(pos), last - 1);
          const f = pos - k;
          values[i] = t;
          for (let ch = 0; ch < 3; ch++) img.data[i * 4 + ch] = ramp[k][ch] + (ramp[k + 1][ch] - ramp[k][ch]) * f;
          img.data[i * 4 + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      // the darkest spots on a coarse grid, kept only when far enough apart
      const cand = [];
      for (let gy = 0; gy < 24; gy++) {
        for (let gx = 0; gx < 24; gx++) {
          const u = (gx + 0.5) / 24;
          const v = (gy + 0.5) / 24;
          cand.push([values[Math.floor(v * size) * size + Math.floor(u * size)], u, v]);
        }
      }
      cand.sort(function (a, b) { return a[0] - b[0]; });
      cand.forEach(function (p) {
        if (pools.length >= POOL_COUNT) return;
        const far = pools.every(function (q) { return Math.hypot(wrapGap(p[1], q[0]), wrapGap(p[2], q[1])) >= POOL_GAP; });
        if (far) pools.push([p[1], p[2]]);
      });
      return c;
    }

    // One framing per step, [zoom, turn, offset x, offset y]. Each step lies
    // one roll further across the painting than the last, snapped to the
    // nearest deep spot, so every step has a colour core and scrolling always
    // rolls the ball the same way. Offsets keep counting past the painting's
    // edge (it tiles), so the roll between two steps is a straight line.
    function framings(pools) {
      const rand = seeded(paintSeed + 101);
      const out = [];
      const used = [];
      let at = pools[0].slice();
      used.push(0);
      for (let k = 0; k < n; k++) {
        if (k > 0) {
          const want = [at[0] + ROLL_STEP[0], at[1] + ROLL_STEP[1]];
          let best = -1;
          let bestGap = POOL_REACH;
          pools.forEach(function (p, idx) {
            if (used.indexOf(idx) !== -1) return;
            const gap = Math.hypot(wrapDelta(p[0] - want[0]), wrapDelta(p[1] - want[1]));
            if (gap < bestGap) { bestGap = gap; best = idx; }
          });
          at = best === -1 ? want : [want[0] + wrapDelta(pools[best][0] - want[0]), want[1] + wrapDelta(pools[best][1] - want[1])];
          if (best !== -1) used.push(best);
          if (used.length >= pools.length) used.length = 0;
        }
        out.push([
          0.7 + 0.2 * rand(),
          (rand() - 0.5) * 0.6,
          at[0] - 0.5 + (rand() - 0.5) * 2 * CORE_JITTER,
          at[1] - 0.5 + (rand() - 0.5) * 2 * CORE_JITTER,
        ]);
      }
      return out;
    }

    // The ball's view at a fractional step: a straight roll between the two
    // framings either side.
    function frameAt(pos) {
      const p = Math.min(Math.max(pos, 0), n - 1);
      const i = Math.min(Math.floor(p), n - 2);
      const t = p - i;
      const a = stepFrames[i];
      const b = stepFrames[i + 1];
      for (let k = 0; k < 4; k++) frameNow[k] = a[k] + (b[k] - a[k]) * t;
      return frameNow;
    }

    function measureRing() {
      labelRadius = ringEl.offsetWidth / 2 + LABEL_GAP;
      trailLength = Math.PI * ringEl.offsetWidth * 0.99;
    }

    // the reel offset for each digit of step i's number
    function digitsOf(i) {
      const num = steps[i].num.padStart(digitReels.length, '0');
      return digitReels.map(function (reel, k) {
        const d = parseInt(num.charAt(k), 10);
        return -10 * (isNaN(d) ? 0 : d);
      });
    }

    function createGL() {
      if (!canvas) return null;
      const ctx = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: true,
      });
      // no usable GPU: the CSS orb stays, which is the designed fallback
      if (!ctx) return null;
      const vs = compile(ctx, ctx.VERTEX_SHADER, ORB_VERT);
      const fs = compile(ctx, ctx.FRAGMENT_SHADER, ORB_FRAG);
      if (!vs || !fs) return null;
      const prog = ctx.createProgram();
      ctx.attachShader(prog, vs);
      ctx.attachShader(prog, fs);
      ctx.linkProgram(prog);
      if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) return null;
      ctx.useProgram(prog);

      const buf = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), ctx.STATIC_DRAW);
      const aPos = ctx.getAttribLocation(prog, 'aPos');
      ctx.enableVertexAttribArray(aPos);
      ctx.vertexAttribPointer(aPos, 2, ctx.FLOAT, false, 0, 0);

      const tex = ctx.createTexture();
      ctx.bindTexture(ctx.TEXTURE_2D, tex);
      const pools = [];
      ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, paint(pools));
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
      // framings reach past the painting's edge; it tiles, so it simply repeats
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);

      // a safe edge width until the first size pass
      ctx.uniform1f(ctx.getUniformLocation(prog, 'uPx'), 0.01);
      // the look is fixed per instance: set once
      ctx.uniform1f(ctx.getUniformLocation(prog, 'uWarp'), warp);
      ctx.uniform1f(ctx.getUniformLocation(prog, 'uBulge'), bulge);
      ctx.uniform1f(ctx.getUniformLocation(prog, 'uRipTime'), ripTime);
      ctx.uniform3fv(ctx.getUniformLocation(prog, 'uRimColor'), hexToRgb(rimColor).map(function (v) { return v / 255; }));
      ctx.uniform1f(ctx.getUniformLocation(prog, 'uRim'), rimAmt);
      ctx.uniform1f(ctx.getUniformLocation(prog, 'uGrain'), grain);
      ctx.uniform1f(ctx.getUniformLocation(prog, 'uShade'), shading);
      ctx.uniform1f(ctx.getUniformLocation(prog, 'uSoft'), softness);
      stepFrames = framings(pools);

      return {
        ctx: ctx,
        prog: prog,
        buf: buf,
        tex: tex,
        time: 0,
        uTime: ctx.getUniformLocation(prog, 'uTime'),
        uFrame: ctx.getUniformLocation(prog, 'uFrame'),
        uStir: ctx.getUniformLocation(prog, 'uStir'),
        uPx: ctx.getUniformLocation(prog, 'uPx'),
        uRip: ctx.getUniformLocation(prog, 'uRip'),
      };
    }

    function sizeGL() {
      if (!gl) return;
      const w = canvas.clientWidth;
      if (!w) return;
      const side = Math.round(w * Math.min(window.devicePixelRatio || 1, DPR_CAP));
      canvas.width = side;
      canvas.height = side;
      gl.ctx.viewport(0, 0, side, side);
      gl.ctx.uniform1f(gl.uPx, 2 / side);
    }

    function renderGL() {
      dirty = false;
      const ctx = gl.ctx;
      ctx.uniform1f(gl.uTime, gl.time);
      ctx.uniform4fv(gl.uFrame, frameAt(orbPos));
      ctx.uniform1f(gl.uStir, stir * stirAmt);
      ripples.forEach(function (r, k) {
        rippleData[k * 4] = r.x;
        rippleData[k * 4 + 1] = r.y;
        rippleData[k * 4 + 2] = r.age;
        rippleData[k * 4 + 3] = r.w;
      });
      ctx.uniform4fv(gl.uRip, rippleData);
      ctx.clearColor(0, 0, 0, 0);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
    }

    // Full teardown. After a context loss the context is already gone, so it
    // is not forced a second time.
    function destroyGL(lost) {
      if (!gl) return;
      gsap.ticker.remove(tick);
      looping = false;
      if (!lost) {
        gl.ctx.deleteTexture(gl.tex);
        gl.ctx.deleteBuffer(gl.buf);
        gl.ctx.deleteProgram(gl.prog);
        const lose = gl.ctx.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      }
      gl = null;
      orb.classList.remove('is-gl');
      applyOrb();
    }

    // --- Animation routines ---
    // The step the ball rolls toward: the ring's live position, or the
    // snapped one in snap mode.
    function rollTarget() {
      return snap ? ringShown.pos : ring.pos;
    }

    // Redraws the orb. When nothing runs the loop (reduced motion, off screen)
    // the ball sits on its step with the paint still; without GL the CSS
    // orb's clouds turn instead.
    function applyOrb() {
      if (gl) {
        if (!looping) {
          orbPos = reduced ? Math.round(rollTarget()) : rollTarget();
          stir = 0;
          renderGL();
        }
        dirty = true;
        return;
      }
      orb.style.setProperty('--obp-turn', (rollTarget() * TURN_STEP) + 'rad');
    }

    function tick(time) {
      const dt = gsap.ticker.deltaRatio(60) / 60;
      gl.time += dt * DRIFT * drift;
      ripples.forEach(function (r) {
        if (!r.w) return;
        r.age += dt;
        if (r.age > ripTime) r.w = 0;
        dirty = true;
      });
      // the ball follows the ring with inertia; its speed stirs the paint,
      // which rises fast and settles slowly once the ball stops
      const prev = orbPos;
      orbPos += (rollTarget() - orbPos) * (1 - Math.exp(-dt / Math.max(inertia, 0.01)));
      const want = Math.min(Math.abs(orbPos - prev) / Math.max(dt, 0.001) * STIR_GAIN, 1);
      stir += (want - stir) * (1 - Math.exp(-dt / (want > stir ? STIR_RISE : STIR_SETTLE)));
      if (Math.abs(rollTarget() - orbPos) > 0.0005 || stir > 0.002) dirty = true;
      if (!dirty && time - lastFrame < AMBIENT_GAP) return;
      lastFrame = time;
      renderGL();
    }

    function syncLoop() {
      const want = !!gl && !reduced && onScreen && !document.hidden;
      if (want === looping) return;
      looping = want;
      if (want) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    }

    // A ring that runs out from (x, y), in orb space with the centre at 0 and
    // the rim at 1. The oldest ring gives up its slot.
    function addRipple(x, y) {
      if (!gl || reduced || !looping || clickRipple <= 0) return;
      const r = ripples[rippleNext];
      rippleNext = (rippleNext + 1) % RIPPLE_SLOTS;
      r.x = x;
      r.y = y;
      r.age = 0;
      r.w = clickRipple;
      dirty = true;
    }

    function highlight(i) {
      gsap.to(ringLabels.concat(labels), {
        opacity: function (k) { return k % n === i ? 1 : DIM; },
        duration: dur(HIGHLIGHT_DUR),
        ease: 'annnimate',
        overwrite: true,
        data: { label: steps[i].name + ' lights up' },
      });
    }

    function swapText(prev, i) {
      const dir = prev > i ? -1 : 1;
      // a rebuild (reduced motion toggled) starts from a clean stack
      if (prev < 0) gsap.set(textItems, { autoAlpha: 0 });
      else {
        gsap.to(textItems[prev], {
          autoAlpha: 0, y: -TEXT_SHIFT * dir,
          duration: dur(TEXT_OUT_DUR), ease: 'annnimate', overwrite: true, force3D: true,
          data: { label: 'Step text leaves' },
        });
      }
      gsap.fromTo(textItems[i], { autoAlpha: 0, y: TEXT_SHIFT * dir }, {
        autoAlpha: 1, y: 0,
        duration: dur(TEXT_IN_DUR), delay: dur(TEXT_OUT_DUR * 0.5),
        ease: 'annnimate', overwrite: true, force3D: true,
        data: { label: steps[i].name + ' text rises in' },
      });
    }

    // Each digit rolls on its own reel, so 03 to 04 only turns the last digit
    // and the leading zero holds still.
    function rollCounter(i) {
      const to = digitsOf(i);
      digitReels.forEach(function (reel, k) {
        gsap.to(reel, {
          yPercent: to[k],
          duration: dur(ROLL_DUR), ease: 'annnimate', overwrite: true, force3D: true,
          data: { label: 'Counter rolls to ' + steps[i].num },
        });
      });
    }

    // The ring's position picks the step. What a step owns is never scrubbed:
    // it plays as a timed tween when its name reaches the top and plays back
    // when the page scrolls above it.
    function setActive(i) {
      if (i === active) return;
      const prev = active;
      active = i;
      stepEls.forEach(function (el, k) {
        for (const node of [el, ringLabels[k]]) {
          if (k === i) node.setAttribute('aria-current', 'step');
          else node.removeAttribute('aria-current');
        }
      });
      highlight(i);
      swapText(prev, i);
      rollCounter(i);
    }

    // Places the labels round the ring at its turned position, upright, each
    // anchored on its outer side so it never overlaps the ring,
    // and draws the progress trail back from 12 o'clock. Plain style writes:
    // this runs every scroll frame.
    function spinTo() {
      const pos = ringShown.pos;
      ringLabels.forEach(function (label, k) {
        const a = (k - pos) * 2 * Math.PI / n - Math.PI / 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        label.style.transform = 'translate(' + (c * labelRadius) + 'px, ' + (s * labelRadius) + 'px) translate(' + (-50 + 50 * c) + '%, ' + (-50 + 50 * s) + '%)';
      });
      // the trail is overall progress: it closes the circle on the last step
      if (trail) {
        const arc = Math.min(Math.max(pos, 0) / (n - 1), 1);
        trail.style.strokeDasharray = (arc * trailLength) + 'px ' + trailLength + 'px';
        trail.setAttribute('transform', 'rotate(' + (-90 - arc * 360) + ' 50 50)');
      }
      if (snap) applyOrb();
    }

    // Scrolls to where step k rests on the track: the first and last steps at
    // the track's ends, the rest just after their turn.
    function goTo(k) {
      const st = tl && tl.scrollTrigger;
      if (!st) return;
      const span = 2 * HOLD + n - 1;
      const at = k === 0 ? 0 : (k === n - 1 ? span : HOLD + k);
      const y = st.start + (st.end - st.start) * at / span;
      if (window.lenis && typeof window.lenis.scrollTo === 'function') window.lenis.scrollTo(y);
      else window.scrollTo({ top: y, behavior: reduced ? 'instant' : 'smooth' });
    }

    // Snap mode snaps the value, never the page: the scroll still drives the
    // ring's position, and the moment it passes a midpoint the ring is already
    // gliding to the next step, so nothing waits for the scroll to stop.
    function applyRing() {
      const step = Math.round(ring.pos);
      setActive(step);
      applyOrb();
      if (snap && !reduced) {
        if (step === snapTarget) return;
        snapTarget = step;
        gsap.to(ringShown, {
          pos: step,
          duration: SNAP_DUR,
          ease: SNAP_EASE,
          overwrite: true,
          onUpdate: spinTo,
          data: { label: 'Ring snaps to ' + steps[step].name },
        });
        return;
      }
      ringShown.pos = reduced ? step : ring.pos;
      spinTo();
    }

    // The only scrubbed value: the ring turns one step per segment. ONE trigger
    // on the track, and the step index is computed from the ring's position.
    // No pin: the stage is CSS sticky inside the tall track.
    function buildScrub() {
      const t = gsap.timeline({
        defaults: { ease: RING_EASE, duration: 1 },
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduced ? true : SCRUB,
        },
        onUpdate: applyRing,
      });
      for (let k = 1; k < n; k++) {
        t.fromTo(ring, { pos: k - 1 }, {
          pos: k,
          immediateRender: false,
          data: { label: 'Ring brings up ' + steps[k].name },
        }, HOLD + k - 1);
      }
      t.set({}, {}, 2 * HOLD + n - 1);
      return t;
    }

    // --- Event listeners ---
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        measureRing();
        spinTo();
        sizeGL();
        if (gl && !looping) renderGL();
      }, 150);
    }

    function onVisibility() {
      // Only pause this section's orb, never the landing's shared timeline.
      syncLoop();
    }

    function onContextLost(e) {
      e.preventDefault();
      destroyGL(true);
    }

    function onOrbClick(e) {
      const rect = orb.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (x * x + y * y <= 1) addRipple(x, y);
    }

    // one listener on the nav, as in the vanilla; the clicked label is found
    // by ref instead of by class
    function onLabelClick(e) {
      const k = ringLabels.findIndex(function (label) { return label.contains(e.target); });
      if (k !== -1) goTo(k);
    }

    function onIntersect(entries) {
      onScreen = entries[0].isIntersecting;
      syncLoop();
    }

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    if (canvas) canvas.addEventListener('webglcontextlost', onContextLost);
    orb.addEventListener('click', onOrbClick);
    labelHost.addEventListener('click', onLabelClick);
    io = new IntersectionObserver(onIntersect, { rootMargin: '200px 0px' });
    io.observe(orb);

    // --- Initial DOM state ---
    stepEls.forEach(function (el, i) {
      steps.push({
        name: stepList[i].name,
        num: stepList[i].num,
        desc: stepList[i].desc,
        meta: stepList[i].meta,
        label: itemLabelRefs.current[i] || el,
      });
    });
    labels = steps.map(function (s) { return s.label; });
    for (let k = 0; k < RIPPLE_SLOTS; k++) ripples.push({ x: 0, y: 0, age: 0, w: 0 });

    container.style.setProperty('--obp-runway', stepHeight * (n - 1 + 2 * HOLD));
    // the vanilla builds the ring labels, the step text and the counter reels
    // here; React renders them from the steps prop, so they are collected
    ringLabels = steps.map(function (s, k) { return ringLabelRefs.current[k]; });
    textItems = steps.map(function (s, k) { return textItemRefs.current[k]; });
    digitReels = reelRefs.current.slice(0, counterWidth);

    // the first step rests at the top, set (never played) on load
    measureRing();
    spinTo();
    gsap.set(ringLabels.concat(labels), { opacity: function (k) { return k % n === 0 ? 1 : DIM; } });
    gsap.set(textItems, { autoAlpha: function (k) { return k === 0 ? 1 : 0; } });
    gsap.set(digitReels, { yPercent: function (k) { return digitsOf(0)[k]; } });
    stepEls[0].setAttribute('aria-current', 'step');
    ringLabels[0].setAttribute('aria-current', 'step');
    active = 0;

    // the CSS orb paints with the same palette
    orb.style.setProperty('--obp-c1', palette[1]);
    orb.style.setProperty('--obp-c2', palette[0]);
    orb.style.setProperty('--obp-c3', palette[palette.length - 1]);
    gl = createGL();
    if (gl) {
      orb.classList.add('is-gl');
      sizeGL();
    }
    applyOrb();

    // --- Reduced motion ---
    // Reduced motion: the ring jumps from step to step, every state change is
    // instant and the orb never runs its ambient loop (one still frame).
    mm.add({
      isReduced: '(prefers-reduced-motion: reduce)',
      isFull: '(prefers-reduced-motion: no-preference)',
    }, function (context) {
      reduced = !!context.conditions.isReduced;
      tl = buildScrub();
      applyRing();
      // Run ambient drift only when the section is visible and the visitor
      // has not requested reduced motion. Hidden tabs release the ticker.
      syncLoop();
      return function () {
        if (tl) {
          // matchMedia kills tl (clearing tl.scrollTrigger) before this cleanup runs
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
          tl.kill();
          tl = null;
        }
        // the next build re-applies the step in its own mode
        active = -1;
        snapTarget = -1;
      };
    });

    // --- Public API ---
    apiRef.current = {
      goTo: goTo,
      refresh: function () {
        ScrollTrigger.refresh();
        measureRing();
        spinTo();
        sizeGL();
        if (gl && !looping) renderGL();
      },
    };

    // the vanilla kill()
    return () => {
      apiRef.current = null;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (canvas) canvas.removeEventListener('webglcontextlost', onContextLost);
      orb.removeEventListener('click', onOrbClick);
      labelHost.removeEventListener('click', onLabelClick);
      if (io) io.disconnect();
      mm.revert();
      gsap.killTweensOf([ringShown].concat(digitReels, ringLabels, labels, textItems));
      destroyGL(false);
      // React keeps the nodes for the next build: the canvas whose context was
      // just released goes, and so do the step marker and the fallback turn
      // destroyGL just wrote, both set outside React
      canvas.remove();
      orb.style.removeProperty('--obp-turn');
      stepEls.concat(ringLabels).forEach(function (el) { el.removeAttribute('aria-current'); });
    };
  }, {
    scope: containerRef,
    dependencies: [
      steps, stepHeight, snap, inertia, stir,
      colorDeep, colorPrimary, colorMid, colorAccent, colorLight, colorHighlight,
      rimColor, rim, clickRipple, seed, drift, warp, bulge, shading, grain, softness,
    ],
    revertOnUpdate: true,
  });

  return (
    <section
      ref={containerRef}
      className={'obp_section' + (className ? ' ' + className : '')}
      data-anm-orb-process
      aria-labelledby={titleId}
    >
      <div className="obp_stage">
        <div className="obp_inner">
          <div className="obp_copy">
            <header className="obp_head">
              <h2 className="obp_title" id={titleId}>{title}</h2>
              <p className="obp_intro">{intro}</p>
            </header>

            <div className="obp_detail">
              <p className="obp_count" aria-hidden="true">
                <span className="obp_count_roll" data-anm-obp-strip>
                  {Array.from({ length: counterWidth }, (_, k) => (
                    <span key={k} className="obp_count_digit">
                      <span ref={(el) => { reelRefs.current[k] = el; }} className="obp_count_reel">
                        {DIGITS.map((d) => <span key={d}>{d}</span>)}
                      </span>
                    </span>
                  ))}
                </span>
                <span className="obp_count_total" data-anm-obp-total>{'/ ' + pad2(stepList.length)}</span>
              </p>
              <div className="obp_text" data-anm-obp-text aria-hidden="true">
                {stepList.map((s, i) => (
                  <div key={i} ref={(el) => { textItemRefs.current[i] = el; }} className="obp_text_item">
                    <p className="obp_text_name">
                      {s.name}
                      {s.meta ? <span className="obp_text_meta">{s.meta}</span> : null}
                    </p>
                    <p className="obp_text_desc">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="obp_visual">
            <div ref={ringRef} className="obp_ring" data-anm-obp-ring>
              <svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">
                <circle className="obp_track" cx="50" cy="50" r="49.5" />
                <circle ref={trailRef} className="obp_trail" data-anm-obp-trail cx="50" cy="50" r="49.5" />
                <circle className="obp_mark" cx="50" cy="0.5" r="0.55" />
              </svg>
              <div className="obp_slot">
                <div ref={orbRef} className="obp_orb" data-anm-obp-orb>
                  <div className="obp_ball">
                    <div className="obp_swirl">
                      <span className="obp_blob obp_blob_1" />
                      <span className="obp_blob obp_blob_2" />
                      <span className="obp_blob obp_blob_3" />
                    </div>
                  </div>
                  {/* canvas.obp_canvas lands here, created per build */}
                </div>
              </div>
              <nav ref={labelHostRef} className="obp_labels" data-anm-obp-labels aria-label="Pasos con Elevator">
                {stepList.map((s, k) => (
                  <button
                    key={k}
                    ref={(el) => { ringLabelRefs.current[k] = el; }}
                    type="button"
                    className="obp_label"
                    data-index={k}
                    aria-label={'Ir al paso ' + s.num + ': ' + s.name}
                  >
                    <span className="obp_label_num">{s.num}</span>
                    <span className="obp_label_name">{s.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <ol className="obp_list">
            {stepList.map((s, i) => (
              <li key={i} ref={(el) => { stepRefs.current[i] = el; }} className="obp_item" data-anm-obp-step>
                <span ref={(el) => { itemLabelRefs.current[i] = el; }} className="obp_item_label" data-anm-obp-label>
                  <span data-anm-obp-num>{s.num}</span> <span data-anm-obp-name>{s.name}</span>
                </span>
                {' '}
                {s.meta ? <span data-anm-obp-meta>{s.meta}</span> : null}
                {' '}
                <span data-anm-obp-desc>{s.desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
});

export default OrbProcess;
