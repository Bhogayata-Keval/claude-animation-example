import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Appear } from "../Appear";
import { ChipIcon, CloudIcon, ContainerIcon, NodeHex } from "../Icons";
import { C, clamp, ease, mono, sans } from "../theme";

// ---- Layout (1920x1080) ----
const EC2 = { left: 90, top: 200, width: 1100, height: 760 };
const DOCKER = { left: 140, top: 330, width: 410, height: 560 };
const AGENT = { left: 770, top: 330, width: 370, height: 560 };
const SAAS = { left: 1360, top: 300, width: 470, height: 580 };
const LANE_Y = 610;
const A_FROM = DOCKER.left + DOCKER.width - 20;
const A_TO = AGENT.left + 10;
const B_FROM = AGENT.left + AGENT.width - 10;
const B_TO = SAAS.left + 10;

// ---- Data flow timing (scene frames) ----
// Beat boundaries come from the voiceover (see src/timing.ts):
//   0..p1  boxes build          ("Here's a Node.js app…")
//   p1..p2 spans flow to agent  ("The Middleware APM package…")
//   p2..   agent exports batches ("The agent is an OpenTelemetry Collector…")
const SPAN_COUNT = 16;
const TRAVEL_A = 18;
const BATCH = 4;
const BATCH_GAP = 26;
const TRAVEL_B = 24;

const SPAN_NAMES = [
  ["POST /checkout", C.purple],
  ["auth.verify", C.node],
  ["db.query", C.amber],
  ["redis.get", C.red],
  ["GET /products", C.purple],
  ["http.client", C.docker],
  ["db.query", C.amber],
  ["cart.load", C.node],
] as const;

const BATCHES = SPAN_COUNT / BATCH;

export type PipelineBeats = {
  readonly p1: number;
  readonly p2: number;
  readonly spanEvery: number;
};

type Flow = PipelineBeats & {
  spanStart: (i: number) => number;
  spanArrive: (i: number) => number;
  batchSend: (k: number) => number;
  batchArrive: (k: number) => number;
};

const makeFlow = (beats: PipelineBeats): Flow => {
  const spanStart = (i: number) => beats.p1 + 12 + i * beats.spanEvery;
  const spanArrive = (i: number) => spanStart(i) + TRAVEL_A;
  const batchSend = (k: number) =>
    Math.max(beats.p2 + 10 + k * BATCH_GAP, spanArrive(k * BATCH + BATCH - 1) + 6);
  return {
    ...beats,
    spanStart,
    spanArrive,
    batchSend,
    batchArrive: (k) => batchSend(k) + TRAVEL_B,
  };
};

const Box: React.FC<{
  readonly rect: { left: number; top: number; width: number; height: number };
  readonly border: string;
  readonly bg: string;
  readonly dashed?: boolean;
  readonly children?: React.ReactNode;
}> = ({ rect, border, bg, dashed, children }) => (
  <div
    style={{
      position: "absolute",
      ...rect,
      borderRadius: 28,
      border: `3px ${dashed ? "dashed" : "solid"} ${border}`,
      background: bg,
      boxSizing: "border-box",
    }}
  >
    {children}
  </div>
);

const BoxLabel: React.FC<{
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly sub: string;
  readonly color: string;
}> = ({ icon, title, sub, color }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "22px 26px",
    }}
  >
    {icon}
    <div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{title}</div>
      <div style={{ fontFamily: mono, fontSize: 20, color: C.muted }}>
        {sub}
      </div>
    </div>
  </div>
);

const Headline: React.FC<{ readonly flow: Flow }> = ({ flow }) => {
  const frame = useCurrentFrame();
  const lines = [
    { from: 0, to: flow.p1, text: "A Node.js service runs in Docker on an EC2 host" },
    { from: flow.p1, to: flow.p2, text: "① The OTel SDK exports spans to the local agent" },
    { from: flow.p2, to: 100000, text: "② The Middleware Agent batches & ships them to SaaS" },
  ];
  return (
    <>
      {lines.map((l) => (
        <div
          key={l.text}
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
            opacity: interpolate(
              frame,
              [l.from, l.from + 12, l.to - 8, l.to],
              [0, 1, 1, 0],
              clamp,
            ),
            translate: interpolate(
              frame,
              [l.from, l.from + 18],
              ["0px 24px", "0px 0px"],
              { ...clamp, easing: ease },
            ),
          }}
        >
          {l.text}
        </div>
      ))}
    </>
  );
};

const Lane: React.FC<{
  readonly x1: number;
  readonly x2: number;
  readonly label: string;
  readonly start: number;
}> = ({ x1, x2, label, start }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [start, start + 18], [0, 1], {
    ...clamp,
    easing: ease,
  });
  return (
    <>
      <svg
        style={{ position: "absolute", left: 0, top: 0 }}
        width={1920}
        height={1080}
      >
        <line
          x1={x1}
          y1={LANE_Y}
          x2={x1 + (x2 - x1) * draw}
          y2={LANE_Y}
          stroke={C.purple}
          strokeOpacity={0.45}
          strokeWidth={4}
          strokeDasharray="10 10"
          strokeDashoffset={-frame * 1.5}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x1,
          width: x2 - x1,
          // Bottom-anchored so multi-line labels grow upward, away from the lane.
          bottom: 1080 - (LANE_Y - 44),
          textAlign: "center",
          whiteSpace: "pre-line",
          lineHeight: 1.35,
          fontFamily: mono,
          fontSize: 18,
          fontWeight: 600,
          color: C.purple,
          opacity: interpolate(frame, [start + 8, start + 20], [0, 1], clamp),
        }}
      >
        {label}
      </div>
    </>
  );
};

