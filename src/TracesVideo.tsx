import { Audio } from "@remotion/media";
import { Sequence, staticFile, Track } from "remotion";
import { Background } from "./Background";
import { Insights } from "./scenes/Insights";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Pipeline } from "./scenes/Pipeline";
import { computeTiming, FALLBACK_AUDIO, type Timing } from "./timing";
import { voiceoverFile } from "./voiceover";

export type TracesVideoProps = {
  readonly timing: Timing | null;
};

export const TracesVideo: React.FC<TracesVideoProps> = ({ timing }) => {
  const t = timing ?? computeTiming(FALLBACK_AUDIO);
  return (
    <>
      <Background />
      <Track name="Scenes">
        <Sequence name="Intro" from={t.intro.from} durationInFrames={t.intro.dur}>
          <Intro />
        </Sequence>
        <Sequence name="Pipeline" from={t.pipeline.from} durationInFrames={t.pipeline.dur}>
          <Pipeline beats={t.pipeline.beats} />
        </Sequence>
        <Sequence name="Insights" from={t.insights.from} durationInFrames={t.insights.dur}>
          <Insights beats={t.insights.beats} />
        </Sequence>
        <Sequence name="Outro" from={t.outro.from} durationInFrames={t.outro.dur}>
          <Outro />
        </Sequence>
      </Track>
      <Track name="Voiceover">
        <Audio name="VO intro" src={staticFile(voiceoverFile("intro"))} from={t.voice.intro} />
        <Audio name="VO setup" src={staticFile(voiceoverFile("setup"))} from={t.voice.setup} />
        <Audio name="VO sdk" src={staticFile(voiceoverFile("sdk"))} from={t.voice.sdk} />
        <Audio name="VO agent" src={staticFile(voiceoverFile("agent"))} from={t.voice.agent} />
        <Audio name="VO insights" src={staticFile(voiceoverFile("insights"))} from={t.voice.insights} />
        <Audio name="VO outro" src={staticFile(voiceoverFile("outro"))} from={t.voice.outro} />
      </Track>
    </>
  );
};
