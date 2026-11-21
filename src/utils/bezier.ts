/**
 * Miro-style organic Bézier curve and connection path generator.
 */

export interface BezierParams {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  side?: 'left' | 'right';
  depth?: number;
}

/**
 * Generates an organic, fluid cubic Bézier curve connecting parent branch anchor to child anchor.
 * Dynamically computes curvature, tangents, and inflections based on relative node positions,
 * ensuring graceful organic flow even when nodes are moved arbitrarily.
 */
export function createMiroBezierPath({ x1, y1, x2, y2, side, depth = 1 }: BezierParams): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Determine actual geometric side if not constrained, or if node was moved past parent
  const effectiveSide = side ? (dx >= 0 && side === 'right' ? 'right' : dx < 0 && side === 'left' ? 'left' : dx >= 0 ? 'right' : 'left') : dx >= 0 ? 'right' : 'left';

  // Natural organic curvature factor:
  // For small horizontal distances with vertical displacement, give it a round, relaxed S-curve.
  // For long horizontal distances, keep the takeoff and landing horizontal.
  let cp1x: number;
  let cp1y: number;
  let cp2x: number;
  let cp2y: number;

  if (effectiveSide === 'right') {
    // Parent exits to the right, child enters from the left
    const minHorizontalReach = Math.max(absDx * 0.45, Math.min(absDy * 0.35, 60));
    cp1x = x1 + minHorizontalReach;
    cp1y = y1;

    cp2x = x2 - minHorizontalReach;
    cp2y = y2;
  } else {
    // Parent exits to the left, child enters from the right
    const minHorizontalReach = Math.max(absDx * 0.45, Math.min(absDy * 0.35, 60));
    cp1x = x1 - minHorizontalReach;
    cp1y = y1;

    cp2x = x2 + minHorizontalReach;
    cp2y = y2;
  }

  // Smooth cubic Bézier: M x1 y1 C cp1x cp1y, cp2x cp2y, x2 y2
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

/**
 * Returns stroke width depending on hierarchy depth to simulate tapering tree branches.
 */
export function getBranchStrokeWidth(depth: number): number {
  if (depth <= 1) return 3.2;
  if (depth === 2) return 2.4;
  if (depth === 3) return 1.8;
  return 1.5;
}

/**
 * Generates SVG path for the Miro node underline bar.
 */
export function createUnderlinePath(
  x: number,
  y: number,
  width: number,
  height: number,
  side: 'left' | 'right'
): string {
  const lineY = y + height - 2;
  if (side === 'right') {
    return `M ${x.toFixed(1)} ${lineY.toFixed(1)} L ${(x + width).toFixed(1)} ${lineY.toFixed(1)}`;
  } else {
    return `M ${(x + width).toFixed(1)} ${lineY.toFixed(1)} L ${x.toFixed(1)} ${lineY.toFixed(1)}`;
  }
}

