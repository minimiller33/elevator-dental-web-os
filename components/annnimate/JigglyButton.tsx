"use client";

import { forwardRef, useImperativeHandle, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import "./jiggly-button.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, CustomEase);
  CustomEase.create("elevatorJelly", "M0,0 C0.3,0.9 0.1,1 1,1");
}
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { href?: string };

// Annnimate's area-preserving squash, delayed width and counter-scaled label.
// The anchor variant keeps native navigation, including modified clicks.
const JigglyButton = forwardRef<HTMLButtonElement, Props>(function JigglyButton({ href, children, className = "", type = "button", ...props }, forwardedRef) {
  const root = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useImperativeHandle(forwardedRef, () => root.current!);

  useGSAP((_, contextSafe) => {
    const button = root.current;
    const text = label.current;
    if (!button || !text || !contextSafe) return;
    let down = false;
    let motion: gsap.core.Timeline | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => { motion?.kill(); motion = null; };
    const pose = (timeline: gsap.core.Timeline, sy: number, at: number, duration: number, ease: string, lag: number) => {
      const sx = 1 / sy;
      timeline.to(button, { scaleY: sy, duration, ease }, at);
      timeline.to(button, { scaleX: sx, duration: duration + lag, ease }, at + lag);
      timeline.to(text, { scaleX: 1 + (1 / sx - 1) * 0.6, scaleY: 1 + (1 / sy - 1) * 0.6, duration: duration + lag, ease }, at);
      return at + duration + lag;
    };
    const rest = () => { stop(); down = false; gsap.set([button, text], { scaleX: 1, scaleY: 1 }); };
    const press = contextSafe(() => {
      if (down || button.matches(":disabled")) return;
      down = true;
      stop();
      if (reduced.matches) return;
      motion = gsap.timeline();
      pose(motion, 1 - 0.3 * 0.55, 0, 0.14, "elevatorJelly", 0.05);
    });
    const release = contextSafe(() => {
      if (!down) return;
      down = false;
      stop();
      if (reduced.matches) { rest(); return; }
      motion = gsap.timeline();
      const apex = pose(motion, 1 + 0.24 * 0.5, 0, 0.13, "elevatorJelly", 0.04);
      pose(motion, 1, apex, 0.9, "elastic.out(1.7,0.4)", 0.06);
    });
    const poke = contextSafe((event: PointerEvent) => {
      if (event.pointerType === "touch" || reduced.matches || down || motion?.isActive() || button.matches(":disabled")) return;
      const box = button.getBoundingClientRect();
      const dx = Math.min(event.clientX - box.left, box.right - event.clientX) / box.width;
      const dy = Math.min(event.clientY - box.top, box.bottom - event.clientY) / box.height;
      const speed = Math.min(1, Math.hypot(event.movementX || 0, event.movementY || 0) / 30);
      const amount = 0.1 * (0.4 + 0.6 * speed) * (event.type === "pointerleave" ? 0.5 : 1);
      stop();
      motion = gsap.timeline();
      const apex = pose(motion, dy < dx ? 1 - amount : 1 + amount, 0, 0.12, "elevatorJelly", 0.04);
      pose(motion, 1, apex, 0.9, "elastic.out(1.7,0.4)", 0.06);
    });
    const pointerDown = (event: PointerEvent) => { if (event.button === 0) press(); };
    const leave = (event: PointerEvent) => { if (down) release(); else poke(event); };
    const keyDown = (event: KeyboardEvent) => { if (!event.repeat && (event.key === "Enter" || (!href && event.key === " "))) press(); };
    const keyUp = (event: KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") release(); };
    gsap.set(button, { transformOrigin: "50% 100%" });
    button.addEventListener("pointerdown", pointerDown);
    button.addEventListener("pointerenter", poke);
    button.addEventListener("pointerleave", leave);
    button.addEventListener("pointercancel", release);
    button.addEventListener("keydown", keyDown);
    button.addEventListener("keyup", keyUp);
    button.addEventListener("blur", release);
    window.addEventListener("pointerup", release);
    reduced.addEventListener("change", rest);
    return () => {
      stop();
      button.removeEventListener("pointerdown", pointerDown);
      button.removeEventListener("pointerenter", poke);
      button.removeEventListener("pointerleave", leave);
      button.removeEventListener("pointercancel", release);
      button.removeEventListener("keydown", keyDown);
      button.removeEventListener("keyup", keyUp);
      button.removeEventListener("blur", release);
      window.removeEventListener("pointerup", release);
      reduced.removeEventListener("change", rest);
    };
  }, { scope: root, dependencies: [href] });

  const content = <span className="jb_text" ref={label}>{children}</span>;
  if (href) return <a {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} ref={root} href={href} className={`jb_button ${className}`}>{content}</a>;
  return <button {...props} ref={root} type={type} className={`jb_button ${className}`}>{content}</button>;
});
export default JigglyButton;
