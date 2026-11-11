import { AbsoluteFill } from "remotion";
import { C } from "./theme";

export const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: C.bg,
      backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
      backgroundSize: "48px 48px",
    }}
  >
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 80% 15%, rgba(91,63,214,0.14), transparent 45%), radial-gradient(circle at 10% 90%, rgba(91,63,214,0.10), transparent 40%)",
      }}
    />
  </AbsoluteFill>
);
