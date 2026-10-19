"use client";

// Adapted from the user's Annnimate FocusText: word-sized corner brackets,
// directional corner trail and distance-based softening. This landing uses a
// compact hover treatment with a single entrance demo, without a tall track.
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import styles from "./FocusText.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("elevatorFocus", "M0,0 C0.3,0.9 0.1,1 1,1");
}

type FocusTextProps = { text: string; id?: string; className?: string };
type WordBox = { x: number; y: number; width: number; height: number };

export default function FocusText({ text, id, className = "" }: FocusTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    const root = rootRef.current;
    const heading = textRef.current;
    if (!root || !heading) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      let disposed = false;
      let split: SplitText | undefined;
      let words: HTMLElement[] = [];
      let boxes: WordBox[] = [];
      let corners: HTMLSpanElement[] = [];
      let frame: HTMLSpanElement | undefined;
      let glide: gsap.core.Tween | undefined;
      let demo: gsap.core.Timeline | undefined;
      let trigger: ScrollTrigger | undefined;
      let observer: ResizeObserver | undefined;
      let resizeTimer: ReturnType<typeof setTimeout> | undefined;
      let current = -1;
      let cornerSize = 0;
      let hovering = false;
      const duration = .35;

      function measure() {
        const ctx = document.createElement("canvas").getContext("2d");
        if (!ctx) return;
        const cs = getComputedStyle(heading!);
        const em = parseFloat(cs.fontSize);
        const pad = em * .08;
        const spacing = parseFloat(cs.letterSpacing) || 0;
        cornerSize = em * .2;
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        root!.style.setProperty("--focus-thickness", `${Math.max(1, Math.round(em * .04))}px`);
        root!.style.setProperty("--focus-corner", `${cornerSize}px`);
        boxes = words.map(word => {
          const metrics = ctx.measureText(word.textContent || "");
          const ascent = metrics.fontBoundingBoxAscent ?? em * .8;
          const descent = metrics.fontBoundingBoxDescent ?? em * .2;
          const baseline = word.offsetTop + (word.offsetHeight - ascent - descent) / 2 + ascent;
          const left = word.offsetLeft - metrics.actualBoundingBoxLeft;
          const right = word.offsetLeft + word.offsetWidth - spacing - (metrics.width - metrics.actualBoundingBoxRight);
          return { x: left - pad * 1.5, y: baseline - metrics.actualBoundingBoxAscent - pad, width: right - left + pad * 3, height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + pad * 2 };
        });
      }
      function x(index: number, corner: number) { return boxes[index].x + (corner % 2 ? boxes[index].width - cornerSize : 0); }
      function y(index: number, corner: number) { return boxes[index].y + (corner > 1 ? boxes[index].height - cornerSize : 0); }
      function place(index: number) {
        if (!boxes[index]) return;
        gsap.set(corners, { x: (corner: number) => x(index, corner), y: (corner: number) => y(index, corner), force3D: true });
      }
      function move(index: number, immediate = false) {
        if (!boxes[index] || index === current && !immediate) return;
        const previous = current;
        words.forEach((word, wordIndex) => {
          word.classList.toggle(styles.active, wordIndex === index);
          word.style.setProperty("--focus-distance", String(Math.min(1, Math.abs(wordIndex - index) / 3)));
        });
        current = index;
        glide?.kill();
        if (immediate) { place(index); return; }
        const dx = previous < 0 ? 0 : boxes[index].x - boxes[previous].x;
        glide = gsap.to(corners, { x: (corner: number) => x(index, corner), y: (corner: number) => y(index, corner), duration, ease: "elevatorFocus", force3D: true, stagger: corner => !dx || (dx > 0) === (corner % 2 === 1) ? 0 : .04 });
      }
      function onOver(event: PointerEvent) {
        if (event.pointerType === "touch") return;
        const index = words.indexOf(event.target as HTMLElement);
        if (index < 0) return;
        hovering = true;
        demo?.kill();
        move(index);
      }
      function onLeave() { hovering = false; if (words.length) move(Math.min(1, words.length - 1)); }
      function onVisibility() { if (document.hidden) { demo?.kill(); glide?.kill(); if (current >= 0) place(current); } }
      void document.fonts.ready.then(() => {
        if (disposed) return;
        split = SplitText.create(heading, { type: "words", wordsClass: styles.word, tag: "span", aria: "auto" });
        words = split.words as HTMLElement[];
        if (!words.length) return;
        frame = document.createElement("span");
        frame.className = styles.frame;
        frame.setAttribute("aria-hidden", "true");
        corners = [styles.topLeft, styles.topRight, styles.bottomLeft, styles.bottomRight].map(position => {
          const corner = document.createElement("span"); corner.className = `${styles.corner} ${position}`; frame!.appendChild(corner); return corner;
        });
        heading.appendChild(frame);
        measure();
        move(Math.min(1, words.length - 1), true);
        root.dataset.focusReady = "true";
        heading.addEventListener("pointerover", onOver);
        heading.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", onVisibility);
        observer = new ResizeObserver(() => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => { if (!disposed && words.length) { measure(); glide?.kill(); place(current); } }, 150);
        });
        observer.observe(heading);
        trigger = ScrollTrigger.create({ trigger: root, start: "top 85%", once: true, onEnter: () => {
          if (hovering || document.hidden) return;
          demo = gsap.timeline({ delay: .3 });
          demo.call(() => move(words.length - 1)).call(() => move(Math.min(1, words.length - 1)), [], "+=1");
        } });
      });
      return () => {
        disposed = true;
        clearTimeout(resizeTimer);
        observer?.disconnect();
        trigger?.kill(); demo?.kill(); glide?.kill();
        heading.removeEventListener("pointerover", onOver);
        heading.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("visibilitychange", onVisibility);
        frame?.remove(); split?.revert();
        delete root.dataset.focusReady;
        root.style.removeProperty("--focus-thickness");
        root.style.removeProperty("--focus-corner");
      };
    });
    return () => media.revert();
  }, { scope: rootRef, dependencies: [text], revertOnUpdate: true });

  return <div ref={rootRef} className={`${styles.root} ${className}`.trim()} data-anm-focus-text=""><h2 key={text} id={id} ref={textRef} className={styles.text} data-anm-ft-text="">{text}</h2></div>;
}
