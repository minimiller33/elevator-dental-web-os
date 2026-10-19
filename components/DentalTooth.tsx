export function DentalTooth() {
  const tooth = "M112 69C133 43 164 34 207 39c45-6 79 5 99 34 25 36 25 82 12 119-10 29-27 45-42 63-12 15-15 35-19 63-6 46-17 84-35 96-8 5-16 2-22-8-12-20-18-60-25-99-5-27-10-45-21-59-15-19-31-34-42-61-15-37-17-83 0-118Z";

  return (
    <div className="edw-tooth" role="img" aria-label="Incisivo digital animado que representa la visibilidad dental en buscadores">
      <span className="edw-tooth__caption">SEO + AEO<br />ODONTOLOGÍA</span>
      <div className="edw-tooth__figure" aria-hidden="true">
        <svg viewBox="0 0 420 440" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="incisor-enamel" x1=".12" y1=".08" x2=".86" y2=".94">
              <stop stopColor="#42d9ff" stopOpacity=".96" />
              <stop offset=".22" stopColor="#1b55bf" />
              <stop offset=".56" stopColor="#0b1d50" />
              <stop offset=".82" stopColor="#123578" />
              <stop offset="1" stopColor="#07122d" />
            </linearGradient>
            <linearGradient id="incisor-edge" x1=".1" y1="0" x2=".9" y2="1">
              <stop stopColor="#b4f4ff" />
              <stop offset=".52" stopColor="#34c5ff" />
              <stop offset="1" stopColor="#42e8a1" stopOpacity=".7" />
            </linearGradient>
            <radialGradient id="incisor-light" cx=".22" cy=".16" r=".78">
              <stop stopColor="#8deaff" stopOpacity=".54" />
              <stop offset=".5" stopColor="#287bff" stopOpacity=".12" />
              <stop offset="1" stopColor="#07122d" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="incisor-scan" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#42d9ff" stopOpacity="0" />
              <stop offset=".5" stopColor="#c2f7ff" stopOpacity=".8" />
              <stop offset="1" stopColor="#42d9ff" stopOpacity="0" />
            </linearGradient>
            <filter id="incisor-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <clipPath id="incisor-clip"><path d={tooth} /></clipPath>
          </defs>

          <path d={tooth} fill="#1858fb" opacity=".58" filter="url(#incisor-blur)" />
          <path d={tooth} fill="url(#incisor-enamel)" stroke="#48ceff" strokeWidth="2.2" strokeOpacity=".95" />
          <path d={tooth} fill="url(#incisor-light)" />

          <g clipPath="url(#incisor-clip)" fill="none" strokeLinecap="round">
            {/* Gentle crown lobes make the incisal edge read as enamel, not a flat icon. */}
            <path d="M112 145c32 8 64 10 96 8 32 2 65 0 98-8" stroke="#c4f7ff" strokeOpacity=".24" strokeWidth="2" />
            <path d="M124 179c23 13 49 18 84 17 35 1 61-4 84-17" stroke="url(#incisor-edge)" strokeOpacity=".58" strokeWidth="2" />
            <path d="M207 58c-9 33-13 70-12 103 1 19 5 34 12 47 7-13 11-28 12-47 1-33-3-70-12-103Z" stroke="#c8f8ff" strokeOpacity=".57" strokeWidth="2" />
            <path d="M207 203c-15 28-24 66-29 107-4 31-9 57-19 78M207 203c15 28 24 66 29 107 4 31 9 57 19 78" stroke="#53cfff" strokeOpacity=".2" strokeWidth="2" />
            <path d="M128 69c-19 25-27 55-25 86 1 22 7 42 19 59M286 69c19 25 27 55 25 86-1 22-7 42-19 59" stroke="#e0fbff" strokeOpacity=".44" strokeWidth="3" />
            <path d="M52 135h316" className="edw-tooth__scan" stroke="url(#incisor-scan)" strokeWidth="10" />
            <circle cx="145" cy="112" r="2" fill="#c8f8ff" fillOpacity=".8" />
            <circle cx="273" cy="128" r="1.8" fill="#c8f8ff" fillOpacity=".7" />
            <circle cx="169" cy="155" r="1.5" fill="#c8f8ff" fillOpacity=".7" />
            <circle cx="248" cy="93" r="1.5" fill="#c8f8ff" fillOpacity=".68" />
          </g>

          <path d={tooth} fill="none" stroke="url(#incisor-edge)" strokeWidth="1" strokeOpacity=".62" />
          <path d="M130 73c15-16 37-25 61-27M282 73c-15-16-37-25-61-27" fill="none" stroke="#e4fcff" strokeOpacity=".7" strokeLinecap="round" strokeWidth="3" />
        </svg>
      </div>
      <span className="edw-tooth__node edw-tooth__node--one" aria-hidden="true" />
      <span className="edw-tooth__node edw-tooth__node--two" aria-hidden="true" />
      <span className="edw-tooth__node edw-tooth__node--three" aria-hidden="true" />
      <span className="edw-tooth__legend"><i /> WEB DENTAL EN MOVIMIENTO</span>
    </div>
  );
}
