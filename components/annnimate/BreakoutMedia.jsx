'use client';

import { Fragment, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import './breakout-media.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);
  CustomEase.create('annnimate', 'M0,0 C0.3,0.9 0.1,1 1,1');
  CustomEase.create('annnimateInOut', 'M0,0 C0.7,0 0.16,1 1,1');
}

const DEFAULT_TITLE_LINES = ['Así funciona', 'Elevator.'];
const DEFAULT_TEXT = 'Tu web trabaja mientras tú atiendes. Conoce cómo construimos tu presencia digital y la mejoramos contigo.';
const DEFAULT_META_ITEMS = [
  { label: 'Para', value: 'Clínicas dentales' },
  { label: 'Duración', value: '2:50' },
];
const DEFAULT_POSTER_SRC = '/video/elevator-v41-portada.jpg';
const DEFAULT_VIDEO_SRC = '/video/elevator-v41.mp4';

const FILM_ASPECT = 16 / 9;
const ZOOM_FROM = 1.08;
const SCRUB = 0.8;
const DESKTOP_QUERY = '(min-width: 900px)';
const MOBILE_QUERY = '(max-width: 899px)';
// Mobile only opens the side margins, so it needs a shorter run.
const MOBILE_GROW_SHARE = 0.4;
const SCROLL_DUR = 1.2;
const VIDEO_FADE = 0.45;
const PAUSE_LABEL = 'Pausar video';
const RESIZE_DEBOUNCE = 150;
// The copy fades out once the film's left edge has covered this share of
// its width, and back in when it uncovers it again.
const COPY_COVER = 0.5;
const COPY_FADE = 0.4;
const COPY_EASE = 'power2.out';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * BreakoutMedia section
 * A film band that sits in its grid zone beside the copy, then grows out to
 * every edge of the screen as the section scrolls. Clicking the film or the
 * play pill scrolls to the other state; the film itself is only ever driven
 * by the scrubbed timeline.
 *
 * Config props are read once per mount (a change rebuilds the section).
 *
 * @param {string} [className=''] - Extra classes on the section root
 * @param {'grow'|'shrink'} [direction='grow'] - Contained -> full-bleed, or the reverse
 * @param {number} [growDistance=100] - Scroll distance of the grow in vh (40-200)
 * @param {number} [holdDistance=50] - Full-bleed hold in vh, desktop only (0-150)
 * @param {string} [ease='power3.out'] - power3.out | annnimate | annnimateInOut | none
 *
 * Ref handle mirrors window.Anm.BreakoutMedia: refresh(), expand(), contract().
 */
