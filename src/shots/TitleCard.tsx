import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FILM, FONT_FAMILY, LAYOUT } from "../theme";
import { Letterbox } from "../scene";
import { ClayBackdrop, ClayFlex, useClayWobble } from "../clay";
import "../font";

const TITLE = "AGAIN";
const PER_LETTER = 10;

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  // 1. "Show up." fades in at the top
  const showUpStart = 0;
  const showUpOp = interpolate(frame, [showUpStart, showUpStart + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The two blue lines and the AGAIN title all paint at the SAME time and
  // the SAME rate — synchronised left-to-right sweep over SWEEP frames.
  const SWEEP = TITLE.length * PER_LETTER; // 50 frames

  const paintStart = 20;
  const line1Prog = interpolate(frame, [paintStart, paintStart + SWEEP], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Prog = line1Prog;
  const typeStart = paintStart;

  // 5. "every day" fades in at the bottom
  const everyDayStart = paintStart + SWEEP + 5; // 75
  const everyDayOp = interpolate(frame, [everyDayStart, everyDayStart + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const letterSize = 220;
  const letterSpacing = 15;
  // Center the AGAIN block vertically on the frame.
  const titleY = FILM.height * 0.42;
  const approxCharWidth = letterSize * 0.66;
  const titleWidth = approxCharWidth * TITLE.length + letterSpacing * (TITLE.length - 1);
  const lineLeft = (FILM.width - titleWidth) / 2;

  // AGAIN's visible cap height sits roughly between titleY+22 and titleY+176.
  // The wavy SVG's path is drawn at local y=80, so the visible wave sits at
  // (svgTop + 80). Place one wave just above the caps and one just below.
  const line1Y = titleY - 90; // wave visible at titleY - 10
  const line2Y = titleY + 130; // wave visible at titleY + 210

  const line1Path = buildWavyPath(lineLeft, 80, titleWidth * line1Prog, 18, 90);
  const line2Path = buildWavyPath(lineLeft, 80, titleWidth * line2Prog, 18, 90);

  const showUpY = titleY - 200;
  const everyDayY = titleY + 290;

  // Guy JUMPS IN from below the frame after "every day" appears, lands in a
  // flex pose with a little back-ease overshoot.
  const jumpStart = 100;
  const landFrame = 128;
  const charFloorY = LAYOUT.floorY + 350; // near bottom of 1920 frame
  const flexY = interpolate(frame, [jumpStart, landFrame], [charFloorY + 650, charFloorY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.6)),
  });

  return (
    <AbsoluteFill>
      <ClayBackdrop />

      {/* 1. Show up. */}
      <div
        style={{
          position: "absolute",
          top: showUpY,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 72,
          fontWeight: 800,
          color: "#ffffff",
          opacity: showUpOp,
          zIndex: 90,
        }}
      >
        Show up.
      </div>

      {/* 2. Blue wavy line */}
      <svg
        width={FILM.width}
        height={160}
        style={{ position: "absolute", top: line1Y, left: 0, zIndex: 85 }}
      >
        <path
          d={line1Path}
          stroke={COLORS.accent}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 14px ${COLORS.accent}) drop-shadow(0 0 32px ${COLORS.accent}99)`,
          }}
        />
      </svg>

      {/* 3. AGAIN */}
      <div
        style={{
          position: "absolute",
          top: titleY,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: letterSize,
          fontWeight: 900,
          letterSpacing,
          lineHeight: 1,
          zIndex: 90,
        }}
      >
        {TITLE.split("").map((ch, i) => (
          <ClayLetter key={i} ch={ch} index={i} startFrame={typeStart} per={PER_LETTER} />
        ))}
      </div>

      {/* 4. Second blue wavy line */}
      <svg
        width={FILM.width}
        height={160}
        style={{ position: "absolute", top: line2Y, left: 0, zIndex: 85 }}
      >
        <path
          d={line2Path}
          stroke={COLORS.accent}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 14px ${COLORS.accent}) drop-shadow(0 0 32px ${COLORS.accent}99)`,
          }}
        />
      </svg>

      {/* 5. every day */}
      <div
        style={{
          position: "absolute",
          top: everyDayY,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontSize: 72,
          fontWeight: 800,
          color: "#ffffff",
          opacity: everyDayOp,
          zIndex: 90,
        }}
      >
        every day.
      </div>

      {/* Flex guy with sweatband jumps in from the bottom. */}
      <ClayFlex x={FILM.width / 2} y={flexY} scale={1.1} sweatband={COLORS.accent} />

      <Letterbox />
    </AbsoluteFill>
  );
};

// A single clay-styled title letter with pop-in, wobble, and gradient fill.
const ClayLetter: React.FC<{ ch: string; index: number; startFrame: number; per: number }> = ({
  ch,
  index,
  startFrame,
  per,
}) => {
  const frame = useCurrentFrame();
  const wob = useClayWobble(index * 2.7);
  const localIn = startFrame + index * per;
  const local = frame - localIn;
  const scale = interpolate(local, [0, 6, 12], [0.15, 1.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rot = interpolate(local, [0, 6, 12], [-14, 6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const op = interpolate(local, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span
      style={{
        display: "inline-block",
        transform: `translate(${wob.dx}px, ${wob.dy}px) scale(${scale}) rotate(${rot}deg)`,
        opacity: op,
        transformOrigin: "center bottom",
        color: "#ff8a3d",
        textShadow: "0 0 0 #000, 6px 6px 0 #4a1a08, -2px -2px 0 #ffd1a8",
        WebkitTextStroke: "3px #4a1a08",
      }}
    >
      {ch}
    </span>
  );
};

function buildWavyPath(x: number, y: number, len: number, amp: number, period: number): string {
  if (len <= 0) return `M ${x} ${y}`;
  const steps = Math.max(2, Math.floor(len / 8));
  let d = `M ${x} ${y}`;
  for (let i = 1; i <= steps; i++) {
    const px = x + (len * i) / steps;
    const py = y + Math.sin(((len * i) / period) * Math.PI * 2) * amp;
    d += ` L ${px} ${py}`;
  }
  return d;
}
