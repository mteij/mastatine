interface MastaLogoProps {
  size?: number;
  className?: string;
  /** Render every stroke/fill as currentColor, for use on colored backgrounds. */
  mono?: boolean;
}

export default function MastatineLogo({ size = 64, className = "", mono = false }: MastaLogoProps) {
  const cx = 100;
  const cy = 100;
  const rOuter = 78;
  const rInner = 52;
  const rDot = 11;
  const stroke = mono ? "currentColor" : "#1a1a1a";
  const orange = mono ? "currentColor" : "#f57f20";

  // 7 electrons evenly spaced on the outer ring, starting at top (−90°)
  const electrons = Array.from({ length: 7 }, (_, i) => {
    const deg = -90 + (360 / 7) * i;
    const rad = (deg * Math.PI) / 180;
    return { x: cx + rOuter * Math.cos(rad), y: cy + rOuter * Math.sin(rad) };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="S.A. Mastatine logo"
      className={className}
    >
      {/* Outer orbital ring */}
      <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke={stroke} strokeWidth="2.5" />
      {/* Inner orbital ring */}
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke={stroke} strokeWidth="2.5" />

      {/* 7 valence electrons */}
      {electrons.map((e, i) => (
        <circle key={i} cx={e.x} cy={e.y} r={rDot} fill={orange} />
      ))}

      {/* Transmission tower — replaces "At" */}
      {/* Drawn in orange to match the original "At" color */}
      <g
        stroke={orange}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Lightning rod / peak */}
        <line x1="100" y1="57" x2="100" y2="63" strokeWidth="2.5" />

        {/* Top cross-arm (conductor arms) */}
        <line x1="82" y1="68" x2="118" y2="68" strokeWidth="2" />

        {/* Top body — tapers inward from cross-arm */}
        <line x1="95" y1="63" x2="92" y2="82" strokeWidth="2" />
        <line x1="105" y1="63" x2="108" y2="82" strokeWidth="2" />

        {/* Cross-brace upper section (X) */}
        <line x1="95" y1="64" x2="108" y2="80" strokeWidth="1.2" />
        <line x1="105" y1="64" x2="92" y2="80" strokeWidth="1.2" />

        {/* Mid cross-arm */}
        <line x1="83" y1="82" x2="117" y2="82" strokeWidth="2" />

        {/* Lower body — widens toward base */}
        <line x1="92" y1="82" x2="87" y2="118" strokeWidth="2" />
        <line x1="108" y1="82" x2="113" y2="118" strokeWidth="2" />

        {/* Cross-brace lower section (X) */}
        <line x1="92" y1="84" x2="113" y2="112" strokeWidth="1.2" />
        <line x1="108" y1="84" x2="87" y2="112" strokeWidth="1.2" />

        {/* Base cross-arm */}
        <line x1="82" y1="118" x2="118" y2="118" strokeWidth="2" />

        {/* Foundation legs */}
        <line x1="87" y1="118" x2="82" y2="135" strokeWidth="2" />
        <line x1="113" y1="118" x2="118" y2="135" strokeWidth="2" />

        {/* Ground bar */}
        <line x1="77" y1="135" x2="123" y2="135" strokeWidth="2.5" />
      </g>
    </svg>
  );
}
