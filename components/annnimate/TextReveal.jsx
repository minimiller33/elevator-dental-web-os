'use client';

// Annnimate Text Reveal adapted for visible SSR text, scoped cleanup and responsive line splitting.
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import './text-reveal.css';

if (typeof window !== 'undefined') gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export default function TextReveal({ className = '', children, type = 'words', duration = 0.7, stagger = 0.035, start = 'top 85%', ease = 'expo.out' }) {
  const containerRef = useRef(null);
  useGSAP(() => {
    const root = containerRef.current;
    const target = root?.querySelector('h1, h2, h3') || root;
    if (!target) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      let finished = false;
      const split = SplitText.create(target, {
        type: type === 'lines' ? 'lines' : `lines,${type}`,
        linesClass: 'anm_split_line', wordsClass: 'anm_split_word', charsClass: 'anm_split_char',
        mask: 'lines', autoSplit: true, aria: 'auto', ignore: '.edw-heading-accent',
        onSplit: instance => {
          if (finished) return;
          const targets = type === 'words' ? [...instance.words, ...target.querySelectorAll('.edw-heading-accent')] : instance[type];
          return gsap.fromTo(targets, { yPercent: 105, opacity: 0 }, {
            yPercent: 0, opacity: 1, duration, stagger, ease,
            scrollTrigger: { trigger: root, start, once: true },
            onComplete: () => { finished = true; },
          });
        },
      });
      return () => split.revert();
    });
    return () => mm.revert();
  }, { scope: containerRef, dependencies: [type, duration, stagger, start, ease], revertOnUpdate: true });
  return <div ref={containerRef} className={`anm_text_reveal ${className}`.trim()} data-anm-scroll-text-reveal>{children}</div>;
}
