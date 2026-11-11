// Usage: node --strip-types scripts/generate-voiceover.ts   (needs ELEVENLABS_API_KEY)
import { mkdirSync, writeFileSync } from "node:fs";
import { NARRATION, VOICE_ID, voiceoverFile } from "../src/voiceover.ts";

const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
mkdirSync("public/voiceover", { recursive: true });

for (let i = 0; i < NARRATION.length; i++) {
  const line = NARRATION[i];
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: line.text,
        model_id: "eleven_multilingual_v2",
        // Stitch prosody across clips so the beats sound like one read.
        previous_text: NARRATION[i - 1]?.text,
        next_text: NARRATION[i + 1]?.text,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.25 },
      }),
    },
  );
  if (!res.ok) throw new Error(`${line.id}: ${res.status} ${await res.text()}`);
  writeFileSync(`public/${voiceoverFile(line.id)}`, Buffer.from(await res.arrayBuffer()));
  console.log(`✓ ${line.id}`);
}
