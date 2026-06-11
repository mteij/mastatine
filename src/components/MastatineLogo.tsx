interface MastaLogoProps {
  size?: number;
  className?: string;
}

export default function MastatineLogo({ size = 64, className = "" }: MastaLogoProps) {
  return (
    <svg
      viewBox="0 0 200 210"
      width={size}
      height={size * (210 / 200)}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="S.A. Mastatine logo"
      className={className}
    >
      {/* Background watermark: "8" and "5" (= element 85, same as Astatine) */}
      <text
        x="2"
        y="168"
        fontSize="155"
        fontWeight="900"
        fill="#ececec"
        fontFamily="Arial Black, Arial, sans-serif"
      >
        8
      </text>
      <text
        x="98"
        y="168"
        fontSize="155"
        fontWeight="900"
        fill="#ececec"
        fontFamily="Arial Black, Arial, sans-serif"
      >
        5
      </text>

      {/* Orbital ring */}
      <circle cx="100" cy="92" r="44" fill="white" stroke="#1b2539" strokeWidth="2" />

      {/* 7 valence electron dots — same as Astatine's Lewis structure */}
      {/* Positions at radius 44 from (100, 92), 360/7 ≈ 51.43° apart */}
      {[0, 51.43, 102.86, 154.29, 205.71, 257.14, 308.57].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 100 + 44 * Math.sin(rad);
        const y = 92 - 44 * Math.cos(rad);
        return <circle key={i} cx={x} cy={y} r={5.5} fill="#f57f20" />;
      })}

      {/* Transmission tower — replaces "At" from the Astatine logo */}
      <g stroke="#1b2539" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Top peak */}
        <line x1="100" y1="58" x2="93" y2="70" strokeWidth="1.8" />
        <line x1="100" y1="58" x2="107" y2="70" strokeWidth="1.8" />
        {/* Top cross-arm (insulators) */}
        <line x1="83" y1="67" x2="117" y2="67" strokeWidth="1.8" />
        <line x1="93" y1="70" x2="107" y2="70" strokeWidth="1.5" />
        {/* Upper body */}
        <line x1="93" y1="70" x2="91" y2="86" strokeWidth="1.8" />
        <line x1="107" y1="70" x2="109" y2="86" strokeWidth="1.8" />
        {/* Upper body X-brace */}
        <line x1="93" y1="72" x2="109" y2="84" strokeWidth="1" />
        <line x1="107" y1="72" x2="91" y2="84" strokeWidth="1" />
        {/* Mid cross-arm */}
        <line x1="82" y1="84" x2="118" y2="84" strokeWidth="1.8" />
        {/* Lower body (widening) */}
        <line x1="91" y1="86" x2="88" y2="108" strokeWidth="1.8" />
        <line x1="109" y1="86" x2="112" y2="108" strokeWidth="1.8" />
        {/* Lower body X-brace */}
        <line x1="91" y1="88" x2="111" y2="105" strokeWidth="1" />
        <line x1="109" y1="88" x2="89" y2="105" strokeWidth="1" />
        {/* Base cross-arm */}
        <line x1="82" y1="108" x2="118" y2="108" strokeWidth="1.8" />
        {/* Foundation legs */}
        <line x1="88" y1="108" x2="85" y2="118" strokeWidth="1.8" />
        <line x1="112" y1="108" x2="115" y2="118" strokeWidth="1.8" />
        {/* Ground line */}
        <line x1="80" y1="118" x2="120" y2="118" strokeWidth="2" />
      </g>

      {/* "MASTATINE" text at bottom */}
      <text
        x="100"
        y="192"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="16"
        letterSpacing="3"
        fill="#1b2539"
      >
        MASTATINE
      </text>

      {/* Element number top-left (small, like a periodic table tile) */}
      <text
        x="14"
        y="22"
        fontFamily="Arial, sans-serif"
        fontWeight="600"
        fontSize="12"
        fill="#1b2539"
        opacity="0.5"
      >
        85
      </text>
    </svg>
  );
}
