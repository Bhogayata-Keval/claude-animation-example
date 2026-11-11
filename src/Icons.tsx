import { C } from "./theme";

export const NodeHex: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <polygon
      points="50,4 90,27 90,73 50,96 10,73 10,27"
      fill={C.node}
      stroke="#3F7A33"
      strokeWidth={4}
    />
    <text
      x="50"
      y="62"
      textAnchor="middle"
      fontSize="32"
      fontWeight="800"
      fill="white"
      fontFamily="sans-serif"
    >
      JS
    </text>
  </svg>
);

export const ChipIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="18" y="18" width="64" height="64" rx="10" fill={C.aws} />
    <rect x="34" y="34" width="32" height="32" rx="4" fill="white" />
    {[30, 50, 70].map((p) => (
      <g key={p} stroke={C.aws} strokeWidth="6" strokeLinecap="round">
        <line x1={p} y1="4" x2={p} y2="16" />
        <line x1={p} y1="84" x2={p} y2="96" />
        <line x1="4" y1={p} x2="16" y2={p} />
        <line x1="84" y1={p} x2="96" y2={p} />
      </g>
    ))}
  </svg>
);

export const ContainerIcon: React.FC<{ readonly size: number }> = ({
  size,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    {[
      [14, 46],
      [38, 46],
      [62, 46],
      [26, 22],
      [50, 22],
    ].map(([x, y]) => (
      <rect key={`${x}-${y}`} x={x} y={y} width="22" height="22" rx="3" fill={C.docker} />
    ))}
    <path
      d="M6 72 Q50 96 94 72"
      stroke={C.docker}
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export const CloudIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70">
    <path
      d="M25 62 H78 a18 18 0 0 0 0-36 a26 26 0 0 0-50-4 a20 20 0 0 0-3 40 Z"
      fill={C.purple}
    />
  </svg>
);
