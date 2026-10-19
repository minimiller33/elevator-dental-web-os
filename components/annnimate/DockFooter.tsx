"use client";

import JigglyButton from "@/components/annnimate/JigglyButton";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUp, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import "./dock-footer.css";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

const columns = [
  { title: "Elevator Dental Web", links: [["Tu web", "#web"], ["Información y confianza", "#claridad"]] },
  { title: "Membership", links: [["Operación continua", "#membership"], ["Cómo trabajamos", "#continuidad"], ["Alcance del servicio", "#inversion"]] },
  { title: "El siguiente paso", links: [["Diagnóstico gratuito", "/diagnostico-seo"], ["Revisar mi clínica", "#contacto"], ["Preguntas frecuentes", "#preguntas"]] },
];
const navigation = [["Tu web dental", "#web"], ["Membership", "#membership"], ["Diagnóstico gratis", "/diagnostico-seo"], ["Cómo trabajamos", "#continuidad"], ["Hablemos", "#contacto"]];

// Adapted from the supplied Annnimate DockFooter: expanding glass dock,
// staggered reveals and rolling characters, using the landing's light palette.
export default function DockFooter({ internal = false }: { internal?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const restoreFocus = useRef(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".df_reveal_inner", { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.035, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 85%", once: true } });
    });
    return () => mm.revert();
  }, { scope: root });

  useGSAP(() => {
    if (!dock.current || !panel.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const width = open ? Math.min(400, window.innerWidth - 40) : 182;
    const height = open ? panel.current.offsetHeight : 54;
    gsap.to(dock.current, { width, height, borderRadius: open ? 28 : 999, duration: reduced ? 0 : 0.6, ease: open ? "back.out(1.2)" : "power3.inOut", overwrite: true });
    if (open) {
      gsap.fromTo(".df_nav_link", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: reduced ? 0 : 0.55, stagger: reduced ? 0 : 0.045, delay: reduced ? 0 : 0.18, ease: "power3.out" });
      closer.current?.focus({ preventScroll: true });
    } else if (restoreFocus.current) {
      opener.current?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
    const resize = () => {
      if (dock.current && panel.current) gsap.set(dock.current, { width: open ? Math.min(400, window.innerWidth - 40) : 182, height: open ? panel.current.offsetHeight : 54 });
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, { scope: root, dependencies: [open], revertOnUpdate: true });

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!dock.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { restoreFocus.current = true; setOpen(false); }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", escape); };
  }, [open]);

  const resolveHref = (href: string) => internal && href.startsWith("#") ? (href === "#inicio" ? "/" : `/${href}`) : href;
  const backToTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  return <footer ref={root} className="df_section" id="footer" data-anm-dock-footer="">
    <div className="df_bg" aria-hidden="true"><div className="df_bg_img" /><div className="df_bg_scrim" /></div>
    <div className="df_inner">
      <div className="df_grid">
        <div className="df_brand">
          <div className="df_reveal_mask df_brand_mark"><a href={resolveHref("#inicio")} className="df_brand_logo df_reveal_inner" aria-label="Elevator Dental Web, inicio"><BrandMark tone="dark" product="DENTAL WEB" /></a></div>
          <div className="df_reveal_mask"><h2 className="df_brand_headline df_reveal_inner">Tu clínica. <br />Una presencia <br />que da confianza.</h2></div>
          <div className="df_reveal_mask"><p className="df_brand_body df_reveal_inner">Diseñamos y operamos webs para clínicas dentales. Una base clara, cuidada y preparada para seguir mejorando.</p></div>
        </div>
        <div className="df_cols">{columns.map(column => <div key={column.title}><div className="df_reveal_mask"><h3 className="df_col_head df_reveal_inner">{column.title}</h3></div><ul className="df_col_list">{column.links.map(([label, href]) => <li key={href} className="df_reveal_mask"><a className="df_col_link df_reveal_inner" href={resolveHref(href)}>{label}</a></li>)}</ul></div>)}</div>
      </div>
      <div className="df_stage">
        <div className="df_dock" ref={dock} data-open={open}>
          <div className="df_dock_pill" inert={open} aria-hidden={open}><span className="df_dock_label">Explorar</span><JigglyButton ref={opener} className="df_dock_btn" type="button" aria-label="Abrir navegación rápida" data-morph-tooltip="Explora las secciones de Elevator" aria-expanded={open} aria-controls="footer-navigation" onClick={() => setOpen(true)}><Menu size={16} /></JigglyButton><JigglyButton className="df_dock_btn" type="button" aria-label="Volver al inicio" data-morph-tooltip="Vuelve al comienzo de la página" onClick={backToTop}><ArrowUp size={16} /></JigglyButton></div>
          <div ref={panel} id="footer-navigation" className="df_panel_content" inert={!open} aria-hidden={!open}>
            <div className="df_panel_head"><span className="df_panel_label">Explora Elevator</span><JigglyButton ref={closer} className="df_panel_close" type="button" aria-label="Cerrar navegación rápida" onClick={() => { restoreFocus.current = true; setOpen(false); }}><X size={16} /></JigglyButton></div>
            <nav aria-label="Navegación rápida"><ul className="df_nav_list">{navigation.map(([label, href]) => <li className="df_nav_item" key={href}><a className="df_nav_link" href={resolveHref(href)} onClick={() => setOpen(false)} onBlur={event => { if (!dock.current?.contains(event.relatedTarget as Node)) setOpen(false); }} aria-label={label}>{Array.from(label).map((char, index) => <span className={char === " " ? "df_char_space" : "df_char"} aria-hidden="true" key={index}><span className="df_char_inner" style={{ transitionDelay: `${index * 12}ms` }}><span className="df_char_face">{char}</span><span className="df_char_face_next">{char}</span></span></span>)}</a></li>)}</ul></nav>
            <JigglyButton className="df_panel_foot" type="button" onClick={() => { setOpen(false); backToTop(); }}><span>Volver al inicio</span><ArrowUp size={16} /></JigglyButton>
          </div>
        </div>
      </div>
      <div className="df_legal"><span>© 2026 Elevator Dental OS</span><span>La web dental que sigue trabajando.</span></div>
    </div>
  </footer>;
}