const SpanPill: React.FC<{
  readonly x: number;
  readonly label: string;
  readonly color: string;
  readonly opacity: number;
}> = ({ x, label, color, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: LANE_Y,
      translate: "-50% -50%",
      opacity,
      padding: "6px 12px",
      borderRadius: 999,
      background: "white",
      border: `3px solid ${color}`,
      boxShadow: `0 6px 18px ${color}55`,
      fontFamily: mono,
      fontSize: 16,
      fontWeight: 600,
      color: C.ink,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

const Packets: React.FC<{ readonly flow: Flow }> = ({ flow }) => {
  const frame = useCurrentFrame();
  const { spanStart, spanArrive, batchSend, batchArrive } = flow;
  return (
    <>
      {Array.from({ length: SPAN_COUNT }).map((_, i) => {
        const s = spanStart(i);
        if (frame < s || frame > spanArrive(i) + 2) return null;
        const [label, color] = SPAN_NAMES[i % SPAN_NAMES.length];
        return (
          <SpanPill
            key={`s${i}`}
            label={label}
            color={color}
            x={interpolate(frame, [s, spanArrive(i)], [A_FROM + 50, A_TO - 75], {
              ...clamp,
              easing: ease,
            })}
            opacity={interpolate(
              frame,
              [s, s + 4, spanArrive(i) - 2, spanArrive(i) + 2],
              [0, 1, 1, 0],
              clamp,
            )}
          />
        );
      })}
      {Array.from({ length: BATCHES }).map((_, k) => {
        const s = batchSend(k);
        const e = batchArrive(k);
        if (frame < s || frame > e + 3) return null;
        return (
          <div
            key={`b${k}`}
            style={{
              position: "absolute",
              top: LANE_Y,
              left: interpolate(frame, [s, e], [B_FROM - 30, B_TO + 30], {
                ...clamp,
                easing: ease,
              }),
              translate: "-50% -50%",
              opacity: interpolate(frame, [s, s + 3, e - 1, e + 3], [0, 1, 1, 0], clamp),
              padding: "10px 16px",
              borderRadius: 14,
              background: C.purple,
              color: "white",
              fontFamily: mono,
              fontSize: 18,
              fontWeight: 600,
              boxShadow: `0 10px 26px ${C.purple}88`,
              whiteSpace: "nowrap",
            }}
          >
            batch ×{BATCH}
          </div>
        );
      })}
    </>
  );
};

const Stage: React.FC<{
  readonly label: string;
  readonly value: string;
  readonly active: number;
}> = ({ label, value, active }) => (
  <div
    style={{
      margin: "0 24px 14px",
      padding: "12px 18px",
      borderRadius: 14,
      background: "white",
      border: `2px solid ${C.purple}`,
      borderColor: `rgba(91,63,214,${0.25 + active * 0.75})`,
      boxShadow: `0 0 ${active * 24}px rgba(91,63,214,${active * 0.45})`,
    }}
  >
    <div style={{ fontFamily: mono, fontSize: 16, color: C.muted }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 600, color: C.ink }}>{value}</div>
  </div>
);

const AgentInternals: React.FC<{ readonly flow: Flow }> = ({ flow }) => {
  const frame = useCurrentFrame();
  const { spanArrive, batchSend } = flow;
  // How lit each stage is: flash briefly when a span / batch passes.
  const pulse = (times: number[]) =>
    Math.max(
      0,
      ...times.map((t) => interpolate(frame, [t - 2, t, t + 10], [0, 1, 0], clamp)),
    );
  const arrivals = Array.from({ length: SPAN_COUNT }, (_, i) => spanArrive(i));
  const sends = Array.from({ length: BATCHES }, (_, k) => batchSend(k));

  // Batch buffer: one slot per span, grouped per outgoing batch.
  const slotFilled = (i: number) =>
    frame >= spanArrive(i) && frame < batchSend(Math.floor(i / BATCH));

  return (
    <div>
      <Stage label="receivers" value="otlp  :9319 / :9320" active={pulse(arrivals)} />
      <Stage label="processors" value="batch · resourcedetection" active={pulse(arrivals.map((a) => a + 3))} />
      <div style={{ display: "flex", gap: 14, margin: "0 24px 14px", justifyContent: "center" }}>
        {Array.from({ length: BATCHES }).map((_, k) => (
          <div key={k} style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: BATCH }).map((__, j) => (
              <div
                key={j}
                style={{
                  width: 14,
                  height: 22,
                  borderRadius: 4,
                  background: slotFilled(k * BATCH + j) ? C.purple : C.lavender,
                  border: `2px solid ${C.purple}55`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <Stage label="exporters" value="otlphttp → middleware.io" active={pulse(sends)} />
    </div>
  );
};

const SaasPanel: React.FC<{ readonly flow: Flow }> = ({ flow }) => {
  const frame = useCurrentFrame();
  const { batchArrive } = flow;
  let received = 0;
  for (let k = 0; k < BATCHES; k++) if (frame >= batchArrive(k)) received += BATCH;
  const rows = [
    ["POST /checkout", "842 ms", C.red],
    ["GET /products", "54 ms", C.node],
    ["GET /cart", "97 ms", C.node],
    ["POST /login", "131 ms", C.amber],
  ] as const;
  const glow = Math.max(
    0,
    ...Array.from({ length: BATCHES }, (_, k) =>
      interpolate(frame, [batchArrive(k) - 2, batchArrive(k), batchArrive(k) + 14], [0, 1, 0], clamp),
    ),
  );
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: -3,
          borderRadius: 28,
          boxShadow: `0 0 ${glow * 50}px rgba(91,63,214,${glow * 0.5})`,
        }}
      />
      <div style={{ padding: "0 28px" }}>
        <div style={{ fontFamily: mono, fontSize: 18, color: C.muted }}>spans received</div>
        <div style={{ fontSize: 72, fontWeight: 800, color: C.purple, lineHeight: 1.1 }}>
          {received.toLocaleString("en-US")}
        </div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map(([name, dur, color], k) => {
            const t = batchArrive(k);
            return (
              <div
                key={name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "white",
                  border: `2px solid ${C.lavender}`,
                  fontFamily: mono,
                  fontSize: 19,
                  color: C.ink,
                  opacity: interpolate(frame, [t, t + 10], [0, 1], clamp),
                  translate: interpolate(frame, [t, t + 16], ["-30px 0px", "0px 0px"], {
                    ...clamp,
                    easing: ease,
                  }),
                }}
              >
                <span>{name}</span>
                <span style={{ color, fontWeight: 600 }}>{dur}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const Pipeline: React.FC<{ readonly beats: PipelineBeats }> = ({ beats }) => {
  const flow = makeFlow(beats);
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Headline flow={flow} />

      {/* EC2 host */}
      <Appear delay={10} style={{ left: 0, top: 0, width: 1920, height: 1080 }} rise={0}>
        <Box rect={EC2} border={C.aws} bg="rgba(255,153,0,0.05)" dashed>
          <BoxLabel
            icon={<ChipIcon size={54} />}
            title="EC2 instance"
            sub="t3.small · us-east-1"
            color="#B86E00"
          />
        </Box>
      </Appear>

      {/* Docker container + Node app */}
      <Appear delay={32} style={{ left: 0, top: 0, width: 1920, height: 1080 }}>
        <Box rect={DOCKER} border={C.docker} bg="rgba(36,150,237,0.06)">
          <BoxLabel
            icon={<ContainerIcon size={54} />}
            title="Docker container"
            sub="checkout:1.4.2"
            color="#146EB4"
          />
        </Box>
      </Appear>
      <Appear
        delay={50}
        style={{
          left: DOCKER.left + 30,
          top: DOCKER.top + 130,
          width: DOCKER.width - 60,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 26,
            boxShadow: "0 12px 30px rgba(27,19,64,0.10)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <NodeHex size={110} />
          <div style={{ fontSize: 32, fontWeight: 700, color: C.ink }}>
            Node.js app
          </div>
          <div style={{ fontFamily: mono, fontSize: 18, color: C.muted, textAlign: "center" }}>
            @middleware.io/node-apm
            <br />
            OpenTelemetry SDK
          </div>
        </div>
      </Appear>

      {/* Middleware Agent */}
      <Appear delay={70} style={{ left: 0, top: 0, width: 1920, height: 1080 }}>
        <Box rect={AGENT} border={C.purple} bg="rgba(91,63,214,0.06)">
          <BoxLabel
            icon={
              <Img
                src={staticFile("mascot.png")}
                style={{ width: 60, mixBlendMode: "multiply", maskImage: "radial-gradient(closest-side, black 82%, transparent 100%)" }}
              />
            }
            title="Middleware Agent"
            sub="OTel Collector · host-level"
            color={C.purpleDeep}
          />
          <AgentInternals flow={flow} />
        </Box>
      </Appear>

      {/* Middleware SaaS */}
      <Appear delay={90} style={{ left: 0, top: 0, width: 1920, height: 1080 }}>
        <Box rect={SAAS} border={C.purple} bg="white">
          <BoxLabel
            icon={<CloudIcon size={64} />}
            title="middleware.io"
            sub="Observability SaaS"
            color={C.purpleDeep}
          />
          <SaasPanel flow={flow} />
        </Box>
      </Appear>

      <Lane x1={A_FROM} x2={A_TO} label={"OTLP\n172.17.0.1:9319"} start={112} />
      <Lane x1={B_FROM} x2={B_TO} label="OTLP / HTTPS" start={120} />

      <Packets flow={flow} />
    </AbsoluteFill>
  );
};
