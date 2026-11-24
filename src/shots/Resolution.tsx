import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FILM, LAYOUT } from "../theme";
import { Letterbox, DayCounter, NarratorLine } from "../scene";
import {
  ClayBackdrop,
  ClayFloor,
  ClayLamp,
  ClayCharacter,
  MindBubbles,
} from "../clay";
import "../font";

// Shot 7: standing tall, confidence words floating around him. "Again tomorrow."
export const Resolution: React.FC = () => {
  const frame = useCurrentFrame();
  const charX = FILM.width * 0.42;
  const lampX = FILM.width * 0.62;
  const charY = LAYOUT.floorY;

  const fadeOut = interpolate(frame, [240, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <ClayBackdrop />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <ClayLamp x={lampX} />
        <ClayFloor />
        <ClayCharacter
          x={charX}
          y={charY}
          pose="stand"
          eyebrows={{ tilt: 8 }}
          mouth="small-up"
          item="jumprope"
        />
        <MindBubbles x={charX} y={charY} mode="confidence" intensity={1} />
      </AbsoluteFill>
      <DayCounter day={91} fadeInFrame={0} />
      <NarratorLine text="Again tomorrow." inFrame={40} outFrame={220} />
      <Letterbox />
    </AbsoluteFill>
  );
};
