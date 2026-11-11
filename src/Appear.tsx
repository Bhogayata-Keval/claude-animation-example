import { interpolate, useCurrentFrame } from "remotion";
import { clamp, ease } from "./theme";

// Fades + rises a block in, starting at `delay` frames (scene-relative).
export const Appear: React.FC<{
  readonly delay: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly rise?: number;
}> = ({ delay, children, style, rise = 30 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        ...style,
        opacity: interpolate(frame, [delay, delay + 14], [0, 1], clamp),
        translate: interpolate(
          frame,
          [delay, delay + 24],
          [`0px ${rise}px`, "0px 0px"],
          { ...clamp, easing: ease },
        ),
        scale: interpolate(frame, [delay, delay + 24], [0.96, 1], {
          ...clamp,
          easing: ease,
        }),
      }}
    >
      {children}
    </div>
  );
};
