"use client";

import { useEffect, useRef, useState } from "react";

export type LiveOrbVariant = "white" | "black" | "webgl" | "custom";
type RGB = [number, number, number];

export type LiveOrbProps = {
  className?: string;
  size?: number;
  variant?: LiveOrbVariant;
  color?: string;
  colors?: string[];
  interactive?: boolean;
  eyeColor?: string;
  blink?: boolean;
};

const DEFAULT_COLORS = ["#1858FB", "#18BAFB", "#42E8A1"];

const vertexShader = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const fragmentShader = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_look;
uniform float u_mode;
uniform float u_blink;
uniform vec3 u_body;
uniform vec3 u_eye;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
vec3 orient(vec3 p, vec2 look) {
  float yaw = look.x * 0.55, pitch = -look.y * 0.42;
  float cy = cos(yaw), sy = sin(yaw), cp = cos(pitch), sp = sin(pitch);
  vec3 q = vec3(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);
  return vec3(q.x * cy + q.z * sy, q.y, -q.x * sy + q.z * cy);
}
float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
  return length(p - (a + t * ab));
}
float visorEye(vec3 n, vec3 e, vec3 right, vec3 up, float blink) {
  float facing = dot(n, e);
  float x = dot(n, right) - dot(e, right);
  float y = dot(n, up) - dot(e, up);
  y /= mix(1.0, 0.075, blink);
  vec2 p = vec2(x, y);
  float a = segmentDistance(p, vec2(-0.048, -0.03), vec2(0.0, 0.034));
  float b = segmentDistance(p, vec2(0.0, 0.034), vec2(0.048, -0.03));
  float d = min(a, b) - 0.010;
  return (1.0 - smoothstep(-0.003, 0.005, d)) * smoothstep(0.12, 0.32, facing);
}
vec3 wash(vec3 n, float t, vec2 look) {
  vec2 q = (n.xy + look * 0.11) * 2.2 + n.z * 0.85;
  vec2 w = vec2(fbm(q * 1.4 + vec2(t * 0.22, t * 0.18)), fbm(q * 1.4 + vec2(-t * 0.16, t * 0.24) + 4.1));
  q += (w - 0.5) * 0.72;
  float f = fbm(q * 2.1 + vec2(0.0, t * 0.12)), g = fbm(q * 4.6 - vec2(t * 0.2, 0.0));
  return mix(mix(u_c1, u_c2, smoothstep(0.28, 0.72, f)), u_c3, pow(smoothstep(0.42, 0.9, g), 1.4));
}
void main() {
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
  uv.x *= u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = uv / 0.94; float r2 = dot(p, p);
  float edge = 1.0 - smoothstep(0.985, 1.012, sqrt(max(r2, 0.0)));
  if (edge <= 0.001) { gl_FragColor = vec4(0.0); return; }
  vec3 n = normalize(vec3(p, sqrt(max(1.0 - r2, 0.0))));
  vec2 look = u_look; float lm = length(look); if (lm > 1.0) look /= lm;
  vec3 body = u_mode > 0.5 ? wash(n, u_time * 0.55, look) : u_body;
  vec3 right = orient(vec3(1.0, 0.0, 0.0), look);
  vec3 up = orient(vec3(0.0, 1.0, 0.0), look);
  vec3 eL = orient(normalize(vec3(-0.27, 0.055, 1.0)), look);
  vec3 eR = orient(normalize(vec3(0.27, 0.055, 1.0)), look);
  float eyes = max(visorEye(n, eL, right, up, u_blink), visorEye(n, eR, right, up, u_blink));
  vec3 face = mix(body, u_eye, eyes);
  float grain = hash(gl_FragCoord.xy) - 0.5;
  face *= 1.0 + grain * 0.075;
  gl_FragColor = vec4(clamp(face, 0.0, 1.0), edge);
}
`;

function toRgb(hex: string): RGB {
  const value = hex.replace("#", "").trim();
  const full = value.length === 3 ? value.split("").map((part) => part + part).join("") : value.padEnd(6, "0").slice(0, 6);
  const number = Number.parseInt(full, 16);
  if (Number.isNaN(number)) return [0.96, 0.96, 0.96];
  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
  return shader;
}

export function LiveOrb({
  className = "",
  size = 520,
  variant = "webgl",
  color = "#1858FB",
  colors = DEFAULT_COLORS,
  interactive = true,
  eyeColor = "#071229",
  blink = true,
}: LiveOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasGl, setHasGl] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "high-performance" });
    if (!gl) return;
    const vs = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(["u_resolution", "u_time", "u_look", "u_mode", "u_blink", "u_body", "u_eye", "u_c1", "u_c2", "u_c3"].map((name) => [name, gl.getUniformLocation(program, name)]));
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = reducedMotion.matches, frame = 0, running = true, inView = true;
    let lastDraw = -Infinity;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const frameInterval = 1000 / 30;
    const webgl = variant === "webgl";
    const palette = (colors.length ? colors : DEFAULT_COLORS).map(toRgb);
    const body = toRgb(variant === "black" ? "#18181B" : variant === "white" ? "#F4F4F5" : color);
    const eye = toRgb(eyeColor);
    const start = performance.now();
    let nextBlink = start + 2200 + Math.random() * 2600, blinkAt = -10000;
    let lookX = 0, lookY = 0.08, targetX = 0, targetY = 0.08;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent || !parent.clientWidth || !parent.clientHeight) return;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
      canvas.width = Math.floor(parent.clientWidth * dpr); canvas.height = Math.floor(parent.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      lastDraw = -Infinity;
      schedule();
    };
    const onMove = (event: PointerEvent) => {
      if (!interactive || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
      targetY = Math.max(-1, Math.min(1, ((rect.top + rect.height / 2) - event.clientY) / (rect.height / 2)));
    };
    const schedule = () => {
      if (!frame && running && inView && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const onMotionPreference = () => { reduce = reducedMotion.matches; lastDraw = -Infinity; schedule(); };
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else { lastDraw = -Infinity; schedule(); }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    reducedMotion.addEventListener("change", onMotionPreference);
    document.addEventListener("visibilitychange", onVisibility);
    setHasGl(true);
    const tick = (now: number) => {
      frame = 0;
      if (!running) return;
      if (!inView || document.hidden) return;
      if (now - lastDraw < frameInterval) { schedule(); return; }
      lastDraw = now;
      const time = (now - start) / 1000;
      if (!reduce && blink && now >= nextBlink) { blinkAt = now; nextBlink = now + 2600 + Math.random() * 3600; }
      const blinkElapsed = (now - blinkAt) / 1000;
      const blinkValue = reduce || !blink ? 0 : blinkElapsed < 0.07 ? blinkElapsed / 0.07 : blinkElapsed < 0.13 ? 1 : blinkElapsed < 0.23 ? 1 - (blinkElapsed - 0.13) / 0.1 : 0;
      lookX += ((interactive ? targetX : 0) - lookX) * 0.12;
      lookY += ((interactive ? targetY : 0.08) - lookY) * 0.12;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.u_time, reduce ? 0 : time);
      gl.uniform2f(uniforms.u_look, lookX, lookY);
      gl.uniform1f(uniforms.u_mode, webgl ? 1 : 0);
      gl.uniform1f(uniforms.u_blink, blinkValue);
      gl.uniform3f(uniforms.u_body, body[0], body[1], body[2]);
      gl.uniform3f(uniforms.u_eye, eye[0], eye[1], eye[2]);
      ["u_c1", "u_c2", "u_c3"].forEach((key, index) => { const c = palette[index] ?? toRgb(DEFAULT_COLORS[index]); gl.uniform3f(uniforms[key], c[0], c[1], c[2]); });
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reduce) schedule();
    };
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    resize();
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) { cancelAnimationFrame(frame); frame = 0; }
      else schedule();
    });
    visibility.observe(canvas);
    schedule();
    return () => {
      running = false; cancelAnimationFrame(frame); observer.disconnect(); visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove); reducedMotion.removeEventListener("change", onMotionPreference);
      gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteBuffer(buffer); setHasGl(false);
    };
  }, [blink, color, colors, eyeColor, interactive, variant]);

  const background = variant === "webgl"
    ? { backgroundImage: `linear-gradient(135deg, ${colors[0] ?? DEFAULT_COLORS[0]}, ${colors[1] ?? DEFAULT_COLORS[1]}, ${colors[2] ?? DEFAULT_COLORS[2]})` }
    : { backgroundColor: variant === "black" ? "#18181B" : variant === "custom" ? color : "#F4F4F5" };

  return (
    <div className={`edw-live-orb ${className}`} role="img" aria-label="Mascota digital de Elevator con ojos interactivos y textura luminosa" style={{ width: size, height: size }}>
      {!hasGl && <div className="edw-live-orb__fallback" style={background} />}
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
