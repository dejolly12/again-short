import { useCurrentFrame } from "remotion";
import { COLORS } from "./theme";

// Eyebrow angles (degrees). Positive = outer end up. Negative = outer end down (sad/tired).
// Mouth shape is a single line; we express it as a curvature value.
export type Eyebrows = { tilt: number; drop?: number };
export type Mouth = "flat" | "down" | "open" | "small-up";

type Props = {
  x: number;
  y: number; // y of the floor the character stands on
  scale?: number;
  color?: string;
  eyebrows?: Eyebrows;
  mouth?: Mouth;
  eyesClosed?: boolean;
  pose?: "sit" | "stand";
  item?: "jumprope" | "none";
  breath?: boolean;
};

// A simple noodle-limbed character. Drawn in a 400x520 local box (head-centered-ish).
// Everything is a <g> at scale, positioned so his feet sit on y.
export const Character: React.FC<Props> = ({
  x,
  y,
  scale = 1,
  color = COLORS.character,
  eyebrows = { tilt: 0, drop: 0 },
  mouth = "flat",
  eyesClosed = false,
  pose = "stand",
  item = "none",
  breath = true,
}) => {
  const frame = useCurrentFrame();
  const breathOffset = breath ? Math.sin(frame * 0.12) * 3 : 0;

  // Local coordinates. Origin at bottom-centre of the figure.
  const W = 400;
  const H = pose === "sit" ? 380 : 520;
  const left = x - (W * scale) / 2;
  const top = y - H * scale;

  const headR = 70;
  // In local coords, y=H is feet. Head centre y:
  const headCY = pose === "sit" ? 130 + breathOffset : 100 + breathOffset;
  const headCX = W / 2;

  // Body line attachment (neck is non-existent, torso straight from head bottom)
  const bodyTopY = headCY + headR - 6;
  const bodyBottomY = pose === "sit" ? 260 : 320;

  // Arms
  const shoulderY = bodyTopY + 18;
  const leftShoulderX = headCX - 8;
  const rightShoulderX = headCX + 8;
  // Hand positions
  const leftHandY = pose === "sit" ? 300 : 360 + breathOffset * 0.5;
  const rightHandY = pose === "sit" ? 300 : 360 + breathOffset * 0.5;
  const leftHandX = pose === "sit" ? headCX - 85 : headCX - 55;
  const rightHandX = pose === "sit" ? headCX + 85 : headCX + 55;

  // Legs
  const hipY = bodyBottomY;
  const leftFootX = pose === "sit" ? headCX - 110 : headCX - 45;
  const rightFootX = pose === "sit" ? headCX + 110 : headCX + 45;
  const leftFootY = pose === "sit" ? 345 : H - 10;
  const rightFootY = pose === "sit" ? 345 : H - 10;

  return (
    <svg
      width={W * scale}
      height={H * scale}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", left, top, overflow: "visible" }}
    >
      <g
        stroke={color}
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Noodle limbs (drawn BEHIND head/face) */}
        {/* Left arm */}
        <path
          d={`M ${leftShoulderX} ${shoulderY} Q ${leftShoulderX - 40} ${
            shoulderY + 60
          } ${leftHandX} ${leftHandY}`}
        />
        {/* Right arm */}
        <path
          d={`M ${rightShoulderX} ${shoulderY} Q ${rightShoulderX + 40} ${
            shoulderY + 60
          } ${rightHandX} ${rightHandY}`}
        />
        {/* Torso */}
        <line x1={headCX} y1={bodyTopY} x2={headCX} y2={bodyBottomY} />
        {/* Left leg */}
        <path
          d={`M ${headCX - 2} ${hipY} Q ${leftFootX - 10} ${
            (hipY + leftFootY) / 2
          } ${leftFootX} ${leftFootY}`}
        />
        {/* Right leg */}
        <path
          d={`M ${headCX + 2} ${hipY} Q ${rightFootX + 10} ${
            (hipY + rightFootY) / 2
          } ${rightFootX} ${rightFootY}`}
        />
      </g>

      {/* Head (filled circle, no outline — flat character) */}
      <circle cx={headCX} cy={headCY} r={headR} fill={color} />

      {/* Face */}
      <g fill={COLORS.background} stroke={COLORS.background}>
        {eyesClosed ? (
          <>
            <line
              x1={headCX - 24}
              y1={headCY - 4}
              x2={headCX - 12}
              y2={headCY - 4}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <line
              x1={headCX + 12}
              y1={headCY - 4}
              x2={headCX + 24}
              y2={headCY - 4}
              strokeWidth={4}
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx={headCX - 18} cy={headCY - 6} r={5} />
            <circle cx={headCX + 18} cy={headCY - 6} r={5} />
          </>
        )}

        {/* Eyebrows: short tilted lines above the eyes */}
        <Eyebrow
          cx={headCX - 18}
          cy={headCY - 22 - (eyebrows.drop ?? 0)}
          tilt={eyebrows.tilt}
          side="left"
        />
        <Eyebrow
          cx={headCX + 18}
          cy={headCY - 22 - (eyebrows.drop ?? 0)}
          tilt={-eyebrows.tilt}
          side="right"
        />

        {/* Mouth (one line) */}
        <MouthShape cx={headCX} cy={headCY + 24} shape={mouth} />
      </g>

      {/* Item: jump rope coiled around right hand */}
      {item === "jumprope" && (
        <g stroke="#e8e3d9" strokeWidth={3.5} fill="none" strokeLinecap="round">
          {/* small coil loops */}
          <ellipse cx={rightHandX + 2} cy={rightHandY + 6} rx={22} ry={10} />
          <ellipse cx={rightHandX + 2} cy={rightHandY + 14} rx={22} ry={10} />
          {/* a short dangling end */}
          <path
            d={`M ${rightHandX - 18} ${rightHandY + 16} Q ${rightHandX - 28} ${
              rightHandY + 34
            } ${rightHandX - 10} ${rightHandY + 44}`}
          />
        </g>
      )}
    </svg>
  );
};

