"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./ElevatorMascot.module.css";

// Adapted from Bencho's publicly provided Eye Tracker (Pill), with Elevator blue for the light landing.
// https://bencho.dev/?c=eye-tracker&shape=Pill&theme=dark&fill=light
// Keeps its spherical eye projection; scopes tracking to our journey diagram.
const BODY = "M34 17 H66 A33 33 0 0 1 66 83 H34 A33 33 0 0 1 34 17 Z";
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function ElevatorMascot() {
  const root = useRef<SVGSVGElement>(null);
  const clip = `elevator-mascot-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const stage = svg.closest("figure") ?? svg;
    const eyes = [...svg.querySelectorAll<SVGGElement>("[data-mascot-eye]")];
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const turn = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    let frame = 0, timer = 0, previous = 0, blinkAt = -Infinity;
    let visible = false, disposed = false;

    function draw(now: number) {
      const elapsed = now - blinkAt;
      const lid = elapsed < 160 ? 1 - .9 * Math.sin(elapsed / 160 * Math.PI) : 1;
      const yaw = Math.asin(clamp(turn.x, -.92, .92));
      const pitch = -Math.asin(clamp(turn.y, -.92, .92));
      const tilt = 64 * turn.x * turn.y;
      [-.19, .19].forEach((origin, index) => {
        const eye = eyes[index];
        const rect = eye?.firstElementChild;
        if (!eye || !rect) return;
        const z = Math.sqrt(1 - origin * origin);
        const x = origin * Math.cos(yaw) + z * Math.sin(yaw);
        const depth = -origin * Math.sin(yaw) + z * Math.cos(yaw);
        const y = -depth * Math.sin(pitch);
        const facing = depth * Math.cos(pitch);
        const near = clamp(facing, 0, 1);
        const scale = .45 + .55 * near;
        const width = 9 * scale * (.7 + .3 * near);
        const height = Math.max(.6, 15 * scale * lid);
        rect.setAttribute("x", (-width / 2).toFixed(2));
        rect.setAttribute("y", (-height / 2).toFixed(2));
        rect.setAttribute("width", width.toFixed(2));
        rect.setAttribute("height", height.toFixed(2));
        rect.setAttribute("rx", Math.min(4.5, width / 2, height / 2).toFixed(2));
        eye.setAttribute("transform", `translate(${(50 + x * 50).toFixed(2)} ${(50 + y * 50).toFixed(2)}) rotate(${tilt.toFixed(2)})`);
        eye.style.opacity = facing < .05 ? "0" : "1";
      });
    }
    function allowed() { return !disposed && visible && !document.hidden && !preference.matches; }
    function schedule() {
      if (allowed() && !frame) frame = requestAnimationFrame(tick);
    }
    function planBlink() {
      if (!allowed() || timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        blinkAt = performance.now();
        schedule();
      }, 2600 + Math.random() * 3200);
    }
    function tick(now: number) {
      frame = 0;
      if (!allowed()) return;
      const dt = previous ? Math.min(2.5, (now - previous) / 16.67) : 1;
      previous = now;
      turn.vx += ((turn.tx - turn.x) * .06 - turn.vx * .274) * dt;
      turn.vy += ((turn.ty - turn.y) * .06 - turn.vy * .274) * dt;
      turn.x += turn.vx * dt;
      turn.y += turn.vy * dt;
      const settled = Math.abs(turn.tx - turn.x) + Math.abs(turn.ty - turn.y) + Math.abs(turn.vx) + Math.abs(turn.vy) < .001;
      if (settled) { turn.x = turn.tx; turn.y = turn.ty; turn.vx = turn.vy = 0; }
      draw(now);
      if (!settled || now - blinkAt < 160) schedule();
      else { previous = 0; planBlink(); }
    }
    function rest() { turn.tx = turn.ty = 0; schedule(); }
    function aim(event: PointerEvent) {
      if (!allowed() || event.pointerType === "touch") return;
      const bounds = svg!.getBoundingClientRect();
      const frameBounds = stage.getBoundingClientRect();
      const dx = event.clientX - bounds.left - bounds.width / 2;
      const dy = event.clientY - bounds.top - bounds.height / 2;
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.max(60, Math.min(frameBounds.width, frameBounds.height) * .28);
      const far = Math.min(.85, Math.tanh(distance / reach) * .9);
      turn.tx = dx / distance * far;
      turn.ty = dy / distance * far;
      schedule();
    }
    function pause() {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = timer = previous = 0;
    }
    function sync() {
      pause();
      if (preference.matches) {
        Object.assign(turn, { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 });
        blinkAt = -Infinity;
        draw(performance.now());
      } else if (allowed()) { rest(); planBlink(); }
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(svg);
    stage.addEventListener("pointermove", aim as EventListener, { passive: true });
    stage.addEventListener("pointerleave", rest);
    window.addEventListener("blur", rest);
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);
    draw(performance.now());
    return () => {
      disposed = true;
      pause();
      observer.disconnect();
      stage.removeEventListener("pointermove", aim as EventListener);
      stage.removeEventListener("pointerleave", rest);
      window.removeEventListener("blur", rest);
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", sync);
    };
  }, []);

  return <svg ref={root} className={styles.mascot} viewBox="0 0 100 100" aria-hidden="true" focusable="false" data-elevator-mascot="pill">
    <defs><clipPath id={clip}><path d={BODY} /></clipPath></defs>
    <path d={BODY} fill="#0071e3" />
    <g clipPath={`url(#${clip})`} fill="#fff">
      {[40.5, 59.5].map(x => <g key={x} data-mascot-eye transform={`translate(${x} 50)`}><rect x="-4.43" y="-7.42" width="8.86" height="14.85" rx="4.43" /></g>)}
    </g>
  </svg>;
}
