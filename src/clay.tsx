import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FILM, LAYOUT, FONT_FAMILY } from "./theme";

// --- Stop-motion jitter: deterministic small offset that steps every 2 frames.
export const useClayWobble = (seed: number = 0, strength: number = 1) => {
  const frame = useCurrentFrame();
  const t = Math.floor(frame / 2);
  const dx = (Math.sin(t * 0.37 + seed) + Math.sin(t * 0.71 + seed * 2.1)) * 0.9 * strength;
  const dy = (Math.cos(t * 0.43 + seed) + Math.sin(t * 0.61 + seed * 1.3)) * 0.7 * strength;
  const rot = Math.sin(t * 0.3 + seed) * 0.4 * strength;
  return { dx, dy, rot };
};

// --- Reusable SVG defs: radial gradients that make clay shapes read as 3D.
export const ClayDefs: React.FC<{ characterColor?: string }> = ({
  characterColor = COLORS.character,
}) => (
  <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
    <defs>
      {/* character clay — orange by default */}
      <radialGradient id="clay-char" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor={lighten(characterColor, 0.45)} />
        <stop offset="45%" stopColor={characterColor} />
        <stop offset="100%" stopColor={darken(characterColor, 0.55)} />
      </radialGradient>
      <radialGradient id="clay-char-limb" cx="30%" cy="30%" r="80%">
        <stop offset="0%" stopColor={lighten(characterColor, 0.35)} />
        <stop offset="60%" stopColor={characterColor} />
        <stop offset="100%" stopColor={darken(characterColor, 0.5)} />
      </radialGradient>
      {/* shadow clay — dark */}
      <radialGradient id="clay-shadow" cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#2a2a35" />
        <stop offset="55%" stopColor="#0d0d16" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>
      {/* lamp */}
      <radialGradient id="clay-lamp-shade" cx="40%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#c86b3a" />
        <stop offset="50%" stopColor="#7a3418" />
        <stop offset="100%" stopColor="#3a1708" />
      </radialGradient>
      <radialGradient id="clay-lamp-pole" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stopColor="#8a8a95" />
        <stop offset="55%" stopColor="#3f3f49" />
        <stop offset="100%" stopColor="#15151c" />
      </radialGradient>
      {/* backdrop */}
      <radialGradient id="clay-backdrop" cx="50%" cy="48%" r="75%">
        <stop offset="0%" stopColor="#1b1b28" />
        <stop offset="65%" stopColor="#0a0a13" />
        <stop offset="100%" stopColor="#030308" />
      </radialGradient>
      <linearGradient id="clay-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#262632" />
        <stop offset="40%" stopColor="#141420" />
        <stop offset="100%" stopColor="#060610" />
      </linearGradient>
      {/* a soft shadow filter */}
      <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
        <feOffset dx="2" dy="8" result="off" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.6" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

function lighten(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: Math.round(r + (255 - r) * amt),
    g: Math.round(g + (255 - g) * amt),
    b: Math.round(b + (255 - b) * amt),
  });
}
function darken(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({
    r: Math.round(r * (1 - amt)),
    g: Math.round(g * (1 - amt)),
    b: Math.round(b * (1 - amt)),
  });
}
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

// --- Backdrop with dark radial gradient.
export const ClayBackdrop: React.FC = () => (
  <AbsoluteFill>
    <svg width={FILM.width} height={FILM.height} style={{ position: "absolute", inset: 0 }}>
      <rect width={FILM.width} height={FILM.height} fill="url(#clay-backdrop)" />
    </svg>
  </AbsoluteFill>
);

// --- Clay floor: a filled plane below floorY.
export const ClayFloor: React.FC<{ y?: number }> = ({ y = LAYOUT.floorY }) => (
  <svg
    width={FILM.width}
    height={FILM.height - y + 40}
    style={{ position: "absolute", top: y - 20, left: 0, zIndex: 5 }}
  >
    <rect
      x={0}
      y={20}
      width={FILM.width}
      height={FILM.height - y + 20}
      fill="url(#clay-floor)"
    />
    {/* soft rim light where floor meets back wall */}
    <rect x={0} y={18} width={FILM.width} height={3} fill="#4a4a58" opacity={0.6} />
  </svg>
);

