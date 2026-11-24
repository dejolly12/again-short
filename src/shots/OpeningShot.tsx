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

// Shot 1: character sits, doubt bubbles rise around his head.
export const OpeningShot: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });

  const doubtIntensity = interpolate(frame, [120, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brow = interpolate(frame, [150, 230], [0, 6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const charX = FILM.width * 0.42;
  const lampX = FILM.width * 0.62;
  const charY = LAYOUT.floorY;

  return (
    <AbsoluteFill>
      <ClayBackdrop />
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <ClayLamp x={lampX} />
        <ClayFloor />
        <ClayCharacter
          x={charX}
          y={charY}
          pose="sit"
          eyebrows={{ tilt: -15, drop: brow }}
          mouth="flat"
          eyesClosed={frame < 90}
          item="jumprope"
        />
        <MindBubbles x={charX} y={charY} mode="doubt" intensity={doubtIntensity} />
      </AbsoluteFill>

      <DayCounter day={1} fadeInFrame={240} />
      <NarratorLine text="Day one." inFrame={30} outFrame={110} />
      <NarratorLine text="The doubt shows up first." inFrame={200} outFrame={290} />
      <Letterbox />
    </AbsoluteFill>
  );
};
