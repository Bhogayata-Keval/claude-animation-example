// Narration script. One clip per beat; scene timing stretches to fit each clip
// (see calculateMetadata in Root.tsx). Re-run `npm run voiceover` after editing.
export const VOICE_ID = "XrExE9yKIg1WjnnlVkGX"; // ElevenLabs "Matilda"

export const NARRATION = [
  {
    id: "intro",
    text: "Let's follow a single trace, from a container, all the way to an insight.",
  },
  {
    id: "setup",
    text: "Here's a Node.js app, running in a Docker container on an EC2 instance.",
  },
  {
    id: "sdk",
    text: "The Middleware APM package, built on OpenTelemetry, sends every span to the Middleware Agent on the host.",
  },
  {
    id: "agent",
    text: "The agent is an OpenTelemetry Collector. It batches the spans, and ships them securely to Middleware.",
  },
  {
    id: "insights",
    text: "Middleware stitches those spans into a full trace, catches the latency spike after your deploy, and points straight to the root cause: a slow database query.",
  },
  {
    id: "outro",
    text: "Middleware. From container to insight, in minutes.",
  },
] as const;

export type NarrationId = (typeof NARRATION)[number]["id"];
export const voiceoverFile = (id: NarrationId) => `voiceover/${id}.mp3`;
