import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Appear } from "../Appear";
import { C, clamp, ease, mono, sans } from "../theme";

const TOTAL_MS = 842;
const BAR_W = 560;

const SPANS = [
  { name: "POST /checkout", svc: "checkout", start: 0, dur: 842, color: C.purple, depth: 0 },
  { name: "auth.verify", svc: "checkout", start: 8, dur: 46, color: C.node, depth: 1 },
  { name: "cart.load", svc: "checkout", start: 58, dur: 88, color: C.node, depth: 1 },
  { name: "redis.get cart:*", svc: "redis", start: 62, dur: 14, color: C.docker, depth: 2 },
  { name: "db.query orders", svc: "postgres", start: 152, dur: 612, color: C.red, depth: 1 },
  { name: "payment.charge", svc: "stripe", start: 770, dur: 66, color: C.amber, depth: 1 },
];
const CULPRIT = 4;

const Waterfall: React.FC<{ readonly highlightAt: number }> = ({ highlightAt: HIGHLIGHT_AT }) => {
  const frame = useCurrentFrame();
  const hl = interpolate(frame, [HIGHLIGHT_AT, HIGHLIGHT_AT + 15], [0, 1], clamp);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 26 }}>
      {SPANS.map((s, i) => {
        const t = 30 + i * 8;
        const isCulprit = i === CULPRIT;
        return (
          <div
            key={s.name}
            style={{
              display: "flex",
              alignItems: "center",
              height: 68,
              padding: "0 14px",
              borderRadius: 14,
              background: isCulprit ? `rgba(229,72,77,${hl * 0.08})` : "transparent",
              outline: isCulprit ? `3px solid rgba(229,72,77,${hl})` : "none",
              opacity: interpolate(frame, [t, t + 10], [0, 1], clamp),
            }}
          >
            <div style={{ width: 330, paddingLeft: s.depth * 26 }}>
              <div style={{ fontFamily: mono, fontSize: 21, fontWeight: 600, color: C.ink }}>
                {s.name}
              </div>
              <div style={{ fontSize: 17, color: C.muted }}>{s.svc}</div>
            </div>
            <div style={{ position: "relative", width: BAR_W, height: 30 }}>
              <div
                style={{
                  position: "absolute",
                  left: (s.start / TOTAL_MS) * BAR_W,
                  width:
                    Math.max(6, (s.dur / TOTAL_MS) * BAR_W) *
                    interpolate(frame, [t, t + 22], [0, 1], { ...clamp, easing: ease }),
                  height: 30,
                  borderRadius: 8,
                  background: s.color,
                }}
              />
            </div>
            <div
              style={{
                width: 100,
                textAlign: "right",
                fontFamily: mono,
                fontSize: 20,
                color: isCulprit ? C.red : C.muted,
                fontWeight: isCulprit ? 700 : 400,
              }}
            >
              {s.dur} ms
            </div>
          </div>
        );
      })}
    </div>
  );
};

// p95 latency series (ms) — spike after deploy.
const SERIES = [180, 190, 175, 200, 185, 195, 190, 560, 610, 640, 600, 620];
const CH = { w: 560, h: 200 };

const LatencyChart: React.FC<{ readonly start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const max = 700;
  const pts = SERIES.map((v, i) => [
    (i / (SERIES.length - 1)) * CH.w,
    CH.h - (v / max) * CH.h,
  ]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const progress = interpolate(frame, [start, start + 60], [0, 1], { ...clamp, easing: ease });
  const deployX = (6.5 / (SERIES.length - 1)) * CH.w;
  return (
    <svg width={CH.w} height={CH.h + 10} style={{ marginTop: 18, overflow: "visible" }}>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={0} x2={CH.w} y1={CH.h * g} y2={CH.h * g} stroke={C.lavender} strokeWidth={2} />
      ))}
      <line
        x1={deployX}
        x2={deployX}
        y1={0}
        y2={CH.h}
        stroke={C.muted}
        strokeDasharray="6 6"
        strokeWidth={2}
        opacity={interpolate(frame, [start + 35, start + 45], [0, 1], clamp)}
      />
      <text
        x={deployX - 8}
        y={18}
        textAnchor="end"
        fontFamily={mono}
        fontSize={16}
        fill={C.muted}
        opacity={interpolate(frame, [start + 35, start + 45], [0, 1], clamp)}
      >
        deploy v1.4.2
      </text>
      <path
        d={d}
        fill="none"
        stroke={C.purple}
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - progress}
      />
    </svg>
  );
};

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 26,
  padding: "28px 34px",
  boxShadow: "0 18px 50px rgba(27,19,64,0.10)",
  border: `2px solid ${C.lavender}`,
  boxSizing: "border-box",
};

const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 56,
        fontWeight: 700,
        color: C.ink,
        letterSpacing: -1,
        opacity: interpolate(frame, [0, 12], [0, 1], clamp),
        translate: interpolate(frame, [0, 18], ["0px 24px", "0px 0px"], {
          ...clamp,
          easing: ease,
        }),
      }}
    >
      ③ Middleware turns those traces into insights
    </div>
  );
};

export type InsightsBeats = { readonly chartStart: number; readonly highlightAt: number };

export const Insights: React.FC<{ readonly beats: InsightsBeats }> = ({ beats }) => {
  const HIGHLIGHT_AT = beats.highlightAt;
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Headline />

      <Appear delay={10} style={{ left: 90, top: 200, width: 1100, height: 760 }}>
        <div style={{ ...card, height: 760 }}>
          <div style={{ fontSize: 22, color: C.muted, fontFamily: mono }}>
            TRACE · 7f3a9e…c21 · checkout-service
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.ink, marginTop: 6 }}>
            POST /checkout <span style={{ color: C.red }}>842 ms</span>
          </div>
          <Waterfall highlightAt={HIGHLIGHT_AT} />
        </div>
      </Appear>

      <Appear delay={22} style={{ left: 1230, top: 200, width: 600 }}>
        <div style={{ ...card, padding: "26px 20px 22px" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.ink, paddingLeft: 6 }}>
            p95 latency · /checkout
          </div>
          <LatencyChart start={beats.chartStart} />
        </div>
      </Appear>

      <Appear delay={HIGHLIGHT_AT + 10} style={{ left: 1230, top: 560, width: 600 }}>
        <div
          style={{
            ...card,
            height: 400,
            border: `3px solid ${C.purple}`,
            background: `linear-gradient(160deg, white 55%, ${C.lavender})`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: 999,
              background: C.purple,
              color: "white",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            INSIGHT
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: C.ink, marginTop: 16, lineHeight: 1.15 }}>
            /checkout p95 up <span style={{ color: C.red }}>3.2×</span> since v1.4.2
          </div>
          <div style={{ fontSize: 24, color: C.muted, marginTop: 14, lineHeight: 1.35, width: 360 }}>
            Root cause:{" "}
            <span style={{ fontFamily: mono, color: C.ink }}>db.query orders</span> takes
            73% of each trace.
          </div>
          <Img
            src={staticFile("mascot.png")}
            style={{
              position: "absolute",
              right: -30,
              bottom: -20,
              width: 230,
              mixBlendMode: "multiply", maskImage: "radial-gradient(closest-side, black 82%, transparent 100%)",
            }}
          />
        </div>
      </Appear>
    </AbsoluteFill>
  );
};
