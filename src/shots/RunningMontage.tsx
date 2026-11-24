import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FILM, LAYOUT } from "../theme";
import { Letterbox } from "../scene";
import {
  ClayBackdrop,
  ClayFloor,
  ClayRunning,
  ClayGlow,
  ClayCityScroll,
  MindBubbles,
  GROWING_WORDS,
} from "../clay";
import "../font";

// Shot 2: continuous running through night city. 240f / 8s.
export const RunningMontage: React.FC = () => {
  const frame = useCurrentFrame();

  const charX = FILM.width * 0.5;
  const charY = LAYOUT.floorY;

  // Each doubt bubble explodes and is replaced by a growing-confidence word.
  // Same per-bubble pace as the Climax (120 frames / 4s).
  const transition = interpolate(frame, [15, 135], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pot belly shrinks from Day-1 size down to almost flat over the full run.
  const bellyScale = interpolate(frame, [0, 290], [1, 0.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const streetlampX = (frame * 14) % FILM.width;

  return (
    <AbsoluteFill>
      <ClayBackdrop />
      <ClayGlow x={FILM.width * 0.9} y={200} radius={360} color="#c0d4ff" intensity={0.25} />
      <ClayCityScroll speed={16} />
      <ClayFloor />
      <ClayGlow x={streetlampX} y={LAYOUT.floorY - 20} radius={260} color="#ffb066" intensity={0.5} />

      <ClayRunning
        x={charX}
        y={charY}
        eyebrows={{ tilt: 16 }}
        mouth="open"
        cyclesPerSec={1.8}
        item="jumprope"
        bellyScale={bellyScale}
      />
      <MindBubbles
        x={charX}
        y={charY}
        mode="transition"
        transitionProgress={transition}
        confidenceWords={GROWING_WORDS}
      />

      <Letterbox />
    </AbsoluteFill>
  );
};
