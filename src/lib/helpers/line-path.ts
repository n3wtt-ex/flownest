export type Point = { x: number; y: number };

// Compute an L-shaped polyline with 90° turns between two points.
export function computeLPath(x1: number, y1: number, x2: number, y2: number, xFirst = true): Point[] {
  // Snap to integer grid to avoid tiny angles
  const a = { x: Math.round(x1), y: Math.round(y1) };
  const b = { x: Math.round(x2), y: Math.round(y2) };

  if (a.y === b.y || a.x === b.x) {
    return [a, b];
  }

  if (xFirst) {
    return [a, { x: b.x, y: a.y }, b];
  } else {
    return [a, { x: a.x, y: b.y }, b];
  }
}

export function pointsToString(points: Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}
