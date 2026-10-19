"use client";

// GSAP count-up adaptation of Annnimate's Counter pattern; the final value is always available to readers.
import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./counter.css";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Counter({ value }: { value: number }) {
  const root = useRef<HTMLSpanElement>(null);
  const number = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const node = number.current;
    if (!node || !root.current) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(node, { textContent: 0 }, {
        textContent: value, snap: { textContent: 1 }, duration: 1.6, ease: "power3.out", immediateRender: false,
        scrollTrigger: { trigger: root.current?.closest("#caso") || root.current, start: "top 75%", once: true },
      });
    });
    return () => { mm.revert(); node.textContent = String(value); };
  }, { scope: root, dependencies: [value], revertOnUpdate: true });
  return <span ref={root} className="edw-counter" data-anm-counter style={{ "--counter-width": `${String(value).length}ch` } as CSSProperties}>
    <span ref={number} aria-hidden="true" data-anm-counter-value>{value}</span>
    <span className="edw-counter-sr">{value}</span>
  </span>;
}
