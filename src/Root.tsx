import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { getAudioDuration } from "./get-audio-duration";
import { computeTiming, FPS } from "./timing";
import { TracesVideo, type TracesVideoProps } from "./TracesVideo";
import { NARRATION, voiceoverFile, type NarrationId } from "./voiceover";

const calculateMetadata: CalculateMetadataFunction<TracesVideoProps> = async ({
  props,
}) => {
  const seconds = await Promise.all(
    NARRATION.map((n) => getAudioDuration(staticFile(voiceoverFile(n.id)))),
  );
  const frames = Object.fromEntries(
    NARRATION.map((n, i) => [n.id, Math.ceil(seconds[i] * FPS)]),
  ) as Record<NarrationId, number>;
  const timing = computeTiming(frames);
  return { durationInFrames: timing.total, props: { ...props, timing } };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MiddlewareTraces"
      component={TracesVideo}
      durationInFrames={690}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ timing: null }}
      calculateMetadata={calculateMetadata}
    />
  );
};
