import { useMemo } from "react";
import { computeLPath, pointsToString } from "@/lib/helpers/line-path";

interface NodeLike { x: number; y: number }

export function ConnectionLines({ nodes }: { nodes: Array<NodeLike | null> }) {
  const points = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      if (!a || !b) continue;
      const seg = computeLPath(a.x, a.y, b.x, b.y, true);
      arr.push(pointsToString(seg));
    }
    return arr;
  }, [nodes]);

  return (
    <svg className="absolute inset-0 pointer-events-none" aria-hidden>
      <defs>
        <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--brand-cyan))" />
          <stop offset="100%" stopColor="hsl(var(--brand-purple))" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {points.map((p, i) => (
        <polyline
          key={i}
          points={p}
          fill="none"
          stroke="url(#beam)"
          strokeWidth={2}
          filter="url(#glow)"
          strokeDasharray={240}
          strokeDashoffset={0}
        >
          <animate attributeName="stroke-dashoffset" from="240" to="0" dur="600ms" begin={`${i * 120}ms`} fill="freeze" />
        </polyline>
      ))}
    </svg>
  );
}
