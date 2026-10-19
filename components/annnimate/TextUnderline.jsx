'use client';

// Adapted from the Annnimate React library for Elevator Dental.

import './text-underline.css';

/**
 * TextUnderline Component
 * CSS-only animated underline that slides through on hover. Expands from left to right, then exits
 * to the right. Perfect for text links and minimal button styles.
 *
 * @param {string} [className=''] - Additional CSS classes
 * @param {React.ReactNode} [children] - Link text content
 * @param {string} [underlineColor='currentColor'] - Color of the underline
 * @param {string} [underlineHeight='thin'] - Thickness ('thin', 'medium', 'thick')
 * @param {string} [duration='normal'] - Animation speed ('fast', 'normal', 'slow')
 * @param {string} [href='#'] - Link destination
 * @param {function} [onClick] - Click handler
 */
export default function TextUnderline({
  className = '',
  children,
  underlineColor = 'currentColor',
  underlineHeight = 'thin',
  duration = 'normal',
  href = '#',
  onClick,
}) {
  return (
    <span className="anm_link_shell">
      <a
        href={href}
        className={`text_underline_wrap ${className} text_underline_wrap--${underlineColor} text_underline_wrap--${underlineHeight} text_underline_wrap--${duration}`}
        data-anm-text-underline
        onClick={onClick}
      >
        {children}
      </a>
    </span>
  );
}
