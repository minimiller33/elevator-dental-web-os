"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const palette = ["#1858FB", "#18BAFB", "#42E8A1"];
const Orb = dynamic(() => import("./LiveOrb").then(module => module.LiveOrb), { ssr: false });

// Keep the artwork's space and colors in the initial HTML. Compile the shader
// only after the page has loaded and the browser has had time to paint its text.
export function DeferredHeroOrb() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let idle: number | undefined;
    const start = () => {
      timer = setTimeout(() => {
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setActive(true), { timeout: 1500 });
        else setActive(true);
      }, 800);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.removeEventListener("load", start);
    };
  }, []);

  return active ? <Orb className="edw-live-orb__hero" size={540} variant="webgl" colors={palette} />
    : <div className="edw-live-orb edw-live-orb__hero" style={{ width: 540, height: 540 }} aria-hidden="true">
      <div className="edw-live-orb__fallback" style={{ backgroundImage: "linear-gradient(135deg, #1858FB, #18BAFB, #42E8A1)" }} />
    </div>;
}
