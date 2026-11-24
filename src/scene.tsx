import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FILM, LAYOUT, FONT_FAMILY } from "./theme";

// Thin black letterbox bars, top and bottom.
export const Letterbox: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        bottom: "auto",
        height: LAYOUT.letterboxHeight,
        background: COLORS.letterbox,
        zIndex: 100,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        top: "auto",
        height: LAYOUT.letterboxHeight,
        background: COLORS.letterbox,
        zIndex: 100,
      }}
    />
  </>
);

// A reusable SVG wobble filter. Give any <g filter="url(#wobble)"> a hand-drawn edge.
export const WobbleDefs: React.FC = () => (
  <svg
    width={0}
    height={0}
    style={{ position: "absolute" }}
    aria-hidden
  >
    <defs>
      <filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="3" />
      </filter>
      <filter id="wobble-strong" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
    </defs>
  </svg>
);

// A long thin wobbly grey horizontal floor line.
export const Floor: React.FC = () => (
  <svg
    width={FILM.width}
    height={40}
    viewBox={`0 0 ${FILM.width} 40`}
    style={{ position: "absolute", top: LAYOUT.floorY, left: 0, zIndex: 50 }}
  >
    <g filter="url(#wobble)">
      <line
        x1={0}
        y1={20}
        x2={FILM.width}
        y2={20}
        stroke={COLORS.floor}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.9}
      />
    </g>
  </svg>
);

// Big soft radial glow centered at (x, y).
export const Glow: React.FC<{
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity?: number;
}> = ({ x, y, radius, color, intensity = 0.55 }) => (
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
    }}
  />
);

// A standing lamp: thin pole, trapezoid shade, with a warm pool of light on the floor.
export const Lamp: React.FC<{ x: number; floorY?: number }> = ({
  x,
  floorY = LAYOUT.floorY,
}) => {
  const frame = useCurrentFrame();
  const flicker = 1 + Math.sin(frame * 0.18) * 0.03 + Math.sin(frame * 0.07) * 0.02;

  const poleTop = floorY - 420;
  const shadeY = poleTop - 130;
  const shadeHalfTop = 60;
  const shadeHalfBottom = 130;

  return (
    <>
      <Glow x={x} y={floorY} radius={520 * flicker} color="#ffb066" intensity={0.6 * flicker} />
      <Glow x={x} y={floorY - 120} radius={900 * flicker} color="#ffa050" intensity={0.25 * flicker} />
      <Glow x={x} y={poleTop - 20} radius={180 * flicker} color="#fff2cc" intensity={0.7 * flicker} />

      <svg
        width={400}
        height={floorY}
        viewBox={`0 0 400 ${floorY}`}
        style={{ position: "absolute", left: x - 200, top: 0, zIndex: 40 }}
      >
        <g filter="url(#wobble)" stroke={COLORS.outline} strokeWidth={3.5} fill="none" strokeLinecap="round">
          <line x1={150} y1={floorY - 6} x2={250} y2={floorY - 6} strokeWidth={5} />
          <line x1={200} y1={floorY - 10} x2={200} y2={poleTop} />
          <path
            d={`M ${200 - shadeHalfBottom} ${shadeY + 130} L ${200 + shadeHalfBottom} ${
              shadeY + 130
            } L ${200 + shadeHalfTop} ${shadeY} L ${200 - shadeHalfTop} ${shadeY} Z`}
            fill={COLORS.background}
          />
          <line
            x1={200 - shadeHalfBottom + 8}
            y1={shadeY + 130}
            x2={200 + shadeHalfBottom - 8}
            y2={shadeY + 130}
            stroke="#ffd59e"
            strokeWidth={5}
          />
        </g>
      </svg>
    </>
  );
};

// Small "DAY N" counter top-left. Fades in.
export const DayCounter: React.FC<{ day: number; fadeInFrame?: number }> = ({
  day,
  fadeInFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [fadeInFrame, fadeInFrame + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <div
      style={{
        position: "absolute",
        top: LAYOUT.letterboxHeight + 28,
        left: 56,
        color: COLORS.narrator,
        fontFamily: FONT_FAMILY,
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: 4,
        opacity,
        zIndex: 90,
      }}
    >
      DAY {day}
    </div>
  );
};

// Narrator line: small, white, top-centre, 8 words max, fades in and out.
export const NarratorLine: React.FC<{
  text: string;
  inFrame: number;
  outFrame: number;
  fade?: number;
}> = ({ text, inFrame, outFrame, fade = 15 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [inFrame, inFrame + fade, outFrame - fade, outFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <div
      style={{
        position: "absolute",
        top: LAYOUT.letterboxHeight + 32,
        left: 0,
        right: 0,
        textAlign: "center",
        color: COLORS.narrator,
        fontFamily: FONT_FAMILY,
        fontSize: 36,
        fontWeight: 400,
        letterSpacing: 1,
        opacity,
        zIndex: 90,
      }}
    >
      {text}
    </div>
  );
};

// The full dark background canvas.
export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.background }} />
);

