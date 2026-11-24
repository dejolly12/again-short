import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FILM, LAYOUT } from "../theme";
import {
  Letterbox,
  DayCounter,
  NarratorLine,
} from "../scene";
import {
  ClayBackdrop,
  ClayFloor,
  ClayLamp,
  ClayCharacter,
  ClayGlow,
  MindBubbles,
} from "../clay";
import "../font";

// Shot 5: doubt comes back louder; bubbles swarm the head.
export const Setback: React.FC = () => {
  const frame = useCurrentFrame();
  const charX = FILM.width * 0.42;
  const lampX = FILM.width * 0.62;
  const charY = LAYOUT.floorY;

  const doubtIntensity = interpolate(frame, [0, 180], [0.3, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <ClayBackdrop />
      <ClayGlow x={lampX} y={charY} radius={380} color="#ffb066" intensity={0.35} />
      <ClayLamp x={lampX} />
      <ClayFloor />

      <ClayCharacter
        x={charX}
        y={charY}
        pose="sit"
        eyebrows={{ tilt: -25, drop: 10 }}
        mouth="down"
        eyesClosed
        item="jumprope"
      />
      <MindBubbles x={charX} y={charY} mode="doubt" intensity={doubtIntensity} />

      <DayCounter day={60} fadeInFrame={0} />
      <NarratorLine text="The doubt came back louder." inFrame={380} outFrame={450} />
      <Letterbox />
    </AbsoluteFill>
  );
};
