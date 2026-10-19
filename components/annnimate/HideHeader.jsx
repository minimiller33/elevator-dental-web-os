'use client';

// Annnimate Hide Header adapted to preserve Elevator's grid, links and keyboard focus.
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './hide-header.css';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function HideHeader({ className = '', children, threshold = 70, duration = 0.35, ease = 'expo.out' }) {
  const headerRef = useRef(null);
  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      let anchor = window.scrollY;
      let hidden = false;
      const show = () => { hidden = false; gsap.to(header, { yPercent: 0, duration, ease, overwrite: 'auto' }); };
      header.addEventListener('focusin', show);
      const trigger = ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: self => {
          const current = self.scroll();
          if (current < 100 || header.contains(document.activeElement)) {
            if (hidden) show();
            anchor = current;
            return;
          }
          if (Math.abs(current - anchor) < threshold) return;
          const nextHidden = current > anchor;
          if (nextHidden !== hidden) {
            hidden = nextHidden;
            gsap.to(header, { yPercent: hidden ? -100 : 0, duration, ease, overwrite: 'auto' });
          }
          anchor = current;
        },
      });
      return () => { header.removeEventListener('focusin', show); trigger.kill(); gsap.killTweensOf(header); };
    });
    return () => mm.revert();
  }, { scope: headerRef, dependencies: [threshold, duration, ease], revertOnUpdate: true });
  return <header ref={headerRef} className={className} data-anm-hide-header>{children}</header>;
}
