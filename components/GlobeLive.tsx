"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

const markers = [
  { location: [37.78, -122.44] as [number, number], size: 0.025 },
  { location: [51.51, -0.13] as [number, number], size: 0.03 },
  { location: [35.68, 139.65] as [number, number], size: 0.025 },
  { location: [-33.87, 151.21] as [number, number], size: 0.025 },
  { location: [19.43, -99.13] as [number, number], size: 0.035 },
  { location: [-12.05, -77.04] as [number, number], size: 0.035 },
];

const routes = [
  { from: [37.78, -122.44] as [number, number], to: [40.71, -74.01] as [number, number], color: [0.12, 0.78, 1] as [number, number, number] },
  { from: [40.71, -74.01] as [number, number], to: [51.51, -0.13] as [number, number], color: [0.3, 0.88, 1] as [number, number, number] },
  { from: [51.51, -0.13] as [number, number], to: [35.68, 139.65] as [number, number], color: [0.12, 0.78, 1] as [number, number, number] },
  { from: [19.43, -99.13] as [number, number], to: [-12.05, -77.04] as [number, number], color: [0.26, 0.92, 0.72] as [number, number, number] },
  { from: [35.68, 139.65] as [number, number], to: [-33.87, 151.21] as [number, number], color: [0.3, 0.88, 1] as [number, number, number] },
];

const travelers = [
  { route: 0, progress: 0.08, speed: 0.0024 },
  { route: 1, progress: 0.47, speed: 0.0018 },
  { route: 2, progress: 0.76, speed: 0.0015 },
  { route: 3, progress: 0.24, speed: 0.0021 },
  { route: 4, progress: 0.62, speed: 0.0017 },
];

function pointAlongRoute(from: [number, number], to: [number, number], progress: number): [number, number] {
  const radians = Math.PI / 180;
  const toVector = ([latitude, longitude]: [number, number]) => {
    const lat = latitude * radians;
    const lon = longitude * radians;
    return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
  };
  const a = toVector(from);
  const b = toVector(to);
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const angle = Math.acos(dot);
  const sinAngle = Math.sin(angle);
  const left = sinAngle < 1e-6 ? 1 - progress : Math.sin((1 - progress) * angle) / sinAngle;
  const right = sinAngle < 1e-6 ? progress : Math.sin(progress * angle) / sinAngle;
  const x = left * a[0] + right * b[0];
  const y = left * a[1] + right * b[1];
  const z = left * a[2] + right * b[2];
  return [Math.atan2(y, Math.hypot(x, z)) / radians, Math.atan2(z, x) / radians];
}

export function GlobeLive() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const committedOffset = useRef({ phi: 0, theta: 0 });
  const paused = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe: ReturnType<typeof createGlobe> | undefined;
    let frame = 0;
    let phi = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onPointerMove = (event: PointerEvent) => {
      if (!dragStart.current) return;
      dragOffset.current = {
        phi: (event.clientX - dragStart.current.x) / 300,
        theta: (event.clientY - dragStart.current.y) / 1000,
      };
    };
    const onPointerDown = (event: PointerEvent) => {
      dragStart.current = { x: event.clientX, y: event.clientY };
      paused.current = true;
      canvas.style.cursor = "grabbing";
    };
    const onPointerUp = () => {
      if (!dragStart.current) return;
      committedOffset.current.phi += dragOffset.current.phi;
      committedOffset.current.theta += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
      dragStart.current = null;
      paused.current = false;
      canvas.style.cursor = "grab";
    };

    const initialize = () => {
      const width = Math.round(canvas.getBoundingClientRect().width);
      if (!width) return;
      if (globe) {
        globe.update({ width, height: width });
        return;
      }
      try {
        globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.18,
        dark: 0.06,
        diffuse: 1.25,
        mapSamples: 12000,
        mapBrightness: 5.2,
        baseColor: [0.035, 0.08, 0.2],
        markerColor: [0.094, 0.73, 0.984],
        glowColor: [0.094, 0.345, 0.984],
        markerElevation: 0.035,
        markers: [...markers, ...travelers.map(({ route, progress }) => ({
          location: pointAlongRoute(routes[route].from, routes[route].to, progress),
          size: 0.045,
          color: [0.75, 0.98, 1] as [number, number, number],
        }))],
        arcs: routes,
        arcColor: [0.16, 0.84, 1],
        arcWidth: 0.58,
        arcHeight: 0.24,
        });
      } catch {
        return;
      }

      const animate = () => {
        if (!paused.current && !reducedMotion) {
          phi += 0.0022;
          travelers.forEach((traveler) => {
            traveler.progress += traveler.speed;
            if (traveler.progress > 1) traveler.progress -= 1;
          });
        }
        globe?.update({
          phi: phi + committedOffset.current.phi + dragOffset.current.phi,
          theta: 0.18 + committedOffset.current.theta + dragOffset.current.theta,
          markers: [...markers, ...travelers.map(({ route, progress }) => ({
            location: pointAlongRoute(routes[route].from, routes[route].to, progress),
            size: 0.045,
            color: [0.75, 0.98, 1] as [number, number, number],
          }))],
        });
        if (!reducedMotion) frame = requestAnimationFrame(animate);
      };
      canvas.style.opacity = "1";
      animate();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });

    const observer = new ResizeObserver(initialize);
    observer.observe(canvas);
    initialize();

    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      cancelAnimationFrame(frame);
      globe?.destroy();
    };
  }, []);

  return (
    <div className="edw-globe" aria-label="Globo interactivo que representa la búsqueda digital">
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="edw-globe__caption">SEO + AEO<br />ODONTOLOGÍA</span>
      <span className="edw-globe__legend"><i /> BÚSQUEDA EN MOVIMIENTO</span>
    </div>
  );
}
