import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FILM, LAYOUT } from "../theme";
import { Letterbox } from "../scene";
import {
  ClayBackdrop,
  ClayFloor,
  ClayLamp,
  ClayJumping,
  MindBubbles,
} from "../clay";
import "../font";

// Shot 1: opens straight on him skipping rope → three reps.
// Doubt bubbles crowd in as he jumps. 200f / ~6.7s.
export const Day1Training: React.FC = () => {
  const frame = useCurrentFrame();

  const charX = FILM.width * 0.5;
  const lampX = FILM.width * 0.75;
  const charY = LAYOUT.floorY;

  // Doubt bubbles fade in as he jumps. Shorter 3.3s shot — all six bubbles
  // need to be visible by the end.
  const doubtIntensity = interpolate(frame, [0, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <ClayBackdrop />
      <ClayLamp x={lampX} />
      <ClayFloor />

      <ClayJumping
        x={charX}
        y={charY}
        eyebrows={{ tilt: 14 }}
        mouth="open"
        cyclesPerSec={1.4}
        bodyFat={1.35}
      />

      <MindBubbles x={charX} y={charY} mode="doubt" intensity={doubtIntensity} />

      <Letterbox />
    </AbsoluteFill>
  );
};