const BreakoutMedia = forwardRef(function BreakoutMedia({
  className = '',
  id = 'presentacion',
  title = 'Así funciona Elevator Dental Web',
  direction = 'grow',
  growDistance = 100,
  holdDistance = 50,
  ease = 'power3.out',
  titleLines = DEFAULT_TITLE_LINES,
  text = DEFAULT_TEXT,
  metaItems = DEFAULT_META_ITEMS,
  posterSrc = DEFAULT_POSTER_SRC,
  posterSrcSet = undefined,
  videoSrc = DEFAULT_VIDEO_SRC,
  alt = 'Presentación de Elevator Dental Web para clínicas dentales',
  playLabel = 'Reproducir video',
  runtime = '2:50',
}, ref) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const mediaRef = useRef(null);
  const slotRef = useRef(null);
  const copyRef = useRef(null);
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const playBtnRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const apiRef = useRef(null);

  useImperativeHandle(ref, () => ({
    refresh: () => apiRef.current?.refresh(),
    expand: () => apiRef.current?.expand(),
    contract: () => apiRef.current?.contract(),
  }), []);

  useGSAP(
    (context, contextSafe) => {
      const container = containerRef.current;
      const stage = stageRef.current;
      const media = mediaRef.current;
      const slot = slotRef.current;
      const copy = copyRef.current;
      const frame = frameRef.current;
      const video = videoRef.current;
      const playBtn = playBtnRef.current;
      if (!container || !stage || !media || !slot || !frame) return;

      const dir = direction === 'shrink' ? 'shrink' : 'grow';
      const growVh = growDistance;
      const holdVh = holdDistance;

      // state.p is the ONE progress value: 0 = contained, 1 = full-bleed. Only
      // the scrubbed timeline writes it; clicks scroll the page instead.
      const state = { p: dir === 'shrink' ? 1 : 0 };
      // Inspector-only proxy: its rows name the phases state.p drives.
      const rows = { corners: 0, pill: 0, hold: 0 };
      let geo = null;
      let mainSt = null;
      let activeHold = holdVh;
      let isMobile = false;
      let stickTop = 0;
      let runway = 0;
      let lastW = window.innerWidth;
      let reduced = false;
      let videoShown = false;
      let resizeTimer = null;
      let copyHidden = null;

      // The contained zone comes from the CSS slot, so the grid lives in CSS.
      // The frame is sized once to cover the whole box at 16:9 and only ever
      // transformed after that.
      function measure() {
        const cs = getComputedStyle(container);
        const boxW = media.clientWidth;
        const boxH = media.clientHeight;
        const fw = Math.max(boxW, boxH * FILM_ASPECT);
        geo = {
          boxW,
          boxH,
          fw,
          fh: fw / FILM_ASPECT,
          x0: slot.offsetLeft,
          y0: slot.offsetTop,
          w0: slot.offsetWidth,
          h0: slot.offsetHeight,
          radius: parseFloat(cs.getPropertyValue('--bkm-radius')) || 0,
          pillIn: parseFloat(cs.getPropertyValue('--bkm-pill-inset')) || 0,
          margin: parseFloat(cs.getPropertyValue('--bkm-margin')) || 0,
          pillH: playBtn ? playBtn.offsetHeight : 0,
          fadeAt: copyFadePoint(),
        };
        gsap.set(frame, { width: geo.fw, height: geo.fh, transformOrigin: '0 0' });
        measureRunway();
      }

      // Mobile pad model: the stacked stage sticks centred (or bottom-aligned
      // when taller than the screen) and the section owns its runway.
      function measureRunway() {
        if (!isMobile) {
          stage.style.top = '';
          container.style.height = '';
          return;
        }
        const vh = window.innerHeight;
        const stageH = stage.offsetHeight;
        stickTop = stageH > vh ? vh - stageH : (vh - stageH) / 2;
        runway = vh * (growVh / 100) * MOBILE_GROW_SHARE;
        stage.style.top = stickTop + 'px';
        container.style.height = Math.max(vh, stageH) + runway + 'px';
      }

      // The film's left edge sits at x0 * (1 - p), so "covers COPY_COVER of the
      // copy" is one progress value, worked out from the layout. On mobile the
      // copy sits beside the film's path, never under it, so it never fades.
      function copyFadePoint() {
        if (!copy || isMobile) return Infinity;
        const edge = copy.offsetLeft + copy.offsetWidth * COPY_COVER;
        const x0 = slot.offsetLeft;
        return x0 > edge ? 1 - edge / x0 : 0;
      }

      // Binary, not scrubbed: crossing the threshold fades the copy out,
      // crossing back fades it in. A fresh tween per crossing (not a reversed
      // one) so both directions keep the same ease out; overwrite lets a quick
      // scroll back interrupt a fade mid-way. The first call of a layout (and
      // reduced motion) just sets the end state.
      function syncCopy(p) {
        if (!copy) return;
        const hide = p >= geo.fadeAt;
        if (hide === copyHidden) return;
        const first = copyHidden === null;
        copyHidden = hide;
        if (first || reduced) {
          gsap.set(copy, { autoAlpha: hide ? 0 : 1, overwrite: true });
          return;
        }
        gsap.to(copy, { autoAlpha: hide ? 0 : 1, duration: COPY_FADE, ease: COPY_EASE, overwrite: true });
      }

      function scrollToState(full) {
        if (!mainSt) return;
        const total = growVh + activeHold;
        let frac;
        if (dir === 'grow') frac = full ? growVh / total : 0;
        else frac = full ? activeHold / total : 1;
        const y = mainSt.start + (mainSt.end - mainSt.start) * frac;
        const scroller = mainSt.scroller;
        if (scroller === window && window.lenis) {
          window.lenis.scrollTo(y, reduced ? { immediate: true } : { duration: SCROLL_DUR });
        } else {
          scroller.scrollTo({ top: y, behavior: reduced ? 'instant' : 'smooth' });
        }
      }

      // Every edge of the visible box is interpolated from state.p, the clip
      // rounds off with it, and the frame is scaled to keep covering the box
      // (plus the zoom-settle) - so the film grows rather than being revealed.
      function render() {
        if (!geo) return;
        const p = state.p;
        const x = lerp(geo.x0, 0, p);
        const y = lerp(geo.y0, 0, p);
        const w = lerp(geo.w0, geo.boxW, p);
        const h = lerp(geo.h0, geo.boxH, p);
        const s = Math.max(w / geo.fw, h / geo.fh) * lerp(reduced ? 1 : ZOOM_FROM, 1, p);

        media.style.clipPath =
          'inset(' + y + 'px ' + (geo.boxW - x - w) + 'px ' + (geo.boxH - y - h) + 'px ' + x +
          'px round ' + geo.radius * (1 - p) + 'px)';
        media.style.setProperty('--bkm-p', String(p));
        media.style.setProperty('--bkm-x', x + 'px');
        media.style.setProperty('--bkm-y', y + 'px');
        media.style.setProperty('--bkm-right', (geo.boxW - x - w) + 'px');
        gsap.set(frame, { x: x + (w - geo.fw * s) / 2, y: y + (h - geo.fh * s) / 2, scale: s, force3D: true });

        // Keep the narrated video and its native controls inside the visible
        // rectangle. Only the decorative poster uses the cover/zoom treatment.
        gsap.set(video, { left: x, top: y, width: w, height: h });
        if (playBtn) {
          const inset = lerp(geo.pillIn, geo.margin, p);
          gsap.set(playBtn, { x: x + inset, y: y + h - inset - geo.pillH, force3D: true });
        }
        syncCopy(p);
      }

      function buildScrub() {
        const grows = dir === 'grow';
        const growAt = grows ? 0 : activeHold;
        const scrub = reduced ? true : SCRUB;

        const tl = gsap.timeline({
          onUpdate: render,
          scrollTrigger: isMobile
            ? {
                trigger: container,
                start: () => 'clamp(top ' + stickTop + 'px)',
                // '+=' would resolve against the UNclamped start and end early
                end: (self) => self.start + runway,
                scrub,
                invalidateOnRefresh: true,
              }
            : {
                trigger: container,
                start: 'top top',
                end: 'bottom bottom',
                scrub,
              },
        });

        tl.fromTo(state, { p: grows ? 0 : 1 }, {
          p: grows ? 1 : 0,
          duration: growVh,
          ease,
          data: { label: grows ? 'Film edges travel out to the viewport' : 'Film edges pull in to the grid zone' },
        }, growAt);
        tl.fromTo(rows, { corners: 0 }, {
          corners: 1,
          duration: growVh,
          ease,
          data: { label: grows ? 'Corners square off as the image settles' : 'Corners round as the image pushes in' },
        }, growAt);
        tl.fromTo(rows, { pill: 0 }, {
          pill: 1,
          duration: growVh,
          ease,
          data: { label: grows ? 'Play pill rides out to the section margin' : 'Play pill tucks into the card' },
        }, growAt);
        if (activeHold > 0) {
          tl.fromTo(rows, { hold: 0 }, {
            hold: 1,
            duration: activeHold,
            ease: 'none',
            data: { label: 'Film holds full-bleed' },
          }, grows ? growVh : 0);
        }
        return tl;
      }

      function pauseFilm() {
        if (video && !video.paused) video.pause();
      }

      function togglePlay(e) {
        e.stopPropagation();
        if (video && !video.paused) {
          video.pause();
          return;
        }
        scrollToState(true);
        if (video) {
          if (video.error) video.load();
          setError(false);
          setLoading(true);
          video.play().catch(() => { setLoading(false); setError(true); });
        }
      }

      function toggleState() {
        scrollToState(state.p < 0.99);
      }

      const onVideoPlaying = contextSafe(() => {
        setStarted(true);
        setLoading(false);
        setError(false);
        if (videoShown) return;
        videoShown = true;
        gsap.to(video, { autoAlpha: 1, duration: reduced ? 0 : VIDEO_FADE, ease: 'power2.out' });
      });

      media.addEventListener('click', toggleState);
      if (playBtn) playBtn.addEventListener('click', togglePlay);
      if (video) video.addEventListener('playing', onVideoPlaying);

      ScrollTrigger.create({
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        onLeave: pauseFilm,
        onLeaveBack: pauseFilm,
      });

      function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          // a height-only resize on mobile is the URL bar - re-measuring would
          // shift the runway mid-scroll
          if (isMobile && window.innerWidth === lastW) return;
          lastW = window.innerWidth;
          measure();
          render();
          if (isMobile) ScrollTrigger.refresh();
        }, RESIZE_DEBOUNCE);
      }
      window.addEventListener('resize', handleResize);

      function handleVisibility() {
        if (document.hidden) pauseFilm();
      }
      document.addEventListener('visibilitychange', handleVisibility);

      container.style.setProperty('--bkm-grow', growVh + 'vh');
      container.style.setProperty('--bkm-hold', holdVh + 'vh');

      // One context per layout. isDesktop and isMobile together tile every
      // width, so a context always runs; isReduced drops the scrub catch-up and
      // makes the click jump instead of glide.
      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: DESKTOP_QUERY,
          isMobile: MOBILE_QUERY,
          isReduced: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          reduced = ctx.conditions.isReduced;
          isMobile = ctx.conditions.isMobile;
          activeHold = isMobile ? 0 : holdVh;
          copyHidden = null;
          measure();
          mainSt = buildScrub().scrollTrigger;
          render();
          media.classList.add('is-ready');
          return () => {
            mainSt = null;
          };
        }
      );

      apiRef.current = {
        refresh: contextSafe(() => {
          measure();
          render();
          ScrollTrigger.refresh();
        }),
        expand: () => scrollToState(true),
        contract: () => scrollToState(false),
      };

      return () => {
        apiRef.current = null;
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibility);
        clearTimeout(resizeTimer);
        media.removeEventListener('click', toggleState);
        if (playBtn) playBtn.removeEventListener('click', togglePlay);
        if (video) video.removeEventListener('playing', onVideoPlaying);
        mm.revert();
        pauseFilm();
        if (copy) {
          gsap.killTweensOf(copy);
          gsap.set(copy, { clearProps: 'opacity,visibility' });
        }
        media.classList.remove('is-ready');
        media.style.clipPath = '';
        stage.style.top = '';
        container.style.height = '';
      };
    },
    {
      scope: containerRef,
      dependencies: [direction, growDistance, holdDistance, ease],
      revertOnUpdate: true,
    }
  );

  return (
    <section
      ref={containerRef}
      id={id}
      aria-label={title}
      className={`bkm_section ${className}`.trim()}
      data-anm-breakout-media
      data-playing={playing ? 'true' : 'false'}
      data-started={started ? 'true' : 'false'}
      data-error={error ? 'true' : 'false'}
    >
      <noscript><style>{`.bkm_section{height:auto!important}.bkm_stage{position:relative;height:auto;min-height:500px}.bkm_play{display:none}.bkm_video{opacity:1;visibility:visible}.bkm_frame{display:none}.bkm_media{left:var(--bkm-l0);top:calc((100% - var(--bkm-h0))/2);width:var(--bkm-w0);height:var(--bkm-h0)}@media(max-width:899px){.bkm_media{left:auto;top:auto;width:calc(100% + 2*var(--bkm-margin));height:auto}}`}</style></noscript>
      <div ref={stageRef} className="bkm_stage" data-anm-bkm-stage>
        <div ref={copyRef} className="bkm_copy" data-anm-bkm-copy>
          <h2 className="bkm_title">
            {titleLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </h2>
          <div className="bkm_body">
            <p className="bkm_text">{text}</p>
            <dl className="bkm_meta">
              {metaItems.map((item) => (
                <div key={item.label}>
                  <dt className="bkm_meta_label">{item.label}</dt>
                  <dd className="bkm_meta_value">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <figure ref={mediaRef} className="bkm_media" data-anm-bkm-media>
          <span ref={slotRef} className="bkm_slot" data-anm-bkm-slot aria-hidden="true" />
          <div ref={frameRef} className="bkm_frame" data-anm-bkm-frame>
            {/* Static export: keep the supplied player’s local, compressed poster. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bkm_poster" src={posterSrc} srcSet={posterSrcSet} sizes="100vw" alt={alt} />
          </div>
          <video
            ref={videoRef}
            className="bkm_video"
            data-anm-bkm-video
            controls
            playsInline
            preload="none"
            poster={posterSrc}
            src={videoSrc}
            width={1920}
            height={1080}
            aria-label={title}
            onClick={(event) => event.stopPropagation()}
            onPlay={() => setPlaying(true)}
            onPause={() => { setPlaying(false); setLoading(false); }}
            onEnded={() => setPlaying(false)}
            onWaiting={() => setLoading(true)}
            onCanPlay={() => setLoading(false)}
            onError={() => { setError(true); setLoading(false); }}
          >
            Tu navegador no puede reproducir este video. <a href={videoSrc}>Abrir video</a>
          </video>
          <button ref={playBtnRef} className="bkm_play" type="button" aria-busy={loading} data-anm-bkm-play>
            <span className="bkm_play_dot" aria-hidden="true" />
            <span className="bkm_play_label" data-anm-bkm-play-label>
              {error ? 'Reintentar video' : loading ? 'Cargando video…' : playing ? PAUSE_LABEL : playLabel}
            </span>
            <span className="bkm_play_time">{runtime}</span>
          </button>
          {error && <p className="bkm_error" role="alert">No pudimos reproducir el video. Reintenta o <a href={videoSrc} onClick={(event) => event.stopPropagation()}>ábrelo aquí</a>.</p>}
        </figure>
      </div>
    </section>
  );
});

export default BreakoutMedia;
