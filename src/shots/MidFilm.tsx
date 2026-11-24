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

// Shot 4: calm. Standing tall. Doubt bubbles start exploding into
// confidence words as he stops asking why.
export const MidFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const charX = FILM.width * 0.42;
  const lampX = FILM.width * 0.62;
  const charY = LAYOUT.floorY;

  const transition = interpolate(frame, [30, 260], [0.2, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <ClayBackdrop />
      <ClayLamp x={lampX} />
      <ClayFloor />
      <ClayCharacter
        x={charX}
        y={charY}
        pose="stand"
        eyebrows={{ tilt: 5 }}
        mouth="flat"
        item="jumprope"
      />
      <MindBubbles x={charX} y={charY} mode="transition" transitionProgress={transition} />

      <DayCounter day={42} fadeInFrame={0} />
      <NarratorLine text="Day forty two." inFrame={30} outFrame={120} />
      <NarratorLine text="He stopped asking why." inFrame={150} outFrame={280} />
      <Letterbox />
    </AbsoluteFill>
  );
};
