import { Composition } from "remotion";
import { FILM } from "./theme";
import { ClayDefs } from "./clay";
import { OpeningShot } from "./shots/OpeningShot";
import { Day1Training } from "./shots/Day1Training";
import { RunningMontage } from "./shots/RunningMontage";
import { MidFilm } from "./shots/MidFilm";
import { Setback } from "./shots/Setback";
import { Climax } from "./shots/Climax";
import { Resolution } from "./shots/Resolution";
import { TitleCard } from "./shots/TitleCard";
import { Again } from "./shots/Again";

// Wrap the composition's root component so ClayDefs renders exactly once at the top.
// This avoids duplicated SVG gradient IDs across shots when Series mounts them together.
const withClayDefs = (Comp: React.ComponentType) => {
  const Wrapped: React.FC = () => (
    <>
      <ClayDefs />
      <Comp />
    </>
  );
  return Wrapped;
};

const commonProps = {
  fps: FILM.fps,
  width: FILM.width,
  height: FILM.height,
} as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Again" component={withClayDefs(Again)} durationInFrames={765} {...commonProps} />
      <Composition id="OpeningShot" component={withClayDefs(OpeningShot)} durationInFrames={300} {...commonProps} />
      <Composition id="Day1Training" component={withClayDefs(Day1Training)} durationInFrames={125} {...commonProps} />
      <Composition id="RunningMontage" component={withClayDefs(RunningMontage)} durationInFrames={300} {...commonProps} />
      <Composition id="MidFilm" component={withClayDefs(MidFilm)} durationInFrames={300} {...commonProps} />
      <Composition id="Setback" component={withClayDefs(Setback)} durationInFrames={450} {...commonProps} />
      <Composition id="Climax" component={withClayDefs(Climax)} durationInFrames={140} {...commonProps} />
      <Composition id="Resolution" component={withClayDefs(Resolution)} durationInFrames={300} {...commonProps} />
      <Composition id="TitleCard" component={withClayDefs(TitleCard)} durationInFrames={200} {...commonProps} />
    </>
  );
};
