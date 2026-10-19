"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, FileText, MapPin, MessageCircle, Pause, Play, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { ElevatorMascot } from "@/components/ElevatorMascot";

const STORY_CYCLE_MS = 11200;
const ROUTES = [
  { id: "source-guide", delay: 0, duration: 1500 },
  { id: "guide-web", delay: 550, duration: 2100 },
  { id: "guide-mail-0", delay: 300, duration: 1800 },
  { id: "guide-mail-1", delay: 950, duration: 1900 },
  { id: "guide-mail-2", delay: 1600, duration: 1900 },
  { id: "web-logo-0", delay: 1700, duration: 2600 },
  { id: "web-logo-1", delay: 3400, duration: 2600 },
  { id: "web-logo-2", delay: 5100, duration: 2600 },
  { id: "web-logo-3", delay: 6800, duration: 2600 },
  { id: "logos-people", delay: 8300, duration: 1800 },
] as const;

export function ElevatorStoryWidget() {
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [hasPlayed, setHasPlayed] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const animations = useRef<Animation[]>([]);
  const inView = useRef(false);
  const stateRef = useRef<"idle" | "playing" | "paused">("idle");
  const cycleRef = useRef<() => void>(() => {});
  const remaining = useRef(0);
  const finishAt = useRef(0);

  const measureRoutes = useCallback(() => {
    const root = stage.current;
    if (!root) return;
    const source = root.querySelector<HTMLElement>(".er-story__source");
    const guide = root.querySelector<HTMLElement>(".er-story__guide-orb");
    const preview = root.querySelector<HTMLElement>(".er-story__preview");
    const destinations = root.querySelector<HTMLElement>(".er-story__destinations");
    const people = root.querySelector<HTMLElement>(".er-story__people");
    const mails = root.querySelectorAll<HTMLElement>(".er-story__mail");
    const logos = root.querySelectorAll<HTMLElement>(".er-story__destinations img");
    if (!source || !guide || !preview || !destinations || !people || mails.length !== 3 || logos.length !== 4) return;

    const stageBox = root.getBoundingClientRect();
    const mobile = window.matchMedia("(max-width: 600px)").matches;
    const point = (element: Element, side: "left" | "right" | "top" | "bottom" | "center") => {
      const box = element.getBoundingClientRect();
      const x = side === "left" ? box.left : side === "right" ? box.right : box.left + box.width / 2;
      const y = side === "top" ? box.top : side === "bottom" ? box.bottom : box.top + box.height / 2;
      return { x: x - stageBox.left, y: y - stageBox.top };
    };
    const curve = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const vertical = Math.abs(to.y - from.y) > Math.abs(to.x - from.x) * .85;
      return vertical
        ? `M ${from.x} ${from.y} C ${from.x} ${from.y + (to.y - from.y) * .45}, ${to.x} ${to.y - (to.y - from.y) * .45}, ${to.x} ${to.y}`
        : `M ${from.x} ${from.y} C ${from.x + (to.x - from.x) * .45} ${from.y}, ${to.x - (to.x - from.x) * .45} ${to.y}, ${to.x} ${to.y}`;
    };
    const paths: Record<string, string> = {
      "source-guide": curve(point(source, "right"), point(guide, "left")),
      "guide-web": curve(point(guide, mobile ? "bottom" : "right"), point(preview, mobile ? "top" : "left")),
      "logos-people": curve(point(destinations, mobile ? "bottom" : "right"), point(people, mobile ? "top" : "left")),
    };
    mails.forEach((mail, index) => { paths[`guide-mail-${index}`] = curve(point(guide, "center"), point(mail, "center")); });
    logos.forEach((logo, index) => { paths[`web-logo-${index}`] = curve(point(preview, mobile ? "bottom" : "right"), point(logo, "center")); });
    ROUTES.forEach(({ id }) => root.querySelector<SVGPathElement>(`[data-route="${id}"]`)?.setAttribute("d", paths[id]));
  }, []);

  const setPlaybackState = useCallback((next: "idle" | "playing" | "paused") => {
    stateRef.current = next;
    setState(next);
  }, []);

  const clearAnimation = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
  }, []);

  const stop = useCallback(() => {
    clearAnimation();
    setPlaybackState("idle");
  }, [clearAnimation, setPlaybackState]);

  const nextCycle = useCallback(() => {
    if (stateRef.current !== "playing") return;
    clearAnimation();
    if (inView.current && !document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cycleRef.current();
    } else {
      setPlaybackState("idle");
    }
  }, [clearAnimation, setPlaybackState]);

  const start = useCallback(() => {
    if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = stage.current;
    const preview = root?.querySelector<HTMLElement>(".er-story__preview");
    const cards = root?.querySelectorAll<HTMLElement>(".er-story__flight");
    const logos = root?.querySelectorAll<HTMLElement>(".er-story__destinations img");
    if (!root || !preview || !cards || !logos || cards.length !== 4 || logos.length !== 4) return;

    clearAnimation();
    measureRoutes();
    setHasPlayed(true);
    const stageBox = root.getBoundingClientRect();
    const previewBox = preview.getBoundingClientRect();
    const mobile = window.matchMedia("(max-width: 600px)").matches;
    const originX = (mobile ? previewBox.left + previewBox.width / 2 : previewBox.right - 8) - stageBox.left;
    const originY = (mobile ? previewBox.bottom - 12 : previewBox.top + previewBox.height / 2) - stageBox.top;

    cards.forEach((card, index) => {
      const logoBox = logos[index].getBoundingClientRect();
      const cardBox = card.getBoundingClientRect();
      const deltaX = logoBox.left + logoBox.width / 2 - stageBox.left - originX;
      const deltaY = logoBox.top + logoBox.height / 2 - stageBox.top - originY;
      card.style.left = `${originX - cardBox.width / 2}px`;
      card.style.top = `${originY - cardBox.height / 2}px`;
      animations.current.push(card.animate([
        { opacity: 0, transform: "translate(0px, 0px) scale(.7)", offset: 0 },
        { opacity: 1, transform: "translate(0px, 0px) scale(1)", offset: .1 },
        { opacity: 1, transform: `translate(${deltaX * .55}px, ${deltaY * .55 - 18}px) scale(1.05)`, offset: .52 },
        { opacity: 1, transform: `translate(${deltaX}px, ${deltaY}px) scale(.68)`, offset: .86 },
        { opacity: 0, transform: `translate(${deltaX}px, ${deltaY}px) scale(.5)`, offset: 1 },
      ], { duration: 2600, delay: 500 + index * 1700, easing: "cubic-bezier(.24,.68,.25,1)", fill: "both" }));
      const tile = logos[index].parentElement;
      if (tile) animations.current.push(tile.animate([
        { backgroundColor: "#fff", boxShadow: "0 0 0 0 #0071e300" },
        { backgroundColor: "#eaf3ff", boxShadow: "0 0 0 8px #0071e326" },
        { backgroundColor: "#fff", boxShadow: "0 0 0 0 #0071e300" },
      ], { duration: 850, delay: 2650 + index * 1700, fill: "both" }));
    });
    ROUTES.forEach(({ id, delay, duration }) => {
      const path = root.querySelector<SVGPathElement>(`[data-route="${id}"]`);
      const pulse = root.querySelector<SVGCircleElement>(`[data-pulse="${id}"]`);
      if (!path || !pulse || !path.getTotalLength()) return;
      const length = path.getTotalLength();
      const frames = Array.from({ length: 21 }, (_, index) => {
        const progress = index / 20;
        const position = path.getPointAtLength(length * progress);
        return { transform: `translate(${position.x}px, ${position.y}px)`, opacity: progress < .08 || progress > .94 ? 0 : 1, offset: progress };
      });
      animations.current.push(pulse.animate(frames, { duration, delay, easing: "linear", fill: "both" }));
    });
    setPlaybackState("playing");
    remaining.current = STORY_CYCLE_MS;
    finishAt.current = performance.now() + remaining.current;
    timer.current = window.setTimeout(nextCycle, remaining.current);
  }, [clearAnimation, measureRoutes, nextCycle, setPlaybackState]);

  useEffect(() => {
    cycleRef.current = start;
  }, [start]);

  useEffect(() => {
    measureRoutes();
    const onResize = () => {
      measureRoutes();
      if (stateRef.current === "playing") start();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureRoutes, start]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => {
      inView.current = entry.intersectionRatio >= .2;
      if (entry.intersectionRatio < .2 && stateRef.current !== "idle") stop();
      if (entry.intersectionRatio >= .65 && stateRef.current === "idle" && !preference.matches && !document.hidden) start();
    }, { threshold: [0, .2, .65] });
    if (stage.current) observer.observe(stage.current);
    const onPreferenceChange = () => {
      if (preference.matches) stop();
      else if (inView.current && stateRef.current === "idle" && !document.hidden) start();
    };
    const onVisibilityChange = () => {
      if (document.hidden && stateRef.current !== "idle") stop();
      else if (!document.hidden && inView.current && stateRef.current === "idle" && !preference.matches) start();
    };
    preference.addEventListener("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearAnimation();
    };
  }, [clearAnimation, start, stop]);

  const toggle = () => {
    if (state === "idle") return start();
    if (state === "playing") {
      animations.current.forEach((animation) => animation.pause());
      remaining.current = Math.max(0, finishAt.current - performance.now());
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
      setPlaybackState("paused");
      return;
    }
    animations.current.forEach((animation) => animation.play());
    finishAt.current = performance.now() + remaining.current;
    timer.current = window.setTimeout(nextCycle, remaining.current);
    setPlaybackState("playing");
  };

  return <section className="er-story" id="historia" aria-labelledby="er-story-title">
    <div className="er-story__heading">
      <div><p className="er-label">Tu clínica, presente en internet</p><h2 id="er-story-title">Tú atiendes a tus pacientes.<br /><span>Elevator lleva tu clínica más lejos en internet.</span></h2></div>
      <p>Elevator reúne tratamientos, equipo, ubicación y contacto en tu web, y trabaja sus siguientes mejoras para que esa información sea clara también para buscadores y asistentes.</p>
    </div>
    <div className="er-story__controls"><span>Mira el recorrido</span><button type="button" onClick={toggle} aria-label={state === "playing" ? "Pausar la animación" : state === "paused" ? "Reanudar la animación" : "Reproducir la animación"}>{state === "playing" ? <Pause size={17} /> : state === "paused" ? <Play size={17} /> : hasPlayed ? <RotateCcw size={17} /> : <Play size={17} />}{state === "playing" ? "Pausar" : state === "paused" ? "Reanudar" : hasPlayed ? "Repetir animación" : "Reproducir animación"}</button><span className="er-story__reduced-note">Movimiento reducido activo: la escena se muestra sin animación.</span></div>
    <div className="er-story__stage" data-playing={state === "playing"} data-state={state} ref={stage} role="img" aria-label="Historia ilustrada: una doctora atiende; Elevator reúne tratamientos, ubicación y respuestas en la web; buscadores y asistentes pueden mostrar esa información a personas que buscan atención dental.">
      <svg className="er-story__routes" aria-hidden="true" focusable="false">{ROUTES.map(({ id }) => <g key={id}><path className="er-story__route" data-route={id} /><circle className="er-story__pulse" data-pulse={id} r="4" /></g>)}</svg>
      <div className="er-story__source" aria-hidden="true">
        <Image src="/visual/dental-calm.webp" alt="" width={320} height={360} unoptimized />
        <span>Tú atiendes</span>
      </div>
      <div className="er-story__guide" aria-hidden="true"><div className="er-story__guide-orb"><ElevatorMascot /></div><span>Elevator en acción</span></div>
      <div className="er-story__preview" aria-hidden="true">
        <div className="er-story__browser"><i /><i /><i /><span>Tu clínica dental</span></div>
        <div className="er-story__preview-body"><small>ODONTOLOGÍA · TU CIUDAD</small><strong>Una web clara<br />para tu clínica.</strong><p>Tratamientos, equipo y contacto en un solo lugar.</p>
          <div className="er-story__layers"><span>Tratamientos</span><span>Equipo profesional</span><span>Ubicación y contacto</span></div>
        </div>
      </div>
      <div className="er-story__mail er-story__mail--one" aria-hidden="true"><FileText size={14} /><span>Tratamientos</span></div>
      <div className="er-story__mail er-story__mail--two" aria-hidden="true"><MapPin size={14} /><span>Ubicación</span></div>
      <div className="er-story__mail er-story__mail--three" aria-hidden="true"><MessageCircle size={14} /><span>Respuestas</span></div>
      <div className="er-story__flight" aria-hidden="true"><FileText size={14} /><span>Tu web</span></div>
      <div className="er-story__flight" aria-hidden="true"><FileText size={14} /><span>Tratamientos</span></div>
      <div className="er-story__flight" aria-hidden="true"><MapPin size={14} /><span>Ubicación</span></div>
      <div className="er-story__flight" aria-hidden="true"><MessageCircle size={14} /><span>Respuestas</span></div>
      <div className="er-story__destinations" aria-hidden="true"><strong>Para buscadores y asistentes</strong><div>{[{ name: "Google", logo: "/logos/platforms/google.svg" }, { name: "ChatGPT", logo: "/logos/platforms/chatgpt.svg" }, { name: "Claude", logo: "/logos/platforms/claude.svg" }, { name: "Gemini", logo: "/logos/platforms/gemini.svg" }].map(({ name, logo }) => <span key={name}><Image src={logo} alt="" width={22} height={22} /><small>{name}</small></span>)}</div></div>
      <div className="er-story__people" aria-hidden="true"><div><span><UserRound size={25} strokeWidth={1.5} /></span><span><UserRound size={25} strokeWidth={1.5} /></span></div><span className="er-story__people-copy"><strong>Personas que buscan</strong><small>información dental</small></span></div>
      <div className="er-story__care" aria-hidden="true"><Sparkles size={18} /><span><strong>Membership</strong><small>Elevator sigue mejorando la web</small></span></div>
    </div>
    <div className="er-story__foot"><p><strong>Dental Web</strong> construye la base <ArrowRight size={15} aria-hidden="true" /> <strong>Membership</strong> la mejora sin que coordines cada ajuste. <span>Recorrido ilustrativo de la información. Cada plataforma selecciona qué muestra a las personas.</span></p></div>
  </section>;
}
