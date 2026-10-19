"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "./Icons";

export function MobileExperience() {
  const dockRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const loopItems = Array.from(document.querySelectorAll<HTMLElement>("[data-loop]"));

    root.classList.add("experience-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: reducedMotion ? 0 : 0.12, rootMargin: "0px 0px -7%" },
    );

    for (const item of revealItems) observer.observe(item);

    const loopObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).classList.toggle("is-in-view", entry.isIntersecting);
        }
      },
      { threshold: 0.06, rootMargin: "12% 0px 12%" },
    );

    for (const item of loopItems) loopObserver.observe(item);

    let frame = 0;
    const updateScrollUI = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
        root.style.setProperty("--page-progress", progress.toFixed(4));
        root.classList.toggle("page-scrolled", window.scrollY > window.innerHeight * 0.55);

        const contact = document.getElementById("contacto");
        const contactVisible = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.82 : false;
        dockRef.current?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.55 && !contactVisible);
      });
    };

    updateScrollUI();
    window.addEventListener("scroll", updateScrollUI, { passive: true });
    window.addEventListener("resize", updateScrollUI);

    return () => {
      observer.disconnect();
      loopObserver.disconnect();
      for (const item of loopItems) item.classList.remove("is-in-view");
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollUI);
      window.removeEventListener("resize", updateScrollUI);
      root.classList.remove("experience-ready");
      root.classList.remove("page-scrolled");
      root.style.removeProperty("--page-progress");
    };
  }, []);

  return (
    <>
      <div className="page-progress" aria-hidden="true"><span /></div>
      <div className="page-floor-rail" aria-hidden="true">
        <small>RECORRIDO</small>
        <div><i /><i /><i /><i /><i /><i /><i /></div>
        <span>⌃</span>
      </div>
      <a className="mobile-cta-dock" ref={dockRef} href="#contacto">
        <span><small>ELEVATOR DENTAL WEB</small><strong>Atraer pacientes ideales</strong></span>
        <i><ArrowUpRight /></i>
      </a>
    </>
  );
}
