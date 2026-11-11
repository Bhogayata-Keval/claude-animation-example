import type { NarrationId } from "./voiceover";

export const FPS = 30;

// Clip lengths in frames. Used when audio hasn't been measured yet.
export const FALLBACK_AUDIO: Record<NarrationId, number> = {
  intro: 132,
  setup: 153,
  sdk: 216,
  agent: 198,
  insights: 321,
  outro: 108,
};

export type Timing = ReturnType<typeof computeTiming>;

// Derives every scene length and beat from the voiceover clip lengths, so
// re-recording a line never desyncs the visuals.
export const computeTiming = (a: Record<NarrationId, number>) => {
  const intro = { from: 0, dur: Math.max(90, 10 + a.intro + 12) };

  const spanEvery = Math.min(12, Math.max(6, Math.round((a.sdk - 30) / 16)));
  const p1 = Math.max(120, 6 + a.setup + 8);
  const p2 = p1 + Math.max(a.sdk + 8, 12 + 3 * spanEvery + 18 + 6);
  const pipeline = {
    from: intro.from + intro.dur,
    dur: Math.max(p2 + a.agent + 15, p2 + 142),
    beats: { p1, p2, spanEvery },
  };

  const insights = {
    from: pipeline.from + pipeline.dur,
    dur: Math.max(210, 8 + a.insights + 20),
    beats: {
      chartStart: 8 + Math.round(a.insights * 0.3),
      highlightAt: 8 + Math.round(a.insights * 0.66),
    },
  };

  const outro = {
    from: insights.from + insights.dur,
    dur: Math.max(90, 8 + a.outro + 30),
  };

  return {
    intro,
    pipeline,
    insights,
    outro,
    total: outro.from + outro.dur,
    // Absolute start frame of each voiceover clip.
    voice: {
      intro: intro.from + 10,
      setup: pipeline.from + 6,
      sdk: pipeline.from + p1,
      agent: pipeline.from + p2,
      insights: insights.from + 8,
      outro: outro.from + 8,
    } satisfies Record<NarrationId, number>,
  };
};
