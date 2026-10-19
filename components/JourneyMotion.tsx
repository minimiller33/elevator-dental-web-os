"use client";

// SVG Draw Path from Annnimate, adapted to measured responsive connections.
// Each instance owns its animation and cleanup; it never kills other triggers.
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

type Connections = { width: number; height: number; paths: string[] };
export function JourneyMotion() {
  const svg = useRef<SVGSVGElement>(null);
  const completed = useRef(false);
  const [connections, setConnections] = useState<Connections>({ width: 1, height: 1, paths: [] });

  useLayoutEffect(() => {
    const canvas = svg.current?.parentElement;
    if (!canvas) return;
    const page = canvas.querySelector<HTMLElement>(".edw-journey__page");
    const engine = canvas.querySelector<HTMLElement>(".edw-journey__engine");
    const outcomes = [...canvas.querySelectorAll<HTMLElement>(".edw-journey__outcome")];
    if (!page || !engine || !outcomes.length) return;
    function measure() {
      // Offset geometry ignores the scale/translate of the entrance animation.
      function box(node: HTMLElement) {
        let left = 0, top = 0;
        for (let current: HTMLElement | null = node; current && current !== canvas; current = current.offsetParent as HTMLElement | null) {
          left += current.offsetLeft;
          top += current.offsetTop;
        }
        return { left, top, width: node.offsetWidth, height: node.offsetHeight, right: left + node.offsetWidth, bottom: top + node.offsetHeight };
      }
      const frame = { width: canvas!.clientWidth, height: canvas!.clientHeight };
      const p = box(page!);
      const e = box(engine!);
      if (!frame.width || !frame.height) return;
      const mobile = window.matchMedia("(max-width: 680px)").matches;
      const round = (n: number) => Math.round(n * 10) / 10;
      const point = (x: number, y: number) => `${round(x)} ${round(y)}`;
      let paths: string[];
      if (mobile) {
        const first = box(outcomes[0]);
        paths = [
          `M ${point(p.left + p.width / 2, p.bottom)} L ${point(e.left + e.width / 2, e.top)}`,
          `M ${point(e.left + e.width / 2, e.bottom)} L ${point(first.left + first.width / 2, first.top)}`,
        ];
      } else {
        const middle = e.top + 85;
        paths = [`M ${point(p.right, middle)} L ${point(e.left, middle)}`, ...outcomes.map(node => {
          const target = box(node);
          const bend = (e.right + target.left) / 2;
          return `M ${point(e.right, middle)} C ${point(bend, middle)} ${point(bend, target.top + target.height / 2)} ${point(target.left, target.top + target.height / 2)}`;
        })];
      }
      const next = { width: round(frame.width), height: round(frame.height), paths };
      setConnections(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    }
    measure();
    const observer = new ResizeObserver(measure);
    [canvas, page, engine, ...outcomes].forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const canvas = svg.current?.parentElement;
    const figure = canvas?.closest("figure");
    if (!canvas || !figure || !connections.paths.length) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (completed.current) return;
      const paths = svg.current!.querySelectorAll("[data-anm-svg-draw-path]");
      const page = canvas.querySelector(".edw-journey__page");
      const engine = canvas.querySelector(".edw-journey__engine");
      const outcomes = canvas.querySelectorAll(".edw-journey__outcome");
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: figure, start: "clamp(top 78%)", once: true },
        onComplete: () => { completed.current = true; },
      });
      timeline.from(page, { opacity: 0, x: -7, duration: .55, ease: "power2.out" })
        .fromTo(paths[0], { drawSVG: "0%" }, { drawSVG: "100%", duration: .65, ease: "power2.inOut" }, .15)
        .from(engine, { opacity: 0, scale: .98, duration: .55, ease: "power2.out" }, .4)
        .fromTo([...paths].slice(1), { drawSVG: "0%" }, { drawSVG: "100%", duration: .65, stagger: .1, ease: "power2.inOut" }, .65)
        .from(outcomes, { opacity: 0, y: 7, duration: .65, stagger: .12, ease: "power2.out" }, .85);
    });
    return () => mm.revert();
  }, { scope: svg, dependencies: [connections.paths.join("|")], revertOnUpdate: true });

  return <svg ref={svg} className="edw-journey__connections" viewBox={`0 0 ${connections.width} ${connections.height}`} aria-hidden="true" focusable="false">
    {connections.paths.map((path, index) => <g key={`${index}-${path}`}><path className="edw-journey__ghost" d={path} /><path data-anm-svg-draw-path d={path} /></g>)}
  </svg>;
}
