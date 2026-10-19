"use client";

import { useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./morphing-tooltip.css";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// Shared crisp tooltip surface with transient filtered mass underneath.
// Portalled to the viewport so cards and the footer dock cannot clip it.
export default function MorphingTooltip() {
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const id = `elevator-tooltip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const root = useRef<HTMLDivElement>(null);
  const goo = useRef<HTMLDivElement>(null);
  const mass = useRef<HTMLSpanElement>(null);
  const plate = useRef<HTMLSpanElement>(null);
  const neck = useRef<HTMLSpanElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const accessibleText = useRef<HTMLSpanElement>(null);
  const measure = useRef<HTMLSpanElement>(null);

  useGSAP((_, contextSafe) => {
    if (!mounted || !root.current || !contextSafe) return;
    const bubble = root.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active: HTMLElement | null = null;
    let timeline: gsap.core.Timeline | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let shown = false;
    const wipe = () => { gsap.set(goo.current, { opacity: 0 }); };
    const describe = (target: HTMLElement, add: boolean) => {
      const tokens = (target.getAttribute("aria-describedby") || "").split(/\s+/).filter(token => token && token !== id);
      if (add) tokens.push(id);
      if (tokens.length) target.setAttribute("aria-describedby", tokens.join(" ")); else target.removeAttribute("aria-describedby");
    };
    const geometry = (target: HTMLElement) => {
      measure.current!.textContent = target.dataset.morphTooltip || "";
      const size = measure.current!.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      const width = Math.ceil(size.width), height = Math.ceil(size.height);
      const x = Math.max(16, Math.min(box.left + box.width / 2 - width / 2, window.innerWidth - width - 16));
      const above = box.top - height - 12;
      const y = above >= 16 ? above : Math.min(window.innerHeight - height - 16, box.bottom + 12);
      return { x, y, width, height, box, seedX: box.left + box.width / 2 - 10, seedY: box.top + box.height / 2 - 10 };
    };
    const seedMass = (geo: ReturnType<typeof geometry>) => {
      const { box, x, y, width, height } = geo;
      const left = Math.min(x, box.left) - 20, top = Math.min(y, box.top) - 20;
      gsap.set(goo.current, { left, top, width: Math.max(x + width, box.right) - left + 20, height: Math.max(y + height, box.bottom) - top + 20, opacity: 1 });
      gsap.set(plate.current, { x: box.left - left + 2, y: box.top - top + 2, width: Math.max(0, box.width - 4), height: Math.max(0, box.height - 4) });
      gsap.set(mass.current, { x: geo.seedX - left, y: geo.seedY - top, width: 20, height: 20 });
      const cx = box.left + box.width / 2 - left, cy = box.top + box.height / 2 - top;
      const edge = y < box.top ? y + height - top : y - top;
      gsap.set(neck.current, { x: cx - 4, y: Math.min(cy, edge), width: 8, height: Math.abs(cy - edge) + 4 });
      return { x: x - left, y: y - top, width, height };
    };
    const hide = contextSafe((immediate = false) => {
      clearTimeout(timer);
      if (!active) return;
      const geo = geometry(active);
      describe(active, false);
      active = null;
      shown = false;
      timeline?.kill(); wipe();
      bubble.setAttribute("aria-hidden", "true");
      bubble.style.pointerEvents = "none";
      timeline = gsap.timeline();
      if (immediate || reduced.matches) { gsap.set(bubble, { opacity: 0 }); return; }
      timeline.to(text.current, { opacity: 0, duration: 0.12 }, 0);
      timeline.to(bubble, { x: geo.seedX, y: geo.seedY, width: 20, height: 20, opacity: 0, duration: 0.28, ease: "power3.in" }, 0);
    });
    const show = contextSafe((target: HTMLElement) => {
      if (target.matches(":disabled") || target.closest("[inert]")) return;
      clearTimeout(timer);
      if (active === target && shown) return;
      const travel = shown;
      if (active) describe(active, false);
      active = target;
      shown = true;
      timeline?.kill(); wipe();
      const caption = target.dataset.morphTooltip || "";
      const geo = geometry(target);
      text.current!.textContent = caption;
      accessibleText.current!.textContent = caption;
      describe(target, true);
      bubble.setAttribute("aria-hidden", "false");
      bubble.style.pointerEvents = "auto";
      timeline = gsap.timeline();
      gsap.set(text.current, { width: geo.width, opacity: reduced.matches ? 1 : 0 });
      if (reduced.matches) { gsap.set(bubble, { x: geo.x, y: geo.y, width: geo.width, height: geo.height, opacity: 1 }); return; }
      if (!travel) {
        gsap.set(bubble, { x: geo.seedX, y: geo.seedY, width: 20, height: 20, opacity: 1 });
        const destination = seedMass(geo);
        timeline.to(mass.current, { ...destination, duration: 0.45, ease: "back.out(1.5)" }, 0);
        timeline.to(neck.current, { width: 0, duration: 0.1 }, 0.17);
        timeline.to(goo.current, { opacity: 0, duration: 0.1 }, 0.26);
      }
      timeline.to(bubble, { x: geo.x, y: geo.y, width: geo.width, height: geo.height, opacity: 1, duration: travel ? 0.32 : 0.45, ease: travel ? "power3.inOut" : "back.out(1.5)" }, 0);
      timeline.fromTo(text.current, { opacity: 0, filter: "blur(4px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2 }, 0.12);
      timeline.call(wipe);
    });
    const scheduleHide = () => { clearTimeout(timer); timer = setTimeout(() => hide(), 120); };
    const find = (event: Event) => event.target instanceof Element ? event.target.closest<HTMLElement>("[data-morph-tooltip]") : null;
    const over = (event: PointerEvent) => { if (event.pointerType === "touch") return; const target = find(event); if (target) show(target); };
    const out = (event: PointerEvent) => {
      const target = find(event);
      if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
      if (document.activeElement !== target) scheduleHide();
    };
    const focus = (event: FocusEvent) => { const target = find(event); if (target) show(target); };
    const blur = () => scheduleHide();
    const dismiss = () => hide(true);
    const scroll = () => {
      if (!active) return;
      if (!active.matches(":hover") && document.activeElement !== active) { hide(true); return; }
      const geo = geometry(active);
      timeline?.kill(); wipe();
      gsap.set(bubble, { x: geo.x, y: geo.y, width: geo.width, height: geo.height, opacity: 1 });
      gsap.set(text.current, { opacity: 1, filter: "blur(0px)" });
    };
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") hide(true); };
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    document.addEventListener("focusin", focus);
    document.addEventListener("focusout", blur);
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", scroll, true);
    const keepOpen = () => clearTimeout(timer);
    bubble.addEventListener("pointerenter", keepOpen);
    bubble.addEventListener("pointerleave", scheduleHide);
    return () => {
      clearTimeout(timer); timeline?.kill();
      if (active) describe(active, false);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("focusout", blur);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", scroll, true);
      bubble.removeEventListener("pointerleave", scheduleHide);
      bubble.removeEventListener("pointerenter", keepOpen);
    };
  }, { dependencies: [mounted, id], revertOnUpdate: true });

  if (!mounted) return null;
  return createPortal(<>
    <svg width="0" height="0" aria-hidden="true" className="mtt_filter_svg"><defs><filter id={`${id}-goo`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" /><feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" /><feComposite in="SourceGraphic" operator="atop" /></filter></defs></svg>
    <div className="mtt_goo" ref={goo} style={{ filter: `url(#${id}-goo)` }} aria-hidden="true"><span ref={plate} /><span ref={mass} /><span ref={neck} /></div>
    <div className="mtt_tooltip" ref={root} id={id} role="tooltip" aria-hidden="true"><span ref={text} className="mtt_tooltip_text" aria-hidden="true" /><span ref={accessibleText} className="mtt_sr" /></div>
    <span className="mtt_measure" ref={measure} aria-hidden="true" />
  </>, document.body);
}
