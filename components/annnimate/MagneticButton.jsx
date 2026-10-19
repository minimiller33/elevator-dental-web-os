'use client';

// Adapted from the Annnimate React library for Elevator Dental.

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import './magnetic-button.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

/**
 * MagneticButton Component
 *
 * Creates a subtle magnetic pull effect that follows the cursor. The button and its
 * text track mouse movement with different intensity levels, creating depth. Works
 * best for CTAs and primary actions where you want to draw attention.
 *
 * @param {string} [className=''] - Additional CSS classes for the wrapper
 * @param {React.ReactNode} [children='Shop Now'] - Button content
 * @param {string} [href='#'] - Link destination
 * @param {number} [strength=25] - Magnetic strength of button attraction (10-50)
 * @param {number} [textStrength=35] - Magnetic strength of text element (10-60)
 * @param {boolean} [textMagnet=true] - Enable stronger magnetic effect for text
 * @param {number} [duration=1.6] - Animation duration for mouse follow (0.5-3s)
 * @param {string} [ease='power4.out'] - GSAP easing for mouse follow
 * @param {string} [releaseEase='elastic.out(1, 0.3)'] - GSAP easing for release
 * @param {number} [releaseDuration=1.6] - Animation duration for release (0.5-3s)
 * @param {function} [onClick] - Click handler
 */
export default function MagneticButton({
  className = '',
  children = 'Shop Now',
  href = '#',
  strength = 25,
  textStrength = 35,
  textMagnet = true,
  duration = 1.6,
  ease = 'power4.out',
  releaseEase = 'elastic.out(1, 0.3)',
  releaseDuration = 1.6,
  onClick,
}) {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const textRef = useRef(null);
  const isEnabled = useRef(true);

  // Get contextSafe for animations triggered after initial render
  const { contextSafe } = useGSAP(() => {
    // Disable on touch devices (coarse pointer = finger/stylus, not mouse)
    if (window.matchMedia('(pointer: coarse)').matches) {
      isEnabled.current = false;
      return;
    }
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isEnabled.current = false;
      return;
    }

    // Cleanup function - kill all tweens on unmount
    return () => {
      if (buttonRef.current) {
        gsap.killTweensOf(buttonRef.current);
      }
      if (textRef.current) {
        gsap.killTweensOf(textRef.current);
      }
    };
  }, { scope: containerRef });

  /**
   * Handle mouse enter - reset positions immediately
   */
  const handleMouseEnter = () => contextSafe(() => {
    if (!isEnabled.current || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
    gsap.set(buttonRef.current, { x: 0, y: 0, force3D: true });
    if (textMagnet && textRef.current) {
      gsap.set(textRef.current, { x: 0, y: 0, force3D: true });
    }
  })();

  /**
   * Handle mouse move - animate button and text toward cursor
   */
  const handleMouseMove = (e) => contextSafe(() => {
    if (!isEnabled.current || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();

    // Calculate offset in pixels: (pos / size - 0.5) * strength
    const buttonOffsetX = ((e.clientX - rect.left) / button.offsetWidth - 0.5) * strength;
    const buttonOffsetY = ((e.clientY - rect.top) / button.offsetHeight - 0.5) * strength;

    gsap.to(buttonRef.current, {
      x: buttonOffsetX,
      y: buttonOffsetY,
      duration,
      ease,
      force3D: true,
      overwrite: 'auto',
    });

    // Animate text with stronger effect if enabled
    if (textMagnet && textRef.current) {
      const textOffsetX = ((e.clientX - rect.left) / button.offsetWidth - 0.5) * textStrength;
      const textOffsetY = ((e.clientY - rect.top) / button.offsetHeight - 0.5) * textStrength;

      gsap.to(textRef.current, {
        x: textOffsetX,
        y: textOffsetY,
        duration: duration * 1.25,
        ease,
        force3D: true,
      overwrite: 'auto',
      });
    }
  })();

  /**
   * Handle mouse leave - elastic release back to center
   */
  const handleMouseLeave = () => contextSafe(() => {
    if (!isEnabled.current || window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      ease: releaseEase,
      duration: releaseDuration,
      force3D: true,
      overwrite: 'auto',
      clearProps: 'transform',
    });

    if (textMagnet && textRef.current) {
      gsap.to(textRef.current, {
        x: 0,
        y: 0,
        ease: releaseEase,
        duration: releaseDuration * 1.25,
        force3D: true,
      overwrite: 'auto',
        clearProps: 'transform',
      });
    }
  })();

  /**
   * Handle click - prevent default and call onClick
   */
  const handleClick = (e) => {
    if (onClick) { e.preventDefault(); onClick(e); }
  };

  return (
    <div ref={containerRef} className="anm_magnetic_shell">
      <a
        ref={buttonRef}
        href={href}
        data-anm-magnetic-button
        className={`magnetic_button_wrap ${className}`.trim()}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <span
          ref={textMagnet ? textRef : undefined}
          data-anm-magnetic-text
          className="magnetic_button_text"
        >
          {children}
        </span>
      </a>
    </div>
  );
}
