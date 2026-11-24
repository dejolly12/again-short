import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FILM, FONT_FAMILY } from "./theme";

// --- Comic book "page" wrapper. Black gutter background.
export const ComicPage: React.FC<{ children?: React.ReactNode; gutter?: string }> = ({
  children,
  gutter = "#000000",
}) => (
  <AbsoluteFill style={{ background: gutter }}>
    {children}
  </AbsoluteFill>
);

// --- A single comic panel.
//
// The panel clips its children to its (x, y, w, h) rectangle in the full 1920x1080 frame.
// Children render in a virtual 1920x1080 canvas that is scaled to fit the panel's height
// (or by an explicit `scale`), and optionally panned to focus on (focusX, focusY).
export const Panel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  inFrame?: number;
  outFrame?: number;
  border?: number;
  bg?: string;
  rotate?: number;
  scale?: number;
  focusX?: number;
  focusY?: number;
  children?: React.ReactNode;
}> = ({
  x,
  y,
  w,
  h,
  inFrame = 0,
  outFrame,
  border = 10,
  bg = COLORS.background,
  rotate = 0,
  scale,
  focusX = FILM.width / 2,
  focusY = FILM.height * 0.55,
  children,
}) => {
  const frame = useCurrentFrame();
  const local = frame - inFrame;
  if (local < 0) return null;
  if (outFrame !== undefined && frame > outFrame) return null;

  const popScale = interpolate(local, [0, 8, 14], [0.5, 1.08, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut =
    outFrame !== undefined
      ? interpolate(frame, [outFrame - 8, outFrame], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const op =
    interpolate(local, [0, 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * fadeOut;

  const s = scale ?? Math.max(w / FILM.width, h / FILM.height);
  const tx = w / 2 - focusX * s;
  const ty = h / 2 - focusY * s;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: bg,
        border: `${border}px solid #000000`,
        boxShadow: `8px 8px 0 #000000`,
        overflow: "hidden",
        transform: `rotate(${rotate}deg) scale(${popScale})`,
        transformOrigin: "center center",
        opacity: op,
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: FILM.width,
          height: FILM.height,
          left: 0,
          top: 0,
          transform: `translate(${tx}px, ${ty}px) scale(${s})`,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// --- Caption box: cream card, black border, black uppercase text. Narrator.
export const CaptionBox: React.FC<{
  text: string;
  x: number;
  y: number;
  inFrame: number;
  outFrame: number;
  bg?: string;
  size?: number;
}> = ({ text, x, y, inFrame, outFrame, bg = "#f5e9c6", size = 32 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(
    frame,
    [inFrame, inFrame + 8, outFrame - 8, outFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  if (op <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        background: bg,
        border: "4px solid #000000",
        padding: "10px 20px",
        color: "#000000",
        fontFamily: FONT_FAMILY,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 1.5,
        boxShadow: "5px 5px 0 #000000",
        opacity: op,
        zIndex: 70,
        maxWidth: 560,
        lineHeight: 1.15,
      }}
    >
      {text.toUpperCase()}
    </div>
  );
};

// --- Speech bubble. White oval with pointy tail. Text can be coloured (accent for the shadow).
export const SpeechBubble: React.FC<{
  text: string;
  x: number;
  y: number;
  inFrame: number;
  outFrame: number;
  tail?: "down-left" | "down-right" | "up-left" | "up-right";
  color?: string;
  size?: number;
}> = ({ text, x, y, inFrame, outFrame, tail = "down-left", color = "#000000", size = 36 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [inFrame, inFrame + 6], [0, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settle = interpolate(frame, [inFrame + 6, inFrame + 12], [1.08, 1], {
    extrapolateRight: "clamp",
  });
  const finalScale = frame < inFrame + 6 ? scale : settle;
  const op = interpolate(
    frame,
    [inFrame, inFrame + 6, outFrame - 8, outFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  if (op <= 0) return null;

  const w = Math.max(200, text.length * size * 0.42 + 70);
  const h = Math.max(100, size * 2);

  const tailCoords = (() => {
    switch (tail) {
      case "down-left":
        return { from1: [w / 2 - 50, h - 10], from2: [w / 2 - 20, h - 10], to: [w / 2 - 80, h + 55] };
      case "down-right":
        return { from1: [w / 2 + 20, h - 10], from2: [w / 2 + 50, h - 10], to: [w / 2 + 80, h + 55] };
      case "up-left":
        return { from1: [w / 2 - 50, 10], from2: [w / 2 - 20, 10], to: [w / 2 - 80, -55] };
      case "up-right":
        return { from1: [w / 2 + 20, 10], from2: [w / 2 + 50, 10], to: [w / 2 + 80, -55] };
    }
  })();

  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        transform: `scale(${finalScale})`,
        transformOrigin: "center center",
        opacity: op,
        zIndex: 75,
      }}
    >
      <svg
        width={w}
        height={h + 80}
        viewBox={`0 -80 ${w} ${h + 160}`}
        style={{ position: "absolute", left: 0, top: -80, overflow: "visible" }}
      >
        <g fill="#ffffff" stroke="#000000" strokeWidth={7} strokeLinejoin="round">
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 10} ry={h / 2 - 10} />
          <polygon
            points={`${tailCoords.from1.join(",")} ${tailCoords.to.join(",")} ${tailCoords.from2.join(",")}`}
          />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          fontFamily: FONT_FAMILY,
          fontSize: size,
          fontWeight: 700,
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// --- Sound effect: yellow starburst with bold uppercase text.
export const SoundEffect: React.FC<{
  text: string;
  x: number;
  y: number;
  inFrame: number;
  duration?: number;
  color?: string;
  textColor?: string;
  rotate?: number;
  size?: number;
}> = ({
  text,
  x,
  y,
  inFrame,
  duration = 30,
  color = "#ffd60a",
  textColor = "#000000",
  rotate = -8,
  size = 110,
}) => {
  const frame = useCurrentFrame();
  const local = frame - inFrame;
  if (local < 0 || local > duration) return null;
  const pop = interpolate(local, [0, 5, 12], [0.1, 1.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const op = interpolate(local, [0, 3, duration - 8, duration], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  const burstR = Math.max(140, text.length * size * 0.32 + 70);
  const spikes = 14;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? burstR : burstR * 0.72;
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    points.push(`${Math.cos(angle) * r},${Math.sin(angle) * r}`);
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${pop})`,
        opacity: op,
        zIndex: 85,
      }}
    >
      <svg
        width={burstR * 2.6}
        height={burstR * 2.6}
        viewBox={`${-burstR * 1.3} ${-burstR * 1.3} ${burstR * 2.6} ${burstR * 2.6}`}
      >
        <polygon
          points={points.join(" ")}
          fill={color}
          stroke="#000000"
          strokeWidth={7}
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textColor,
          fontFamily: FONT_FAMILY,
          fontSize: size,
          fontWeight: 900,
          letterSpacing: 3,
          textTransform: "uppercase",
          textShadow: `0 0 2px ${textColor}`,
          WebkitTextStroke: `2px ${textColor}`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// --- Ben-Day dots overlay. Subtle comic texture.
export const Halftone: React.FC<{ opacity?: number; size?: number; color?: string }> = ({
  opacity = 0.1,
  size = 14,
  color = "#ffffff",
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `radial-gradient(circle, ${color} 1.4px, transparent 1.6px)`,
      backgroundSize: `${size}px ${size}px`,
      opacity,
      pointerEvents: "none",
      zIndex: 20,
    }}
  />
);

// --- Comic title: letters burst on, one at a time, with slight shake.
export const ComicTitle: React.FC<{
  text: string;
  x?: number;
  y: number;
  perLetterFrames?: number;
  startFrame?: number;
  size?: number;
  color?: string;
  burst?: boolean;
}> = ({
  text,
  x = FILM.width / 2,
  y,
  perLetterFrames = 12,
  startFrame = 0,
  size = 260,
  color = "#ffffff",
  burst = true,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        right: 0,
        textAlign: "center",
        fontFamily: FONT_FAMILY,
        fontSize: size,
        fontWeight: 900,
        color,
        letterSpacing: 10,
        lineHeight: 1,
        textShadow: burst ? "6px 6px 0 #000000, -3px -3px 0 #000000" : undefined,
        WebkitTextStroke: burst ? "4px #000000" : undefined,
      }}
    >
      {text.split("").map((ch, i) => {
        const localIn = startFrame + i * perLetterFrames;
        const local = frame - localIn;
        const scale = interpolate(local, [0, 5, 10], [0.2, 1.4, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rot = interpolate(local, [0, 5, 10], [-20, 8, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const op = interpolate(local, [0, 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `scale(${scale}) rotate(${rot}deg)`,
              opacity: op,
              transformOrigin: "center bottom",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};
