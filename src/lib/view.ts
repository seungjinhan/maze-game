// 시야: 화면에 보이는 미로 넓이 = p × 전체 넓이. 카메라는 미로 가장자리에서 멈춰요.

export const MIN_VIEW = 3; // 작은 미로에서도 최소 3×3칸은 보여요

export interface View {
  /** 칸 한 변 (CSS px) */
  cell: number;
  /** 화면에 들어가는 칸 수 (미로 밖 포함) */
  vw: number;
  vh: number;
  /** 실제로 보이는 미로 칸 수 */
  seenCols: number;
  seenRows: number;
  /** 실제로 보이는 넓이 비율 */
  actual: number;
  /** 최소 3×3칸 때문에 더 보이는지 */
  floored: boolean;
}

export function viewFor(width: number, height: number, cols: number, rows: number, p: number): View {
  const visible = (c: number) => Math.min(width / c, cols) * Math.min(height / c, rows);
  const fit = Math.min(width / cols, height / rows);
  let cell = fit;
  if (p < 1) {
    const target = p * cols * rows;
    let lo = fit, hi = Math.max(width, height);
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (visible(mid) > target) lo = mid;
      else hi = mid;
    }
    cell = lo;
  }
  const maxCell = Math.min(width / Math.min(MIN_VIEW, cols), height / Math.min(MIN_VIEW, rows));
  const floored = cell > maxCell;
  if (floored) cell = maxCell;
  return {
    cell,
    vw: width / cell,
    vh: height / cell,
    seenCols: Math.min(width / cell, cols),
    seenRows: Math.min(height / cell, rows),
    actual: visible(cell) / (cols * rows),
    floored,
  };
}

/** 카메라 왼쪽 위 (칸 단위). 플레이어를 가운데에 두고, 미로가 화면보다 작으면 가운데 정렬 */
export function camAxis(center: number, viewCells: number, size: number): number {
  if (viewCells >= size) return (size - viewCells) / 2;
  return Math.max(0, Math.min(size - viewCells, center - viewCells / 2));
}
