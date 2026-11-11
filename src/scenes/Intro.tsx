import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, clamp, ease, mono, sans } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        fontFamily: sans,
      }}
    >
      <Img
        src={staticFile("mascot.png")}
        style={{
          width: 520,
          mixBlendMode: "multiply", maskImage: "radial-gradient(closest-side, black 82%, transparent 100%)",
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [0, 0.9 * fps],
            ["-80px 40px", "0px 0px"],
            { ...clamp, easing: ease },
          ),
          scale: interpolate(frame, [0, 0.9 * fps], [0.85, 1], {
            ...clamp,
            easing: ease,
          }),
        }}
      />
      <div style={{ width: 1180 }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 30,
            color: C.purple,
            letterSpacing: 2,
            opacity: interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], clamp),
          }}
        >
          OPENTELEMETRY · DISTRIBUTED TRACING
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.02,
            color: C.ink,
            marginTop: 20,
            letterSpacing: -2,
            opacity: interpolate(frame, [0.4 * fps, 1 * fps], [0, 1], clamp),
            translate: interpolate(
              frame,
              [0.4 * fps, 1.2 * fps],
              ["0px 40px", "0px 0px"],
              { ...clamp, easing: ease },
            ),
          }}
        >
          Follow a trace
          <br />
          <span style={{ color: C.purple }}>from container to insight</span>
        </div>
        <div
          style={{
            fontSize: 40,
            color: C.muted,
            marginTop: 32,
            opacity: interpolate(frame, [0.9 * fps, 1.5 * fps], [0, 1], clamp),
          }}
        >
          Node.js on Docker → EC2 → Middleware
        </div>
      </div>
    </AbsoluteFill>
  );
};
