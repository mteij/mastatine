import MastatineLogo from "./MastatineLogo";

interface MastatineLogoLockupProps {
  /** Icon size in px — text scales proportionally. */
  size?: number;
  className?: string;
}

export default function MastatineLogoLockup({
  size = 72,
  className = "",
}: MastatineLogoLockupProps) {
  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.18,
        fontFamily: "Lato, Arial, sans-serif",
      }}
    >
      <MastatineLogo size={size} />
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontSize: size * 0.17,
            fontWeight: 700,
            letterSpacing: "0.28em",
            color: "#8a8a8a",
            marginBottom: size * 0.06,
          }}
        >
          S.A.
        </div>
        <div
          style={{
            fontSize: size * 0.36,
            fontWeight: 900,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#f57f20" }}>MAST</span>
          <span style={{ color: "#0f2254" }}>ATINE</span>
        </div>
      </div>
    </div>
  );
}
