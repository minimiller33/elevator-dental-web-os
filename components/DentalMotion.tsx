"use client";

// Element Reveal choreography using the GSAP runtime already used by Annnimate.
// Text remains visible in SSR and reduced-motion mode; no entire section is hidden.
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

export function DentalMotion() {
  useGSAP(() => {
    const root = document.querySelector(".edw-studio");
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      root.querySelectorAll<HTMLElement>("[data-edw-stagger]").forEach(group => {
        gsap.from(group.children, {
          opacity: 0, y: 10, duration: .8, stagger: .14, ease: "power2.out",
          scrollTrigger: { trigger: group, start: "clamp(top 88%)", once: true },
        });
      });
      root.querySelectorAll<HTMLElement>("[data-edw-item]").forEach(item => {
        gsap.from(item, {
          opacity: 0, y: 8, duration: .8, ease: "power2.out",
          scrollTrigger: { trigger: item, start: "clamp(top 90%)", once: true },
        });
      });
    });
    return () => mm.revert();
  }, []);
  return null;
}