const Eyebrow: React.FC<{ cx: number; cy: number; tilt: number; side: "left" | "right" }> = ({
  cx,
  cy,
  tilt,
}) => {
  const len = 20;
  const dy = Math.sin((tilt * Math.PI) / 180) * (len / 2);
  return (
    <line
      x1={cx - len / 2}
      y1={cy + dy}
      x2={cx + len / 2}
      y2={cy - dy}
      stroke={COLORS.background}
      strokeWidth={5}
      strokeLinecap="round"
    />
  );
};

const MouthShape: React.FC<{ cx: number; cy: number; shape: Mouth }> = ({ cx, cy, shape }) => {
  const common = {
    stroke: COLORS.background,
    strokeWidth: 5,
    strokeLinecap: "round" as const,
    fill: "none" as const,
  };
  if (shape === "flat") {
    return <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} {...common} />;
  }
  if (shape === "down") {
    return <path d={`M ${cx - 14} ${cy - 2} Q ${cx} ${cy + 10} ${cx + 14} ${cy - 2}`} {...common} />;
  }
  if (shape === "small-up") {
    return <path d={`M ${cx - 12} ${cy + 2} Q ${cx} ${cy - 6} ${cx + 12} ${cy + 2}`} {...common} />;
  }
  // open
  return <ellipse cx={cx} cy={cy + 2} rx={8} ry={7} {...common} />;
};

// --- Shadow: his inner voice. Same body, pure black, taller, glowing accent outline.
export const Shadow: React.FC<{
  x: number;
  y: number;
  heightScale: number; // 1 = same height as character, >1 taller
  glow?: number; // 0..1
}> = ({ x, y, heightScale, glow = 0.8 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.05) * 6;

  const W = 400;
  const H = 540 * heightScale;
  const left = x - (W * heightScale) / 2;
  const top = y - H;

  const headR = 70;
  const headCX = W / 2;
  const headCY = 90;
  const bodyBottomY = 360;
  const shoulderY = headCY + headR + 10;

  return (
    <svg
      width={W * heightScale}
      height={H}
      viewBox={`0 0 ${W} ${540}`}
      style={{
        position: "absolute",
        left: left + sway,
        top,
        overflow: "visible",
        filter: `drop-shadow(0 0 ${12 + 18 * glow}px ${COLORS.accent}) drop-shadow(0 0 ${
          30 + 40 * glow
        }px ${COLORS.accent})`,
      }}
    >
      {/* Body — solid black with accent-coloured outline */}
      <g
        stroke={COLORS.accent}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={COLORS.shadow}
      >
        {/* Head */}
        <circle cx={headCX} cy={headCY} r={headR} />
        {/* Torso */}
        <path
          d={`M ${headCX - 55} ${headCY + headR - 10} L ${headCX - 60} ${bodyBottomY} L ${
            headCX + 60
          } ${bodyBottomY} L ${headCX + 55} ${headCY + headR - 10} Z`}
        />
      </g>

      {/* Noodle limbs */}
      <g
        stroke={COLORS.shadow}
        strokeWidth={18}
        strokeLinecap="round"
        fill="none"
      >
        <path d={`M ${headCX - 55} ${shoulderY} Q ${headCX - 120} ${shoulderY + 90} ${headCX - 90} ${shoulderY + 180}`} />
        <path d={`M ${headCX + 55} ${shoulderY} Q ${headCX + 120} ${shoulderY + 90} ${headCX + 90} ${shoulderY + 180}`} />
        <path d={`M ${headCX - 30} ${bodyBottomY} Q ${headCX - 60} ${bodyBottomY + 80} ${headCX - 55} ${540 - 8}`} />
        <path d={`M ${headCX + 30} ${bodyBottomY} Q ${headCX + 60} ${bodyBottomY + 80} ${headCX + 55} ${540 - 8}`} />
      </g>
      <g stroke={COLORS.accent} strokeWidth={4} strokeLinecap="round" fill="none">
        <path d={`M ${headCX - 55} ${shoulderY} Q ${headCX - 120} ${shoulderY + 90} ${headCX - 90} ${shoulderY + 180}`} />
        <path d={`M ${headCX + 55} ${shoulderY} Q ${headCX + 120} ${shoulderY + 90} ${headCX + 90} ${shoulderY + 180}`} />
        <path d={`M ${headCX - 30} ${bodyBottomY} Q ${headCX - 60} ${bodyBottomY + 80} ${headCX - 55} ${540 - 8}`} />
        <path d={`M ${headCX + 30} ${bodyBottomY} Q ${headCX + 60} ${bodyBottomY + 80} ${headCX + 55} ${540 - 8}`} />
      </g>

      {/* Two slit eyes */}
      <g stroke={COLORS.accent} strokeWidth={6} strokeLinecap="round">
        <line x1={headCX - 28} y1={headCY - 4} x2={headCX - 10} y2={headCY - 4} />
        <line x1={headCX + 10} y1={headCY - 4} x2={headCX + 28} y2={headCY - 4} />
      </g>
    </svg>
  );
};
