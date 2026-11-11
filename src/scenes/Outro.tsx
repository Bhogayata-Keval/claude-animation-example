import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, clamp, ease, mono, sans } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 50,
        fontFamily: sans,
      }}
    >
      <Img
        src={staticFile("mascot.png")}
        style={{
          width: 460,
          mixBlendMode: "multiply", maskImage: "radial-gradient(closest-side, black 82%, transparent 100%)",
          opacity: interpolate(frame, [0, 12], [0, 1], clamp),
          scale: interpolate(frame, [0, 24], [0.8, 1], { ...clamp, easing: ease }),
        }}
      />
      <div
        style={{
          opacity: interpolate(frame, [8, 22], [0, 1], clamp),
          translate: interpolate(frame, [8, 30], ["40px 0px", "0px 0px"], {
            ...clamp,
            easing: ease,
          }),
        }}
      >
        <div style={{ fontSize: 128, fontWeight: 800, color: C.purple, letterSpacing: -3 }}>
          middleware.io
        </div>
        <div style={{ fontSize: 44, color: C.ink, marginTop: 8 }}>
          From container to insight — in minutes.
        </div>
        <div style={{ fontFamily: mono, fontSize: 26, color: C.muted, marginTop: 24 }}>
          Built on OpenTelemetry · No vendor lock-in
        </div>
      </div>
    </AbsoluteFill>
  );
};
