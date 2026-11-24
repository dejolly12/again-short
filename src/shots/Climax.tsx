import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FILM, LAYOUT } from "../theme";
import { Letterbox, Flash, SpeedLines } from "../scene";
import {
  ClayBackdrop,
  ClayFloor,
  ClayLamp,
  ClayPushup,
  MindBubbles,
  GROWING_WORDS,
} from "../clay";
import "../font";

// Climax: straight into pushups picking up from the end of the run. The
// "maybe / i think..." words from the montage explode one by one and are
// replaced with full confidence words. 140f / ~4.7s.
export const Climax: React.FC = () => {
  const frame = useCurrentFrame();
  const charX = FILM.width * 0.5;
  const lampX = FILM.width * 0.75;
  const charY = LAYOUT.floorY;

  // Growing-confidence words are on screen at the start, then explode and
  // get replaced by full confidence words as he reps it out.
  const transition = interpolate(frame, [10, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hitFrame = 80;

  return (
    <AbsoluteFill>
      <ClayBackdrop />

      <AbsoluteFill>
        <ClayLamp x={lampX} />
        <ClayFloor />

        <ClayPushup x={charX} y={charY} eyebrows={{ tilt: 20 }} mouth="open" cyclesPerSec={0.9} />
        <MindBubbles
          x={charX}
          y={charY}
          mode="transition"
          transitionProgress={transition}
          doubtWords={GROWING_WORDS}
        />
      </AbsoluteFill>

      <SpeedLines inFrame={hitFrame} duration={30} />
      <Flash inFrame={hitFrame} duration={18} />

      <Letterbox />
    </AbsoluteFill>
  );
};
