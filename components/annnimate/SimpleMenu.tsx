"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FocusEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BrandMark } from "@/components/BrandMark";
import JigglyButton from "./JigglyButton";
import "./simple-menu.css";

const links = [
  { label: "El sistema", href: "#sistema" },
  { label: "Membership", href: "#membership" },
  { label: "Alcance", href: "#inversion" },
  { label: "Diagnóstico gratis", href: "/diagnostico-seo" },
];
const query = "(max-width: 768px)";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const mobileSnapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => false;

// The supplied Annnimate menu's fixed bar and sliding indicator, simplified
// to direct links and one compact mobile disclosure, without mega panels.
export default function SimpleMenu({ internal = false }: { internal?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const mobile = useSyncExternalStore(subscribe, mobileSnapshot, serverSnapshot);
  useGSAP(() => {
    const line = indicator.current;
    return () => { if (line) gsap.killTweensOf(line); };
  }, { scope: root });

  const moveIndicator = (target: HTMLElement) => {
    if (mobile || !nav.current) return;
    const box = target.getBoundingClientRect();
    const parent = nav.current.getBoundingClientRect();
    const style = getComputedStyle(target);
    const left = parseFloat(style.paddingLeft);
    const right = parseFloat(style.paddingRight);
    gsap.to(indicator.current, { x: box.left - parent.left + left, scaleX: box.width - left - right, opacity: 1, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.3, ease: "power3.out", overwrite: true });
  };
  const clearIndicator = () => {
    if (nav.current?.contains(document.activeElement)) return;
    gsap.to(indicator.current, { opacity: 0, duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.18, overwrite: true });
  };
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) burger.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open || !mobile) return;
    nav.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); close(true); } };
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close(Boolean(nav.current?.contains(document.activeElement)));
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    const media = window.matchMedia(query);
    const resize = () => { if (!media.matches) setOpen(false); };
    media.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      media.removeEventListener("change", resize);
    };
  }, [open, mobile]);

  const focusLeft = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) { setOpen(false); clearIndicator(); }
  };
  return <>
    <header className="mm_wrap" ref={root} data-mm-mobile-open={mobile && open} onBlurCapture={focusLeft}>
      <a className="mm_logo" href={internal ? "/" : "#inicio"} aria-label="Elevator Dental Web, inicio" onClick={() => close()}><BrandMark tone="dark" product="DENTAL WEB" /></a>
      <button className="mm_burger" ref={burger} type="button" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={mobile && open} aria-controls="elevator-main-menu" onClick={() => setOpen(value => !value)}><span className="mm_burger_line mm_burger_line_top" /><span className="mm_burger_line mm_burger_line_bottom" /></button>
      <nav className="mm_list_wrap" id="elevator-main-menu" aria-label="Navegación principal" ref={nav} inert={mobile && !open} aria-hidden={mobile && !open ? true : undefined} data-open={mobile && open} onMouseLeave={clearIndicator}>
        <div className="mm_panel_clip"><ul className="mm_list">{links.map(({ label, href }, index) => <li className="mm_item" key={href} style={{ transitionDelay: open ? `${index * 35}ms` : "0ms" }}><a className="mm_link" href={internal && href.startsWith("#") ? `/${href}` : href} onMouseEnter={event => moveIndicator(event.currentTarget)} onFocus={event => moveIndicator(event.currentTarget)} onClick={() => close()}>{label}<span className="mm_link_dot" aria-hidden="true" /></a></li>)}<li className="mm_mobile_action"><JigglyButton className="mm_cta" href={internal ? "/#contacto" : "#contacto"} onClick={() => close()}>Hablemos</JigglyButton></li></ul></div>
        <span ref={indicator} className="mm_indicator" aria-hidden="true" />
      </nav>
      <div className="mm_header_actions"><JigglyButton className="mm_cta" href={internal ? "/#contacto" : "#contacto"}>Hablemos</JigglyButton></div>
    </header>
    <div className="mm_scrim" data-open={mobile && open} aria-hidden="true" />
  </>;
}
