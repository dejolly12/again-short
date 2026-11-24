import { Series } from "remotion";
import { Day1Training } from "./Day1Training";
import { RunningMontage } from "./RunningMontage";
import { Climax } from "./Climax";
import { TitleCard } from "./TitleCard";

// The full film: 4 shots back-to-back.
// Lengths in frames (30fps): day1 125, montage 300, climax 140, title 200.
// Total 765f = 25.5s.
export const Again: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={125}>
      <Day1Training />
    </Series.Sequence>
    <Series.Sequence durationInFrames={300}>
      <RunningMontage />
    </Series.Sequence>
    <Series.Sequence durationInFrames={140}>
      <Climax />
    </Series.Sequence>
    <Series.Sequence durationInFrames={200}>
      <TitleCard />
    </Series.Sequence>
  </Series>
);
