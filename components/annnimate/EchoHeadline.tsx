"use client";

import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./echo-headline.css";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);
const COPIES = 8;

// Compact scroll-driven adaptation of the supplied Annnimate EchoHeadline.
// Only the root's custom properties change; CSS projects the real 3D copies.
export default function EchoHeadline({ text = "ELEVATOR DENTAL" }: { text?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const slabRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    const root = rootRef.current;
    const slab = slabRef.current;
    const word = wordRef.current;
    if (!root || !slab || !word) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const spread = { p: 0 };
      const rotateX = 20, rotateY = 20;
      let geometry = { hw: 0, hh: 0, p: 1, d: 1, vy: 0 };
      let active = true;
      const em = (value: number) => `${value.toFixed(4)}em`;
      function measure() {
        const size = parseFloat(getComputedStyle(slab!).fontSize);
        const hw = slab!.offsetWidth / size / 2;
        const hh = slab!.offsetHeight / size / 2;
        const p = 1.6 * hw * 2;
        geometry = { hw, hh, p, d: 0.8 * p, vy: -1.2 * hh * 2 };
        root!.style.setProperty("--eh-perspective", em(p));
        root!.style.setProperty("--eh-depth", em(geometry.d));
        root!.style.setProperty("--eh-vanish", `50% calc(50% + ${em(geometry.vy)})`);
      }
      function render() {
        const s = spread.p;
        const { hw, hh, p, d, vy } = geometry;
        const a = rotateX * s * Math.PI / 180;
        const b = rotateY * s * Math.PI / 180;
        const bounds = [Infinity, -Infinity, Infinity, -Infinity];
        for (const z of [0, -d * s]) for (const x of [-hw, hw]) for (const y of [-hh, hh]) {
          const x1 = x * Math.cos(b) + z * Math.sin(b);
          const z1 = z * Math.cos(b) - x * Math.sin(b);
          const y2 = y * Math.cos(a) - z1 * Math.sin(a);
          const z2 = y * Math.sin(a) + z1 * Math.cos(a);
          const factor = p / (p - z2);
          const sx = x1 * factor;
          const sy = vy + (y2 - vy) * factor;
          bounds[0] = Math.min(bounds[0], sx); bounds[1] = Math.max(bounds[1], sx);
          bounds[2] = Math.min(bounds[2], sy); bounds[3] = Math.max(bounds[3], sy);
        }
        root!.style.setProperty("--eh-shift-x", em(-(bounds[0] + bounds[1]) / 2));
        root!.style.setProperty("--eh-shift-y", em(-(bounds[2] + bounds[3]) / 2));
        root!.style.setProperty("--eh-rx", `${rotateX * s}deg`);
        root!.style.setProperty("--eh-ry", `${rotateY * s}deg`);
        root!.style.setProperty("--eh-reach", String(s));
        root!.classList.toggle("eh_is-shown", s > 0.002);
      }
      measure(); render();
      root.classList.add("eh_is-built");
      const tween = gsap.to(spread, {
        p: 1, duration: 1, ease: "none", onUpdate: render,
        scrollTrigger: { trigger: root, start: "center 85%", end: "center 25%", scrub: 0.6, invalidateOnRefresh: true },
      });
      const observer = new ResizeObserver(() => { measure(); render(); });
      observer.observe(word);
      document.fonts.ready.then(() => { if (active) { measure(); render(); tween.scrollTrigger?.refresh(); } });
      return () => {
        active = false;
        observer.disconnect();
        tween.scrollTrigger?.kill(); tween.kill();
        root.classList.remove("eh_is-built", "eh_is-shown");
        ["--eh-perspective", "--eh-depth", "--eh-vanish", "--eh-shift-x", "--eh-shift-y", "--eh-rx", "--eh-ry", "--eh-reach"].forEach(property => root.style.removeProperty(property));
      };
    });
    return () => media.revert();
  }, { scope: rootRef, dependencies: [text], revertOnUpdate: true });

  return <div className="eh_track er-echo-divider er-frame" ref={rootRef} id="elevator-dental" data-anm-echo-headline="">
    <div className="eh_stage"><div className="eh_slab" ref={slabRef}>
      {Array.from({ length: COPIES }, (_, index) => {
        const i = COPIES - index;
        const far = (i - 1) / (COPIES - 1);
        return <span key={i} className="eh_echo" aria-hidden="true" style={{ "--eh-i": String(i / COPIES), opacity: (0.35 * Math.pow(0.02 / 0.35, far)).toFixed(6) } as CSSProperties}>{text}</span>;
      })}
      <h2 className="eh_word" ref={wordRef}>{text}</h2>
    </div></div>
  </div>;
}