// --- Soft radial glow. Reused for lamp pools and moon.
export const ClayGlow: React.FC<{
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity?: number;
}> = ({ x, y, radius, color, intensity = 0.6 }) => (
  <div
    style={{
      position: "absolute",
      left: x - radius,
      top: y - radius,
      width: radius * 2,
      height: radius * 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, ${color}00 70%)`,
      opacity: intensity,
      pointerEvents: "none",
      mixBlendMode: "screen",
      zIndex: 25,
    }}
  />
);

// --- Clay lamp: sculpted pole, shade, base; casts a warm pool.
// Keeps the warm light source in the scene but no visible lamp object.
export const ClayLamp: React.FC<{ x: number }> = ({ x }) => {
  const frame = useCurrentFrame();
  const flicker = 1 + Math.sin(frame * 0.18) * 0.025;
  const floorY = LAYOUT.floorY;
  const poleTop = floorY - 420;

  return (
    <>
      <ClayGlow x={x} y={floorY - 20} radius={520 * flicker} color="#ffb066" intensity={0.65 * flicker} />
      <ClayGlow x={x} y={floorY - 160} radius={900 * flicker} color="#ffa050" intensity={0.25 * flicker} />
      <ClayGlow x={x} y={poleTop - 10} radius={200 * flicker} color="#fff2cc" intensity={0.7 * flicker} />
    </>
  );
};

// ----- Clay character -----

type Eyebrows = { tilt: number; drop?: number };
type Mouth = "flat" | "down" | "open" | "small-up";

type ClayCharProps = {
  x: number;
  y: number;
  pose?: "sit" | "stand";
  eyebrows?: Eyebrows;
  mouth?: Mouth;
  eyesClosed?: boolean;
  item?: "jumprope" | "none";
  scale?: number;
  // Torso width multiplier — fattens the body only, not the head or limbs.
  // 1 = normal, >1 = fatter torso.
  bodyFat?: number;
  bounceY?: number;
  legPhase?: number;
};

export const ClayCharacter: React.FC<ClayCharProps> = ({
  x,
  y,
  pose = "stand",
  eyebrows = { tilt: 0, drop: 0 },
  mouth = "flat",
  eyesClosed = false,
  item = "none",
  scale = 1.6,
  bodyFat = 1,
  bounceY = 0,
  legPhase = 0,
}) => {
  const wob = useClayWobble(x * 0.013);
  const frame = useCurrentFrame();
  const breath = Math.sin(frame * 0.1) * 2;

  const W = 440;
  const H = pose === "sit" ? 400 : 560;
  const left = x - (W * scale) / 2 + wob.dx;
  const top = y - H * scale + wob.dy + breath + bounceY;

  const headR = 82;
  const headCX = W / 2;
  const headCY = pose === "sit" ? 130 : 110;

  const bodyW = 100 * bodyFat;
  const bodyTop = headCY + headR - 8;
  const bodyBottom = pose === "sit" ? 280 : 340;

  const armStart = bodyTop + 22;
  // In sit, both hands drape forward onto the raised knees (knees-up tired pose).
  const handY = pose === "sit" ? 250 : 400;
  const handLX = pose === "sit" ? headCX + 12 : headCX - 75;
  const handRX = pose === "sit" ? headCX + 48 : headCX + 75;
  // Bezier control for arms: for sit, the hands come forward from the shoulders, not splayed.
  const armCtrlLX = pose === "sit" ? headCX - 2 : handLX - 10;
  const armCtrlLY = pose === "sit" ? armStart + 18 : armStart + 70;
  const armCtrlRX = pose === "sit" ? headCX + 18 : handRX + 10;
  const armCtrlRY = pose === "sit" ? armStart + 18 : armStart + 70;

  const hipY = bodyBottom - 6;
  // In sit both feet rest on the floor together in front; standing feet stay roughly
  // under the hips. For action (running), legPhase in [-1, 1] lifts one foot at a time.
  const legEndY = H - 15;
  const legEndLY = pose === "sit" ? legEndY : legEndY - Math.max(0, legPhase) * 55;
  const legEndRY = pose === "sit" ? legEndY : legEndY - Math.max(0, -legPhase) * 55;
  const footLX = pose === "sit" ? headCX - 5 : headCX - 45;
  const footRX = pose === "sit" ? headCX + 35 : headCX + 45;
  // Leg control points: for sit, the knee rises up in front of the body.
  const legCtrlLX = pose === "sit" ? headCX + 22 : footLX - 6;
  const legCtrlLY = pose === "sit" ? 215 : (hipY + legEndLY) / 2;
  const legCtrlRX = pose === "sit" ? headCX + 42 : footRX + 6;
  const legCtrlRY = pose === "sit" ? 205 : (hipY + legEndRY) / 2;

  return (
    <svg
      width={W * scale}
      height={H * scale + 30}
      viewBox={`0 0 ${W} ${H + 30}`}
      style={{
        position: "absolute",
        left,
        top,
        overflow: "visible",
        transform: `rotate(${wob.rot}deg)`,
        transformOrigin: "center bottom",
        zIndex: 60,
      }}
    >
      {/* ground drop shadow */}
      <ellipse cx={headCX} cy={H + 8} rx={85} ry={11} fill="#000000" opacity={0.55} />

      {/* back arm (behind body) */}
      <path
        d={`M ${headCX + 10} ${armStart} Q ${armCtrlRX} ${armCtrlRY} ${handRX} ${handY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={36}
        strokeLinecap="round"
        fill="none"
      />

      {/* legs */}
      <g stroke="url(#clay-char-limb)" strokeWidth={38} strokeLinecap="round" fill="none">
        <path d={`M ${headCX - 18} ${hipY} Q ${legCtrlLX} ${legCtrlLY} ${footLX} ${legEndLY}`} />
        <path d={`M ${headCX + 18} ${hipY} Q ${legCtrlRX} ${legCtrlRY} ${footRX} ${legEndRY}`} />
      </g>
      {/* ball feet */}
      <ellipse cx={footLX} cy={legEndLY} rx={28} ry={16} fill="url(#clay-char-limb)" />
      <ellipse cx={footRX} cy={legEndRY} rx={28} ry={16} fill="url(#clay-char-limb)" />

      {/* body - chunky torso */}
      <path
        d={`M ${headCX - bodyW / 2} ${bodyTop}
            Q ${headCX - bodyW / 2 - 18} ${(bodyTop + bodyBottom) / 2} ${headCX - bodyW / 2 + 12} ${bodyBottom}
            L ${headCX + bodyW / 2 - 12} ${bodyBottom}
            Q ${headCX + bodyW / 2 + 18} ${(bodyTop + bodyBottom) / 2} ${headCX + bodyW / 2} ${bodyTop} Z`}
        fill="url(#clay-char)"
      />
      <ellipse
        cx={headCX - 22}
        cy={bodyTop + 36}
        rx={14}
        ry={9}
        fill="#ffffff"
        opacity={0.28}
      />

      {/* front arm (over body) */}
      <path
        d={`M ${headCX - 10} ${armStart} Q ${armCtrlLX} ${armCtrlLY} ${handLX} ${handY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={36}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={handLX} cy={handY} r={24} fill="url(#clay-char-limb)" />
      <circle cx={handRX} cy={handY} r={24} fill="url(#clay-char-limb)" />

      {/* head */}
      <circle cx={headCX} cy={headCY} r={headR} fill="url(#clay-char)" />
      <ellipse
        cx={headCX - 30}
        cy={headCY - 38}
        rx={20}
        ry={12}
        fill="#ffffff"
        opacity={0.35}
      />

      {/* face */}
      {eyesClosed ? (
        <g stroke="#1a1a22" strokeWidth={5} fill="none" strokeLinecap="round">
          <path d={`M ${headCX - 32} ${headCY - 4} Q ${headCX - 22} ${headCY - 8} ${headCX - 12} ${headCY - 4}`} />
          <path d={`M ${headCX + 12} ${headCY - 4} Q ${headCX + 22} ${headCY - 8} ${headCX + 32} ${headCY - 4}`} />
        </g>
      ) : (
        <g>
          <circle cx={headCX - 22} cy={headCY - 5} r={7} fill="#15151c" />
          <circle cx={headCX + 22} cy={headCY - 5} r={7} fill="#15151c" />
          {/* tiny white speculars */}
          <circle cx={headCX - 20} cy={headCY - 7} r={1.8} fill="#ffffff" />
          <circle cx={headCX + 24} cy={headCY - 7} r={1.8} fill="#ffffff" />
        </g>
      )}

      {/* clay-strip eyebrows */}
      <ClayEyebrow cx={headCX - 22} cy={headCY - 26 - (eyebrows.drop ?? 0)} tilt={eyebrows.tilt} />
      <ClayEyebrow cx={headCX + 22} cy={headCY - 26 - (eyebrows.drop ?? 0)} tilt={-eyebrows.tilt} />

      {/* mouth */}
      <ClayMouth cx={headCX} cy={headCY + 32} shape={mouth} />

      {/* jump rope coil on right hand */}
      {item === "jumprope" && (
        <g stroke="#e8d9b5" strokeWidth={4} fill="none" strokeLinecap="round">
          <ellipse cx={handRX + 4} cy={handY + 12} rx={26} ry={10} />
          <ellipse cx={handRX + 4} cy={handY + 22} rx={26} ry={10} />
        </g>
      )}
    </svg>
  );
};

const ClayEyebrow: React.FC<{ cx: number; cy: number; tilt: number }> = ({ cx, cy, tilt }) => {
  const len = 26;
  const dy = Math.sin((tilt * Math.PI) / 180) * (len / 2);
  return (
    <path
      d={`M ${cx - len / 2} ${cy + dy} Q ${cx} ${cy + dy / 2 - 1} ${cx + len / 2} ${cy - dy}`}
      stroke="#15151c"
      strokeWidth={9}
      strokeLinecap="round"
      fill="none"
    />
  );
};

const ClayMouth: React.FC<{ cx: number; cy: number; shape: Mouth }> = ({ cx, cy, shape }) => {
  const common = {
    stroke: "#15151c",
    strokeWidth: 7,
    strokeLinecap: "round" as const,
    fill: "none" as const,
  };
  if (shape === "flat") return <line x1={cx - 15} y1={cy} x2={cx + 15} y2={cy} {...common} />;
  if (shape === "down")
    return <path d={`M ${cx - 16} ${cy - 3} Q ${cx} ${cy + 11} ${cx + 16} ${cy - 3}`} {...common} />;
  if (shape === "small-up")
    return <path d={`M ${cx - 14} ${cy + 4} Q ${cx} ${cy - 7} ${cx + 14} ${cy + 4}`} {...common} />;
  return <ellipse cx={cx} cy={cy + 2} rx={9} ry={8} stroke="#15151c" strokeWidth={5} fill="#15151c" />;
};

// ----- Clay shadow -----
export const ClayShadow: React.FC<{
  x: number;
  y: number;
  heightScale: number;
  glow?: number;
}> = ({ x, y, heightScale, glow = 0.8 }) => {
  const wob = useClayWobble(x * 0.013 + 11);
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.05) * 6;

  const W = 440;
  const H = 560 * heightScale;
  const left = x - (W * heightScale) / 2 + wob.dx + sway;
  const top = y - H + wob.dy;

  const headR = 82;
  const headCX = W / 2;
  const headCY = 100;
  const bodyBottom = 360;

  return (
    <svg
      width={W * heightScale}
      height={H + 20}
      viewBox={`0 0 ${W} 560`}
      style={{
        position: "absolute",
        left,
        top,
        overflow: "visible",
        filter: `drop-shadow(0 0 ${12 + 22 * glow}px ${COLORS.accent}) drop-shadow(0 0 ${
          30 + 42 * glow
        }px ${COLORS.accent}88)`,
        zIndex: 55,
      }}
    >
      {/* back limbs */}
      <g stroke="url(#clay-shadow)" strokeWidth={32} strokeLinecap="round" fill="none">
        <path d={`M ${headCX - 60} ${headCY + headR + 12} Q ${headCX - 130} ${headCY + headR + 140} ${headCX - 100} ${headCY + headR + 280}`} />
        <path d={`M ${headCX + 60} ${headCY + headR + 12} Q ${headCX + 130} ${headCY + headR + 140} ${headCX + 100} ${headCY + headR + 280}`} />
        <path d={`M ${headCX - 35} ${bodyBottom} Q ${headCX - 70} ${bodyBottom + 80} ${headCX - 55} ${540 - 8}`} />
        <path d={`M ${headCX + 35} ${bodyBottom} Q ${headCX + 70} ${bodyBottom + 80} ${headCX + 55} ${540 - 8}`} />
      </g>
      {/* glow outline on limbs */}
      <g stroke={COLORS.accent} strokeWidth={4} strokeLinecap="round" fill="none">
        <path d={`M ${headCX - 60} ${headCY + headR + 12} Q ${headCX - 130} ${headCY + headR + 140} ${headCX - 100} ${headCY + headR + 280}`} />
        <path d={`M ${headCX + 60} ${headCY + headR + 12} Q ${headCX + 130} ${headCY + headR + 140} ${headCX + 100} ${headCY + headR + 280}`} />
        <path d={`M ${headCX - 35} ${bodyBottom} Q ${headCX - 70} ${bodyBottom + 80} ${headCX - 55} ${540 - 8}`} />
        <path d={`M ${headCX + 35} ${bodyBottom} Q ${headCX + 70} ${bodyBottom + 80} ${headCX + 55} ${540 - 8}`} />
      </g>
      {/* body */}
      <path
        d={`M ${headCX - 70} ${headCY + headR - 10}
            Q ${headCX - 95} ${(headCY + bodyBottom) / 2} ${headCX - 80} ${bodyBottom}
            L ${headCX + 80} ${bodyBottom}
            Q ${headCX + 95} ${(headCY + bodyBottom) / 2} ${headCX + 70} ${headCY + headR - 10} Z`}
        fill="url(#clay-shadow)"
        stroke={COLORS.accent}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* head */}
      <circle
        cx={headCX}
        cy={headCY}
        r={headR}
        fill="url(#clay-shadow)"
        stroke={COLORS.accent}
        strokeWidth={5}
      />
      {/* slit eyes */}
      <g stroke={COLORS.accent} strokeWidth={6} strokeLinecap="round">
        <line x1={headCX - 30} y1={headCY - 4} x2={headCX - 10} y2={headCY - 4} />
        <line x1={headCX + 10} y1={headCY - 4} x2={headCX + 30} y2={headCY - 4} />
      </g>
    </svg>
  );
};

// --- Clay city silhouette scrolling behind a running character.
export const ClayCityScroll: React.FC<{ speed?: number; floorY?: number }> = ({
  speed = 14,
  floorY = LAYOUT.floorY,
}) => {
  const frame = useCurrentFrame();
  const patternWidth = 1920;
  const offset = (frame * speed) % patternWidth;

  const buildings = [
    { x: 40, w: 180, h: 340, windows: [[40, 60], [100, 60], [40, 140], [100, 220]] },
    { x: 260, w: 140, h: 260, windows: [[30, 60], [80, 140]] },
    { x: 430, w: 220, h: 420, windows: [[40, 80], [120, 80], [40, 180], [120, 180], [40, 280]] },
    { x: 690, w: 100, h: 200, windows: [[30, 60]] },
    { x: 830, w: 260, h: 380, windows: [[50, 80], [140, 80], [50, 180], [140, 280]] },
    { x: 1120, w: 160, h: 300, windows: [[40, 80], [100, 180]] },
    { x: 1320, w: 200, h: 440, windows: [[40, 60], [120, 60], [40, 160], [120, 260], [40, 360]] },
    { x: 1560, w: 140, h: 280, windows: [[30, 80], [80, 180]] },
    { x: 1740, w: 120, h: 220, windows: [[30, 60]] },
  ];

  const Row: React.FC<{ translate: number }> = ({ translate }) => (
    <g transform={`translate(${translate} 0)`}>
      {buildings.map((b, i) => (
        <g key={i}>
          {/* Building body with a left-to-right gradient so it reads as clay with a lit side */}
          <rect
            x={b.x}
            y={floorY - b.h}
            width={b.w}
            height={b.h}
            rx={10}
            fill="url(#clay-building)"
          />
          {/* Rim highlight on the lit side */}
          <rect x={b.x + 3} y={floorY - b.h + 4} width={6} height={b.h - 10} rx={3} fill="#3a3a4a" opacity={0.7} />
          {/* Windows */}
          {b.windows.map(([wx, wy], j) => (
            <rect
              key={j}
              x={b.x + wx}
              y={floorY - b.h + wy}
              width={16}
              height={20}
              rx={3}
              fill="#ffd27a"
              opacity={0.85}
            />
          ))}
        </g>
      ))}
    </g>
  );

  return (
    <svg
      width={FILM.width}
      height={FILM.height}
      style={{ position: "absolute", inset: 0, zIndex: 10 }}
    >
      <defs>
        <linearGradient id="clay-building" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#32324a" />
          <stop offset="55%" stopColor="#16162a" />
          <stop offset="100%" stopColor="#07070e" />
        </linearGradient>
      </defs>
      <Row translate={-offset} />
      <Row translate={patternWidth - offset} />
    </svg>
  );
};

// ----- Clay actions -----

export const ClayJumping: React.FC<ClayCharProps & { cyclesPerSec?: number }> = ({
  cyclesPerSec = 1.4,
  ...props
}) => {
  const frame = useCurrentFrame();
  const t = (frame / FILM.fps) * cyclesPerSec * Math.PI * 2;
  const hop = Math.min(0, Math.sin(t)) * 38;

  // Phase 0..1 — one full rotation of the rope per cycle.
  const phase = ((frame * cyclesPerSec) / FILM.fps) % 1;
  const angle = phase * 2 * Math.PI;

  const { x, y } = props;
  const s = props.scale ?? 1.6;
  const handY = y - 160 * s + hop;
  // Rope ENDPOINTS match the character's actual hand positions in stand pose.
  const handLX = x - 75 * s;
  const handRX = x + 75 * s;

  // The rope arcs from one hand to the other. The apex is directly above the
  // character when overhead (phase 0), flat at the sides (phase 0.25 / 0.75),
  // and directly below when underfoot (phase 0.5). Pure vertical "jumping
  // rope" motion — the rope never sweeps sideways around the torso.
  const maxApex = 470 * s;
  const apexDist = Math.cos(angle) * maxApex;

  // ONE cubic bezier shaped like a rope held in both hands: the sides leave
  // the hands going straight up (control points directly above each hand),
  // then curve inward to form an arch at the top. Control-point Y is 4/3 of
  // the apex distance so the midpoint of the curve lands at apexDist above
  // the hands.
  const ctrlY = handY - (4 * apexDist) / 3;
  const ropePath = `M ${handLX} ${handY} C ${handLX} ${ctrlY} ${handRX} ${ctrlY} ${handRX} ${handY}`;

  // Opacity: fully bright at over / under, dimmer at the edge-on side moments
  // to suggest the rope is briefly edge-on rather than looping around.
  const visibility = Math.abs(Math.cos(angle));
  const opacity = 0.25 + 0.75 * visibility;

  return (
    <>
      <ClayCharacter
        {...props}
        pose="stand"
        bounceY={hop}
        eyebrows={props.eyebrows ?? { tilt: 15 }}
        mouth={props.mouth ?? "open"}
      />
      <svg
        width={FILM.width}
        height={FILM.height}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          overflow: "visible",
          pointerEvents: "none",
          zIndex: 62,
        }}
      >
        <path
          d={ropePath}
          stroke="#e8d9b5"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          opacity={opacity}
        />
      </svg>
    </>
  );
};

// Side-profile running character. Faces to the right so he appears to run
// left-to-right as the city scrolls past behind him.
export const ClayRunning: React.FC<{
  x: number;
  y: number;
  eyebrows?: Eyebrows;
  mouth?: Mouth;
  cyclesPerSec?: number;
  item?: "jumprope" | "none";
  // Pot-belly size, 0 = flat, 1 = full belly. Animate down to show weight loss.
  bellyScale?: number;
}> = ({
  x,
  y,
  eyebrows = { tilt: 15 },
  mouth = "open",
  cyclesPerSec = 1.8,
  item = "none",
  bellyScale = 0,
}) => {
  const frame = useCurrentFrame();
  const wob = useClayWobble(x * 0.013);
  const t = (frame / FILM.fps) * cyclesPerSec * Math.PI * 2;
  const swing = Math.sin(t); // -1 to 1
  const bob = Math.abs(Math.sin(t * 2)) * -6;

  const s = 1.6;
  const W = 440;
  const H = 540;
  const left = x - (W * s) / 2 + wob.dx;
  const top = y - H * s + wob.dy + bob;

  const cx = W / 2;
  const headCX = cx + 20; // head shifted forward (he faces right)
  const headCY = 108;
  const headR = 80;

  const bodyTop = headCY + headR - 10;
  const bodyBottom = 330;
  const hipY = bodyBottom - 4;
  const shoulderY = bodyTop + 22;
  const legEndY = H - 15;
  const stride = 70;
  const lift = 40;

  // Front (right) leg: foot position sweeps forward/back; lifts when swinging forward.
  const frontFootX = cx + swing * stride;
  const frontFootY = legEndY - Math.max(0, swing) * lift;
  // Back (left) leg: opposite phase.
  const backFootX = cx - swing * stride;
  const backFootY = legEndY - Math.max(0, -swing) * lift;

  // Arms pump opposite to legs.
  const frontHandX = cx + 10 - swing * 60;
  const frontHandY = shoulderY + 90 - Math.max(0, -swing) * 25;
  const backHandX = cx - 10 + swing * 60;
  const backHandY = shoulderY + 90 - Math.max(0, swing) * 25;

  const bodyLean = 10; // degrees forward
  return (
    <svg
      width={W * s}
      height={(H + 30) * s}
      viewBox={`0 0 ${W} ${H + 30}`}
      style={{
        position: "absolute",
        left,
        top,
        overflow: "visible",
        transform: `rotate(${wob.rot}deg)`,
        transformOrigin: "center bottom",
        zIndex: 60,
      }}
    >
      {/* ground shadow */}
      <ellipse cx={cx + 10} cy={H + 8} rx={95} ry={11} fill="#000000" opacity={0.55} />

      {/* BACK leg (slightly dimmer to suggest depth) */}
      <path
        d={`M ${cx - 6} ${hipY} Q ${cx - 10} ${(hipY + backFootY) / 2} ${backFootX} ${backFootY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={38}
        strokeLinecap="round"
        fill="none"
        opacity={0.78}
      />
      <ellipse cx={backFootX} cy={backFootY} rx={28} ry={14} fill="url(#clay-char-limb)" opacity={0.88} />

      {/* BACK arm */}
      <path
        d={`M ${cx - 12} ${shoulderY} Q ${backHandX - 4} ${shoulderY + 60} ${backHandX} ${backHandY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={34}
        strokeLinecap="round"
        fill="none"
        opacity={0.78}
      />
      <circle cx={backHandX} cy={backHandY} r={22} fill="url(#clay-char-limb)" opacity={0.88} />

      {/* BODY (profile - narrower, leaning forward) */}
      <g transform={`rotate(${bodyLean} ${cx} ${bodyBottom})`}>
        <path
          d={`M ${cx - 32} ${bodyTop}
              Q ${cx - 44} ${(bodyTop + bodyBottom) / 2} ${cx - 22} ${bodyBottom}
              L ${cx + 28} ${bodyBottom}
              Q ${cx + 46} ${(bodyTop + bodyBottom) / 2} ${cx + 32} ${bodyTop} Z`}
          fill="url(#clay-char)"
        />
        {/* Pot belly — a clay bulge in front of the lower torso that shrinks
            as `bellyScale` decreases. He faces right, so it protrudes right. */}
        {bellyScale > 0.01 && (
          <ellipse
            cx={cx + 28}
            cy={bodyBottom - 45}
            rx={38 * bellyScale}
            ry={44 * Math.min(1, bellyScale * 1.2)}
            fill="url(#clay-char)"
          />
        )}
        <ellipse cx={cx - 8} cy={bodyTop + 30} rx={13} ry={9} fill="#ffffff" opacity={0.28} />
      </g>

      {/* FRONT leg (over body) */}
      <path
        d={`M ${cx + 6} ${hipY} Q ${cx + 15} ${(hipY + frontFootY) / 2} ${frontFootX} ${frontFootY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={38}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx={frontFootX} cy={frontFootY} rx={28} ry={14} fill="url(#clay-char-limb)" />

      {/* FRONT arm */}
      <path
        d={`M ${cx + 12} ${shoulderY} Q ${frontHandX + 4} ${shoulderY + 60} ${frontHandX} ${frontHandY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={34}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={frontHandX} cy={frontHandY} r={22} fill="url(#clay-char-limb)" />

      {/* HEAD */}
      <circle cx={headCX} cy={headCY} r={headR} fill="url(#clay-char)" />
      <ellipse cx={headCX - 18} cy={headCY - 40} rx={18} ry={11} fill="#ffffff" opacity={0.35} />

      {/* FACE — profile: single visible eye, eyebrow, and mouth on the right side */}
      <circle cx={headCX + 28} cy={headCY - 4} r={7} fill="#15151c" />
      <circle cx={headCX + 30} cy={headCY - 6} r={1.8} fill="#ffffff" />
      <ClayEyebrow
        cx={headCX + 28}
        cy={headCY - 25 - (eyebrows.drop ?? 0)}
        tilt={eyebrows.tilt}
      />
      <ClayMouth cx={headCX + 30} cy={headCY + 24} shape={mouth} />

      {/* Jump rope coil held in the front hand, so he still carries the item while running */}
      {item === "jumprope" && (
        <g stroke="#e8d9b5" strokeWidth={3.5} fill="none" strokeLinecap="round">
          <ellipse cx={frontHandX + 4} cy={frontHandY + 12} rx={22} ry={9} />
          <ellipse cx={frontHandX + 4} cy={frontHandY + 22} rx={22} ry={9} />
        </g>
      )}
    </svg>
  );
};

// Collapsed character — flat on the floor, face down after exhausting himself.
// Head rests on the ground, body extends behind, arms splayed forward, legs
// trailing. Reads unambiguously as "wiped out", not "sitting".
export const ClayCollapsed: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const wob = useClayWobble(x * 0.013 + 7, 0.6);
  const frame = useCurrentFrame();
  const breath = Math.sin(frame * 0.08) * 1.5;

  const floorY = y - 2;
  // Head sits on the floor to the left; body stretches to the right.
  const headCX = x - 160;
  const headCY = floorY - 42 + breath;
  const headR = 48;

  // Body stroke runs along the floor from behind the head to the hips.
  const bodyStartX = headCX + 30;
  const bodyEndX = x + 110;
  const bodyY = floorY - 22 + breath;

  // Legs trail further to the right, slightly splayed.
  const hipX = bodyEndX;
  const footLX = x + 260;
  const footLY = floorY - 32;
  const footRX = x + 270;
  const footRY = floorY - 8;

  // Arms splayed forward of the head.
  const shoulderX = headCX + 20;
  const shoulderY = floorY - 28 + breath;
  const handLX = headCX - 90;
  const handLY = floorY - 8;
  const handRX = headCX - 60;
  const handRY = floorY - 44;

  return (
    <svg
      width={FILM.width}
      height={FILM.height}
      style={{
        position: "absolute",
        left: wob.dx,
        top: wob.dy,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {/* floor drop shadow */}
      <ellipse cx={x + 10} cy={floorY + 14} rx={260} ry={14} fill="#000000" opacity={0.55} />

      {/* back leg (behind body) */}
      <path
        d={`M ${hipX} ${bodyY} Q ${hipX + 70} ${floorY - 28} ${footRX} ${footRY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={36}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={footRX} cy={footRY} r={22} fill="url(#clay-char-limb)" />

      {/* body — rounded rect flat on the floor (a horizontal <line> stroked
          with a radial gradient would collapse to invisible). */}
      <rect
        x={bodyStartX}
        y={bodyY - 46}
        width={bodyEndX - bodyStartX}
        height={92}
        rx={46}
        ry={46}
        fill="url(#clay-char)"
      />
      {/* clay highlight along the top of the body */}
      <ellipse
        cx={(bodyStartX + bodyEndX) / 2 - 20}
        cy={bodyY - 30}
        rx={60}
        ry={10}
        fill="#ffffff"
        opacity={0.25}
      />

      {/* front leg */}
      <path
        d={`M ${hipX} ${bodyY} Q ${hipX + 70} ${floorY - 50} ${footLX} ${footLY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={36}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={footLX} cy={footLY} r={22} fill="url(#clay-char-limb)" />

      {/* arms splayed out past the head */}
      <path
        d={`M ${shoulderX} ${shoulderY} Q ${headCX - 40} ${floorY - 10} ${handLX} ${handLY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={34}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={handLX} cy={handLY} r={20} fill="url(#clay-char-limb)" />
      <path
        d={`M ${shoulderX} ${shoulderY} Q ${headCX - 20} ${floorY - 60} ${handRX} ${handRY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={34}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={handRX} cy={handRY} r={20} fill="url(#clay-char-limb)" />

      {/* head on the floor */}
      <circle cx={headCX} cy={headCY} r={headR} fill="url(#clay-char)" />
      {/* clay specular highlight */}
      <ellipse cx={headCX - 14} cy={headCY - 18} rx={10} ry={6} fill="#ffffff" opacity={0.4} />
      {/* closed-eye lines (face down but we see a sliver) */}
      <path
        d={`M ${headCX - 18} ${headCY - 2} q 8 4 16 0`}
        stroke="#1a1a1a"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M ${headCX + 6} ${headCY - 2} q 8 4 16 0`}
        stroke="#1a1a1a"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      {/* mouth — open, puffing */}
      <ellipse cx={headCX} cy={headCY + 20} rx={10} ry={5} fill="#1a1a1a" opacity={0.9} />
    </svg>
  );
};

// Flex character — stands with BOTH arms bent up in a double-bicep pose,
// wearing a bright sweatband on the forehead. Faces the camera.
export const ClayFlex: React.FC<{
  x: number;
  y: number;
  scale?: number;
  sweatband?: string;
}> = ({ x, y, scale = 1.4, sweatband = "#ff8a3d" }) => {
  const wob = useClayWobble(x * 0.019);
  const frame = useCurrentFrame();
  const breath = Math.sin(frame * 0.12) * 2;
  // Subtle bicep pulse — flexing harder, then relaxing a touch.
  const flex = 1 + Math.sin(frame * 0.18) * 0.08;

  const W = 440;
  const H = 560;
  const left = x - (W * scale) / 2 + wob.dx;
  const top = y - H * scale + wob.dy + breath;

  const headCX = W / 2;
  const headCY = 120;
  const headR = 85;

  const bodyTop = headCY + headR - 8;
  const bodyBottom = 340;
  const bodyW = 110;

  const armStart = bodyTop + 24;
  // Right arm (viewer's LEFT): upper arm angles UP and OUT to the elbow,
  // forearm continues up with a slight outward lean — a natural flex rather
  // than a rigid 90°.
  const rShoulderX = headCX - 55;
  const rShoulderY = armStart;
  const rElbowX = headCX - 155;
  const rElbowY = armStart - 40;
  const rFistX = headCX - 170;
  const rFistY = armStart - 150;
  // Left arm (viewer's RIGHT): mirror
  const lShoulderX = headCX + 55;
  const lShoulderY = armStart;
  const lElbowX = headCX + 155;
  const lElbowY = armStart - 40;
  const lFistX = headCX + 170;
  const lFistY = armStart - 150;

  const hipY = bodyBottom - 6;
  const footLX = headCX - 45;
  const footRX = headCX + 45;
  const legEndY = H - 15;

  return (
    <svg
      width={W * scale}
      height={H * scale + 30}
      viewBox={`0 0 ${W} ${H + 30}`}
      style={{
        position: "absolute",
        left,
        top,
        overflow: "visible",
        transform: `rotate(${wob.rot}deg)`,
        transformOrigin: "center bottom",
        zIndex: 60,
      }}
    >
      {/* ground shadow */}
      <ellipse cx={headCX} cy={H + 8} rx={95} ry={13} fill="#000000" opacity={0.55} />

      {/* legs */}
      <path
        d={`M ${headCX - 18} ${hipY} Q ${footLX - 6} ${(hipY + legEndY) / 2} ${footLX} ${legEndY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={38}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M ${headCX + 18} ${hipY} Q ${footRX + 6} ${(hipY + legEndY) / 2} ${footRX} ${legEndY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={38}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx={footLX} cy={legEndY} rx={28} ry={16} fill="url(#clay-char-limb)" />
      <ellipse cx={footRX} cy={legEndY} rx={28} ry={16} fill="url(#clay-char-limb)" />

      {/* body — chunky torso */}
      <path
        d={`M ${headCX - bodyW / 2} ${bodyTop}
            Q ${headCX - bodyW / 2 - 18} ${(bodyTop + bodyBottom) / 2} ${headCX - bodyW / 2 + 12} ${bodyBottom}
            L ${headCX + bodyW / 2 - 12} ${bodyBottom}
            Q ${headCX + bodyW / 2 + 18} ${(bodyTop + bodyBottom) / 2} ${headCX + bodyW / 2} ${bodyTop} Z`}
        fill="url(#clay-char)"
      />
      <ellipse cx={headCX - 22} cy={bodyTop + 36} rx={14} ry={9} fill="#ffffff" opacity={0.28} />

      {/* BICEP ARMS — double bicep, 90° bend: upper arm horizontal, forearm up */}
      {/* Right arm */}
      <path
        d={`M ${rShoulderX} ${rShoulderY} L ${rElbowX} ${rElbowY} L ${rFistX} ${rFistY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={34}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* right bicep bulge — sits above the angled upper arm */}
      <ellipse
        cx={(rShoulderX + rElbowX) / 2}
        cy={(rShoulderY + rElbowY) / 2 - 26}
        rx={32 * flex}
        ry={22 * flex}
        fill="url(#clay-char-limb)"
      />
      {/* right fist */}
      <circle cx={rFistX} cy={rFistY} r={22} fill="url(#clay-char-limb)" />

      {/* Left arm */}
      <path
        d={`M ${lShoulderX} ${lShoulderY} L ${lElbowX} ${lElbowY} L ${lFistX} ${lFistY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={34}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* left bicep bulge — sits above the angled upper arm */}
      <ellipse
        cx={(lShoulderX + lElbowX) / 2}
        cy={(lShoulderY + lElbowY) / 2 - 26}
        rx={32 * flex}
        ry={22 * flex}
        fill="url(#clay-char-limb)"
      />
      {/* left fist */}
      <circle cx={lFistX} cy={lFistY} r={22} fill="url(#clay-char-limb)" />

      {/* head */}
      <circle cx={headCX} cy={headCY} r={headR} fill="url(#clay-char)" />
      <ellipse cx={headCX - 24} cy={headCY - 34} rx={18} ry={11} fill="#ffffff" opacity={0.4} />

      {/* SWEATBAND — curved stripe across the forehead */}
      <path
        d={`M ${headCX - headR + 6} ${headCY - 36}
            Q ${headCX} ${headCY - 50} ${headCX + headR - 6} ${headCY - 36}
            L ${headCX + headR - 8} ${headCY - 18}
            Q ${headCX} ${headCY - 28} ${headCX - headR + 8} ${headCY - 18} Z`}
        fill={sweatband}
      />
      {/* sweatband highlight */}
      <ellipse cx={headCX - 18} cy={headCY - 38} rx={16} ry={4} fill="#ffffff" opacity={0.5} />

      {/* determined eyes */}
      <circle cx={headCX - 22} cy={headCY - 2} r={7} fill="#15151c" />
      <circle cx={headCX + 22} cy={headCY - 2} r={7} fill="#15151c" />
      {/* intense eyebrows */}
      <path
        d={`M ${headCX - 34} ${headCY - 20} L ${headCX - 12} ${headCY - 14}`}
        stroke="#1a1a1a"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d={`M ${headCX + 12} ${headCY - 14} L ${headCX + 34} ${headCY - 20}`}
        stroke="#1a1a1a"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* confident grin */}
      <path
        d={`M ${headCX - 20} ${headCY + 28} Q ${headCX} ${headCY + 44} ${headCX + 20} ${headCY + 28}`}
        stroke="#1a1a1a"
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// Pushup character — HANDS and FEET stay planted on the floor. Only the arms
// bend: the shoulder drops when the elbows bend, which pivots the body closer
// to the ground. At the top the body is inclined upward from feet to shoulder,
// forming a triangle with the ground. At the bottom the chest is near the floor.
export const ClayPushup: React.FC<{
  x: number;
  y: number;
  eyebrows?: Eyebrows;
  mouth?: Mouth;
  cyclesPerSec?: number;
}> = ({ x, y, eyebrows = { tilt: 20 }, mouth = "open", cyclesPerSec = 0.9 }) => {
  const frame = useCurrentFrame();
  const wob = useClayWobble(x * 0.013 + 3);
  const t = (frame / FILM.fps) * cyclesPerSec * Math.PI * 2;
  const depth = (Math.sin(t) + 1) / 2; // 0 = arms extended, 1 = arms bent

  const s = 1.6;
  const floorY = y - 2;
  const feetX = x + 190 * s;     // feet planted on the right
  const handX = x - 150 * s;     // hands planted on the left

  // Arm "length" — distance from floor to shoulder. Full when extended, short when bent.
  const armLenTop = 150 * s;
  const armLenBottom = 60 * s;
  const armLen = armLenTop - depth * (armLenTop - armLenBottom);

  // Shoulder sits directly above the planted hand, raised by the arm length.
  const shoulderX = handX;
  const shoulderY = floorY - armLen;

  // Body line runs straight from the shoulder to the planted feet. Its angle
  // changes with depth (steep at top, nearly horizontal at the bottom).
  const bodyDx = shoulderX - feetX;
  const bodyDy = shoulderY - floorY;
  const bodyLen = Math.hypot(bodyDx, bodyDy);
  const ux = bodyDx / bodyLen;
  const uy = bodyDy / bodyLen;

  // Head sits just past the shoulder, in the body's direction.
  const headR = 52 * s;
  const headOffset = 58 * s;
  const headCX = shoulderX + ux * headOffset;
  const headCY = shoulderY + uy * headOffset;

  // Elbow swings toward the feet (to the right) as the arms bend — biomechanics of a real pushup.
  const elbowX = shoulderX + depth * 55 * s;
  const elbowY = (shoulderY + floorY) / 2 + depth * 12 * s;

  return (
    <svg
      width={FILM.width}
      height={FILM.height}
      style={{
        position: "absolute",
        left: wob.dx,
        top: wob.dy,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {/* Static shadow between the planted hands and feet */}
      <ellipse cx={x + 20 * s} cy={y + 12} rx={230 * s} ry={11 * s} fill="#000000" opacity={0.5} />

      {/* Body + leg as ONE straight thick stroke from shoulder to planted feet */}
      <line
        x1={shoulderX}
        y1={shoulderY}
        x2={feetX}
        y2={floorY}
        stroke="url(#clay-char-limb)"
        strokeWidth={56 * s}
        strokeLinecap="round"
      />

      {/* Toe cap at the planted foot */}
      <ellipse cx={feetX} cy={floorY} rx={30 * s} ry={11 * s} fill="url(#clay-char-limb)" />

      {/* Arm bending at the elbow. Hand stays planted. */}
      <path
        d={`M ${shoulderX} ${shoulderY} L ${elbowX} ${elbowY} L ${handX} ${floorY}`}
        stroke="url(#clay-char-limb)"
        strokeWidth={30 * s}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={handX} cy={floorY} r={20 * s} fill="url(#clay-char-limb)" />

      {/* Head stays upright even as the body tilts — face always looks forward */}
      <circle cx={headCX} cy={headCY} r={headR} fill="url(#clay-char)" />
      <ellipse cx={headCX - 15 * s} cy={headCY - 22 * s} rx={13 * s} ry={8 * s} fill="#ffffff" opacity={0.35} />
      <circle cx={headCX - 14 * s} cy={headCY - 4 * s} r={5 * s} fill="#15151c" />
      <circle cx={headCX + 2 * s} cy={headCY - 4 * s} r={5 * s} fill="#15151c" />
      <ClayEyebrow
        cx={headCX - 14 * s}
        cy={headCY - 22 * s - (eyebrows.drop ?? 0)}
        tilt={eyebrows.tilt}
      />
      <ClayEyebrow
        cx={headCX + 2 * s}
        cy={headCY - 22 * s - (eyebrows.drop ?? 0)}
        tilt={-eyebrows.tilt}
      />
      <ClayMouth cx={headCX - 6 * s} cy={headCY + 20 * s} shape={mouth} />
    </svg>
  );
};

// =====================================================================
// MindBubbles — the inner-voice visualization.
//
// Floating thought bubbles around the character's head carry words of
// DOUBT. In transition, each bubble EXPLODES in a puff of clay shards
// and is replaced by a word of CONFIDENCE in the accent color.
//
// Mode "doubt"      : only doubt bubbles (intensity scales count)
// Mode "transition" : staggered explosion from doubt -> confidence
// Mode "confidence" : only confidence words
// =====================================================================

// Longest words are placed at slot index 2 (inner-left) so they always have
// room on screen; short words fill the outer slots.
const DOUBT_WORDS = ["quit", "weak", "why?", "tired", "pointless", "stop"];
const CONFIDENCE_WORDS = ["again", "show up", "push", "rise", "keep going", "stronger"];
export const GROWING_WORDS = ["maybe", "i think...", "trying", "almost", "today", "a little"];

// Positions are relative to the cloud center (above the head). The six slots
// sit on a symmetric half-circle sized for the 1080-wide portrait frame —
// each left-side bubble mirrors a right-side bubble at the exact same height.
const SLOT_POSITIONS: { ox: number; oy: number }[] = [
  { ox: -340, oy: -120 },
  { ox: -290, oy: -300 },
  { ox: -110, oy: -400 },
  { ox: 110, oy: -400 },
  { ox: 290, oy: -300 },
  { ox: 340, oy: -120 },
];

export interface MindBubblesProps {
  x: number;
  y: number;
  mode: "doubt" | "transition" | "confidence";
  intensity?: number;
  transitionProgress?: number;
  accent?: string;
  // Override which word set appears BEFORE the transition (what explodes).
  // Defaults to DOUBT_WORDS. Pass GROWING_WORDS to pick up where another
  // shot left off.
  doubtWords?: string[];
  // Override the positive-word set that REPLACES the exploded words.
  // Defaults to CONFIDENCE_WORDS. Pass GROWING_WORDS for a "not quite
  // confident yet" ending.
  confidenceWords?: string[];
}

export const MindBubbles: React.FC<MindBubblesProps> = ({
  x,
  y,
  mode,
  intensity = 1,
  transitionProgress = 0,
  accent = COLORS.accent,
  doubtWords = DOUBT_WORDS,
  confidenceWords = CONFIDENCE_WORDS,
}) => {
  const frame = useCurrentFrame();
  const centerX = x;
  // Cluster well above the (now larger) character head, but kept low enough
  // that the words (and their explosion overshoot) stay inside the frame.
  const centerY = y - 700;

  const slots = SLOT_POSITIONS.map((slot, i) => {
    // Small bob kept SYNCED across all slots so the row stays level.
    const bob = Math.sin(frame * 0.05) * 3;
    const drift = Math.cos(frame * 0.04 + i * 0.7) * 3;
    return {
      cx: centerX + slot.ox + drift,
      cy: centerY + slot.oy + bob,
      doubtWord: doubtWords[i % doubtWords.length],
      confWord: confidenceWords[i % confidenceWords.length],
      stagger: (i / SLOT_POSITIONS.length) * 0.5, // each slot fires a bit later
    };
  });

  const clamped = Math.max(0, Math.min(1, intensity));
  const visibleCount = Math.max(0, Math.round(SLOT_POSITIONS.length * clamped));

  return (
    <svg
      width={FILM.width}
      height={FILM.height}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 68,
      }}
    >
      {slots.slice(0, visibleCount).map((s, i) => {
        if (mode === "doubt") {
          return <DoubtBubble key={i} cx={s.cx} cy={s.cy} word={s.doubtWord} seed={i} />;
        }
        if (mode === "confidence") {
          return (
            <ConfidenceWord
              key={i}
              cx={s.cx}
              cy={s.cy}
              word={s.confWord}
              seed={i}
              accent={accent}
            />
          );
        }
        // Transition: each slot runs doubt -> explode -> confidence
        const localP = (transitionProgress - s.stagger) * 2;
        if (localP < 0) {
          return <DoubtBubble key={i} cx={s.cx} cy={s.cy} word={s.doubtWord} seed={i} />;
        }
        if (localP < 0.5) {
          const explodeT = localP / 0.5;
          return (
            <ExplodingBubble
              key={i}
              cx={s.cx}
              cy={s.cy}
              word={s.doubtWord}
              progress={explodeT}
            />
          );
        }
        const appearT = Math.min(1, (localP - 0.5) / 0.5);
        return (
          <ConfidenceWord
            key={i}
            cx={s.cx}
            cy={s.cy}
            word={s.confWord}
            seed={i}
            accent={accent}
            appearProgress={appearT}
          />
        );
      })}
    </svg>
  );
};

const DoubtBubble: React.FC<{ cx: number; cy: number; word: string; seed: number }> = ({
  cx,
  cy,
  word,
  seed,
}) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame * 0.12 + seed * 1.5) * 0.04;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${pulse})`}>
      <text
        x={0}
        y={20}
        fontFamily={FONT_FAMILY}
        fontSize={72}
        fontWeight={900}
        textAnchor="middle"
        fill="#d8d8de"
        opacity={0.9}
      >
        {word}
      </text>
    </g>
  );
};

const ExplodingBubble: React.FC<{
  cx: number;
  cy: number;
  word: string;
  progress: number;
}> = ({ cx, cy, word, progress }) => {
  const scale = 1 + progress * 1.6;
  const op = Math.max(0, 1 - progress);
  const shards = [];
  const shardCount = 8;
  for (let i = 0; i < shardCount; i++) {
    const a = (i / shardCount) * Math.PI * 2;
    const d = progress * 90;
    shards.push(
      <circle
        key={i}
        cx={cx + Math.cos(a) * d}
        cy={cy + Math.sin(a) * d - progress * 30}
        r={Math.max(0, 9 - progress * 7)}
        fill="#d8d8de"
        opacity={Math.max(0, 1 - progress * 0.9)}
      />
    );
  }
  return (
    <g>
      <text
        x={cx}
        y={cy + 20}
        fontFamily={FONT_FAMILY}
        fontSize={72 * scale}
        fontWeight={900}
        textAnchor="middle"
        fill="#d8d8de"
        opacity={op}
      >
        {word}
      </text>
      {shards}
    </g>
  );
};

const ConfidenceWord: React.FC<{
  cx: number;
  cy: number;
  word: string;
  seed: number;
  accent: string;
  appearProgress?: number;
}> = ({ cx, cy, word, seed, accent, appearProgress = 1 }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.07 + seed * 1.1) * 3;
  const scale =
    appearProgress < 0.6
      ? interpolate(appearProgress, [0, 0.6], [0.1, 1.35], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(appearProgress, [0.6, 1], [1.35, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const op = Math.min(1, appearProgress * 2);
  return (
    <g transform={`translate(${cx} ${cy + bob}) scale(${scale})`} opacity={op}>
      <text
        x={0}
        y={20}
        fontFamily={FONT_FAMILY}
        fontSize={72}
        fontWeight={900}
        textAnchor="middle"
        fill={accent}
        style={{ filter: `drop-shadow(0 0 12px ${accent}) drop-shadow(0 0 28px ${accent}88)` }}
      >
        {word}
      </text>
    </g>
  );
};
