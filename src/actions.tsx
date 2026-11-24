import { useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "./theme";

// Specialised action components — these draw their own SVG so limbs can animate
// without stretching the generic Character component.

type BaseProps = {
  x: number;
  y: number; // floor Y (feet rest here)
  scale?: number;
  color?: string;
  eyebrows?: { tilt: number; drop?: number };
  mouth?: "flat" | "down" | "open" | "small-up";
  item?: "jumprope" | "none";
};

// --- Character jumping rope.
// cyclesPerSec controls rope speed. The rope is drawn as two arcs that swap every half cycle.
export const JumpingCharacter: React.FC<BaseProps & { cyclesPerSec?: number }> = ({
  x,
  y,
  scale = 1,
  color = COLORS.character,
  eyebrows = { tilt: 10, drop: 0 },
  mouth = "flat",
  cyclesPerSec = 1.2,
}) => {
  const frame = useCurrentFrame();
  const t = (frame / 30) * cyclesPerSec * Math.PI * 2; // radians

  // Vertical hop: 0 at bottom, -30 at peak.
  const hopPhase = Math.sin(t);
  const hop = Math.min(0, hopPhase) * 30; // negative = up

  // Rope phase: 0..1
  const ropeP = ((frame * cyclesPerSec) / 30) % 1;

  return (
    <g>
      <PoseCharacter
        x={x}
        y={y + hop}
        scale={scale}
        color={color}
        eyebrows={eyebrows}
        mouth={mouth}
        armAngle={-20}
        handsOut={70}
        legSpread={0}
        knees={hopPhase > 0 ? 10 : -20}
        bodyTilt={0}
      />
      <Rope x={x} y={y + hop} scale={scale} phase={ropeP} />
    </g>
  );
};

// A simple rope: when phase<0.5, draw rope arcing OVER the head. Otherwise UNDER the feet.
const Rope: React.FC<{ x: number; y: number; scale: number; phase: number }> = ({
  x,
  y,
  scale,
  phase,
}) => {
  const handLX = x - 60 * scale;
  const handRX = x + 60 * scale;
  const handY = y - 150 * scale;

  const overhead = phase < 0.5;
  const strength = overhead
    ? Math.sin(phase * Math.PI * 2) // 0..1 over first half
    : Math.sin((phase - 0.5) * Math.PI * 2);
  const peakY = overhead
    ? handY - 180 * scale * Math.abs(strength) - 20
    : y + 20 + 140 * scale * Math.abs(strength);
  const ctrlY = (handY + peakY) / 2;

  return (
    <svg
      width={300 * scale}
      height={500 * scale}
      viewBox={`0 0 ${300 * scale} ${500 * scale}`}
      style={{
        position: "absolute",
        left: x - 150 * scale,
        top: y - 450 * scale,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <path
        d={`M ${handLX - (x - 150 * scale)} ${handY - (y - 450 * scale)} Q ${
          150 * scale
        } ${ctrlY - (y - 450 * scale)} ${handRX - (x - 150 * scale)} ${
          handY - (y - 450 * scale)
        }`}
        stroke="#e8e3d9"
        strokeWidth={3.5 * scale}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

// --- Character running. Legs & arms swing. Position stays constant (city scrolls behind).
export const RunningCharacter: React.FC<BaseProps & { cyclesPerSec?: number }> = ({
  x,
  y,
  scale = 1,
  color = COLORS.character,
  eyebrows = { tilt: 12, drop: 0 },
  mouth = "flat",
  cyclesPerSec = 1.6,
  item = "jumprope",
}) => {
  const frame = useCurrentFrame();
  const t = (frame / 30) * cyclesPerSec * Math.PI * 2;
  const swing = Math.sin(t);
  const bob = Math.abs(Math.sin(t)) * -12; // slight up-bob

  return (
    <PoseCharacter
      x={x}
      y={y + bob}
      scale={scale}
      color={color}
      eyebrows={eyebrows}
      mouth={mouth}
      armAngle={swing * 40}
      handsOut={60}
      legSpread={swing * 55}
      knees={0}
      bodyTilt={6}
      item={item}
    />
  );
};

// --- Character doing pushups. Goes down and up on a cycle.
export const PushupCharacter: React.FC<BaseProps & { cyclesPerSec?: number }> = ({
  x,
  y,
  scale = 1,
  color = COLORS.character,
  eyebrows = { tilt: 10, drop: 0 },
  mouth = "flat",
  cyclesPerSec = 0.8,
}) => {
  const frame = useCurrentFrame();
  const t = (frame / 30) * cyclesPerSec * Math.PI * 2;
  const depth = (Math.sin(t) + 1) / 2; // 0..1

  return (
    <PushupPose
      x={x}
      y={y}
      scale={scale}
      color={color}
      eyebrows={eyebrows}
      mouth={mouth}
      depth={depth}
    />
  );
};

// --- A low-level posable character. Angles are in degrees.
type PoseProps = {
  x: number;
  y: number;
  scale?: number;
  color?: string;
  eyebrows?: { tilt: number; drop?: number };
  mouth?: "flat" | "down" | "open" | "small-up";
  armAngle: number; // positive = left arm forward, right arm back
  handsOut: number; // how far hands reach forward/back
  legSpread: number; // positive = left leg forward, right leg back
  knees: number;
  bodyTilt: number; // degrees of lean
  item?: "jumprope" | "none";
};

const PoseCharacter: React.FC<PoseProps> = ({
  x,
  y,
  scale = 1,
  color = COLORS.character,
  eyebrows = { tilt: 0, drop: 0 },
  mouth = "flat",
  armAngle,
  handsOut,
  legSpread,
  bodyTilt,
  item = "none",
}) => {
  const W = 400;
  const H = 520;
  const left = x - (W * scale) / 2;
  const top = y - H * scale;

  const headR = 70;
  const headCX = W / 2;
  const headCY = 100;
  const bodyTopY = headCY + headR - 6;
  const bodyBottomY = 320;
  const shoulderY = bodyTopY + 18;
  const hipY = bodyBottomY;
  const feetY = H - 10;

  // Arm positions from angle
  const armLen = 110;
  const leftArmX = headCX - 8 - Math.sin((armAngle * Math.PI) / 180) * handsOut;
  const leftArmY = shoulderY + armLen - Math.cos((armAngle * Math.PI) / 180) * 20;
  const rightArmX = headCX + 8 + Math.sin((armAngle * Math.PI) / 180) * handsOut;
  const rightArmY = shoulderY + armLen - Math.cos((armAngle * Math.PI) / 180) * 20;

  // Leg positions from spread
  const leftLegX = headCX - 20 - legSpread * 0.6;
  const rightLegX = headCX + 20 + legSpread * 0.6;

  return (
    <svg
      width={W * scale}
      height={H * scale}
      viewBox={`0 0 ${W} ${H}`}
      style={{
        position: "absolute",
        left,
        top,
        overflow: "visible",
        transform: `rotate(${bodyTilt}deg)`,
        transformOrigin: "center bottom",
      }}
    >
      <g stroke={color} strokeWidth={14} strokeLinecap="round" fill="none">
        <path d={`M ${headCX - 6} ${shoulderY} Q ${leftArmX - 10} ${shoulderY + 50} ${leftArmX} ${leftArmY}`} />
        <path d={`M ${headCX + 6} ${shoulderY} Q ${rightArmX + 10} ${shoulderY + 50} ${rightArmX} ${rightArmY}`} />
        <line x1={headCX} y1={bodyTopY} x2={headCX} y2={bodyBottomY} />
        <path d={`M ${headCX - 2} ${hipY} Q ${leftLegX - 6} ${(hipY + feetY) / 2} ${leftLegX} ${feetY}`} />
        <path d={`M ${headCX + 2} ${hipY} Q ${rightLegX + 6} ${(hipY + feetY) / 2} ${rightLegX} ${feetY}`} />
      </g>

      <circle cx={headCX} cy={headCY} r={headR} fill={color} />

      <g>
        <circle cx={headCX - 18} cy={headCY - 6} r={5} fill={COLORS.background} />
        <circle cx={headCX + 18} cy={headCY - 6} r={5} fill={COLORS.background} />

        {/* Eyebrows */}
        <line
          x1={headCX - 18 - 10}
          y1={headCY - 22 - (eyebrows.drop ?? 0) + Math.sin((eyebrows.tilt * Math.PI) / 180) * 10}
          x2={headCX - 18 + 10}
          y2={headCY - 22 - (eyebrows.drop ?? 0) - Math.sin((eyebrows.tilt * Math.PI) / 180) * 10}
          stroke={COLORS.background}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <line
          x1={headCX + 18 - 10}
          y1={headCY - 22 - (eyebrows.drop ?? 0) - Math.sin((eyebrows.tilt * Math.PI) / 180) * 10}
          x2={headCX + 18 + 10}
          y2={headCY - 22 - (eyebrows.drop ?? 0) + Math.sin((eyebrows.tilt * Math.PI) / 180) * 10}
          stroke={COLORS.background}
          strokeWidth={5}
          strokeLinecap="round"
        />

        {/* Mouth */}
        {mouth === "flat" && (
          <line
            x1={headCX - 14}
            y1={headCY + 24}
            x2={headCX + 14}
            y2={headCY + 24}
            stroke={COLORS.background}
            strokeWidth={5}
            strokeLinecap="round"
          />
        )}
        {mouth === "down" && (
          <path
            d={`M ${headCX - 14} ${headCY + 22} Q ${headCX} ${headCY + 34} ${headCX + 14} ${headCY + 22}`}
            stroke={COLORS.background}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {mouth === "small-up" && (
          <path
            d={`M ${headCX - 12} ${headCY + 26} Q ${headCX} ${headCY + 18} ${headCX + 12} ${headCY + 26}`}
            stroke={COLORS.background}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {mouth === "open" && (
          <ellipse
            cx={headCX}
            cy={headCY + 26}
            rx={8}
            ry={7}
            stroke={COLORS.background}
            strokeWidth={5}
            fill={COLORS.background}
          />
        )}
      </g>

      {/* Jump rope coil on right hand (item that persists from Day 1) */}
      {item === "jumprope" && (
        <g stroke="#e8e3d9" strokeWidth={3.5} fill="none" strokeLinecap="round">
          <ellipse cx={rightArmX + 2} cy={rightArmY + 6} rx={18} ry={8} />
          <ellipse cx={rightArmX + 2} cy={rightArmY + 14} rx={18} ry={8} />
        </g>
      )}
    </svg>
  );
};

// --- Pushup pose: body tilted forward, arms extended to the floor.
const PushupPose: React.FC<{
  x: number;
  y: number;
  scale: number;
  color: string;
  eyebrows: { tilt: number; drop?: number };
  mouth: "flat" | "down" | "open" | "small-up";
  depth: number; // 0 top, 1 bottom
}> = ({ x, y, scale, color, eyebrows, mouth, depth }) => {
  const W = 500;
  const H = 240;
  const left = x - (W * scale) / 2;
  const top = y - H * scale;

  const bodyY = 80 + depth * 70; // body sits closer to the floor as depth increases
  const headCX = 110;
  const headCY = bodyY - 20;
  const hipX = 320;
  const feetX = 460;
  const feetY = H - 10;
  const handX = 50;
  const handY = H - 10;

  return (
    <svg
      width={W * scale}
      height={H * scale}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", left, top, overflow: "visible" }}
    >
      <g stroke={color} strokeWidth={14} strokeLinecap="round" fill="none">
        {/* Body line */}
        <line x1={headCX + 50} y1={bodyY} x2={feetX} y2={feetY - 60} />
        {/* Arms (straight down) */}
        <path d={`M ${headCX + 30} ${bodyY} Q ${handX + 10} ${bodyY + 20} ${handX} ${handY}`} />
        {/* Legs (one visible, straight from hip) */}
        <path d={`M ${hipX} ${bodyY + 20} Q ${hipX + 70} ${(bodyY + feetY) / 2} ${feetX} ${feetY}`} />
      </g>

      {/* Head */}
      <circle cx={headCX} cy={headCY} r={55} fill={color} />
      <circle cx={headCX - 14} cy={headCY - 2} r={4} fill={COLORS.background} />
      <circle cx={headCX + 14} cy={headCY - 2} r={4} fill={COLORS.background} />
      {/* Eyebrows - determined */}
      <line
        x1={headCX - 24}
        y1={headCY - 16 + 3}
        x2={headCX - 8}
        y2={headCY - 18 - (eyebrows.drop ?? 0)}
        stroke={COLORS.background}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <line
        x1={headCX + 8}
        y1={headCY - 18 - (eyebrows.drop ?? 0)}
        x2={headCX + 24}
        y2={headCY - 16 + 3}
        stroke={COLORS.background}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Mouth */}
      {mouth === "flat" && (
        <line
          x1={headCX - 12}
          y1={headCY + 22}
          x2={headCX + 12}
          y2={headCY + 22}
          stroke={COLORS.background}
          strokeWidth={5}
          strokeLinecap="round"
        />
      )}
      {mouth === "open" && (
        <ellipse
          cx={headCX}
          cy={headCY + 22}
          rx={6}
          ry={5}
          stroke={COLORS.background}
          strokeWidth={5}
          fill={COLORS.background}
        />
      )}
    </svg>
  );
};

// Linearly-interpolate unused utility kept for later shots
export const linearFade = (frame: number, inF: number, outF: number, fade = 15) =>
  interpolate(
    frame,
    [inF, inF + fade, outF - fade, outF],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