// Rep count pop — a number or label (e.g., "+5", "20") that pops and fades.
export const RepCount: React.FC<{
  text: string;
  inFrame: number;
  duration?: number;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
}> = ({
  text,
  inFrame,
  duration = 40,
  x = FILM.width * 0.5,
  y = 380,
  color = COLORS.narrator,
  size = 110,
}) => {
  const frame = useCurrentFrame();
  const local = frame - inFrame;
  if (local < 0 || local > duration) return null;
  const scale = interpolate(local, [0, 6, 12, duration], [0.2, 1.3, 1, 1], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(
    local,
    [0, 4, duration - 12, duration],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );
  const rise = interpolate(local, [0, duration], [0, -30], {
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + rise,
        transform: `translate(-50%, -50%) scale(${scale})`,
        color,
        fontFamily: FONT_FAMILY,
        fontSize: size,
        fontWeight: 700,
        textShadow: `0 0 20px ${color}, 0 0 40px ${color}80`,
        opacity,
        zIndex: 80,
      }}
    >
      {text}
    </div>
  );
};

// Full-screen white flash. Short, sharp.
export const Flash: React.FC<{ inFrame: number; duration?: number; color?: string }> = ({
  inFrame,
  duration = 10,
  color = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const local = frame - inFrame;
  if (local < 0 || local > duration) return null;
  const opacity = interpolate(local, [0, 2, duration], [0, 1, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ background: color, opacity, zIndex: 95, pointerEvents: "none" }}
    />
  );
};

// Horizontal speed lines flashing across the frame for big hits.
export const SpeedLines: React.FC<{ inFrame: number; duration?: number }> = ({
  inFrame,
  duration = 18,
}) => {
  const frame = useCurrentFrame();
  const local = frame - inFrame;
  if (local < 0 || local > duration) return null;
  const opacity = interpolate(local, [0, 3, duration - 5, duration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  // deterministic line placements
  const seeds = [1, 7, 13, 23, 31, 41, 53, 61, 71, 83, 97, 109];
  return (
    <svg
      width={FILM.width}
      height={FILM.height}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 85,
        opacity,
        pointerEvents: "none",
      }}
    >
      {seeds.map((s, i) => {
        const y = 140 + ((s * 37) % (FILM.height - 300));
        const len = 180 + ((s * 13) % 260);
        const direction = i % 2 === 0 ? 1 : -1;
        const x =
          direction > 0
            ? (local * 220 + s * 40) % (FILM.width + 400) - 200
            : FILM.width - ((local * 220 + s * 40) % (FILM.width + 400)) + 200;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + len * direction}
            y2={y}
            stroke="#ffffff"
            strokeWidth={4}
            opacity={0.7}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

// The shadow's line: cyan, Comic Neue, beside the shadow. Fades in and out.
export const ShadowLine: React.FC<{
  text: string;
  inFrame: number;
  outFrame: number;
  x: number;
  y: number;
  size?: number;
}> = ({ text, inFrame, outFrame, x, y, size = 46 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [inFrame, inFrame + 10, outFrame - 10, outFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        color: COLORS.accent,
        fontFamily: FONT_FAMILY,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 1,
        opacity,
        textShadow: `0 0 12px ${COLORS.accent}, 0 0 28px ${COLORS.accent}80`,
        zIndex: 80,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

// Scrolling city silhouette behind running character. Buildings in dark grey with some window lights.
export const CityScroll: React.FC<{ speed?: number; floorY?: number }> = ({
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
          <rect
            x={b.x}
            y={floorY - b.h}
            width={b.w}
            height={b.h}
            fill="#1a1a24"
          />
          {b.windows.map(([wx, wy], j) => (
            <rect
              key={j}
              x={b.x + wx}
              y={floorY - b.h + wy}
              width={14}
              height={18}
              fill="#ffd27a"
              opacity={0.75}
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
      <Row translate={-offset} />
      <Row translate={patternWidth - offset} />
    </svg>
  );
};
