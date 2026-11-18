// 미로 규칙과 만들기. 다른 파일을 불러오지 않아요 (scripts/generate-maps.ts가 Node로 바로 불러써요).

export const STAGES = 50;

/**
 * 단계 묶음. 0~4 = 등급(50단계씩), 5 = 우주(미로 1개, 신을 끝내면 나타나요).
 * p = 화면에 보이는 미로 넓이 ÷ 전체 넓이. from → to = 1단계 → 50단계 미로 한 변(정사각형).
 * 지금은 등급마다 50단계 내내 같은 크기예요 (초보 10 · 중급 15 · 고급 20 · 특급 25 · 신 30).
 */
export const LEVELS = [
  { name: "초보", p: 1.0, from: 10, to: 10 },
  { name: "중급", p: 0.5, from: 15, to: 15 },
  { name: "고급", p: 0.3, from: 20, to: 20 },
  { name: "특급", p: 0.15, from: 25, to: 25 },
  { name: "신", p: 0.05, from: 30, to: 30 },
  { name: "우주", p: 0.05, from: 50, to: 50 },
] as const;
export const SPACE = 5;
/** 차례로 여는 등급 5개 (우주 제외) */
export const GRADES = LEVELS.slice(0, SPACE);
export const stagesOf = (level: number) => (level === SPACE ? 1 : STAGES);

export const N = 1, E = 2, S = 4, W = 8;

export type Dir = "up" | "right" | "down" | "left";
export const DIR_LIST: readonly Dir[] = ["up", "right", "down", "left"];
export const DIRS: Record<Dir, { dx: number; dy: number; bit: number; back: Dir }> = {
  up: { dx: 0, dy: -1, bit: N, back: "down" },
  right: { dx: 1, dy: 0, bit: E, back: "left" },
  down: { dx: 0, dy: 1, bit: S, back: "up" },
  left: { dx: -1, dy: 0, bit: W, back: "right" },
};

export interface Maze {
  cols: number;
  rows: number;
  /** 칸마다 막힌 벽 (N | E | S | W) */
  walls: Uint8Array;
}

/** 정사각형 미로. 한 변이 1단계 from → 50단계 to로 고르게 늘어요. */
export function sizeOf(stage: number, level: number): { cols: number; rows: number } {
  const { from, to } = LEVELS[level];
  const n = from + Math.floor(((stage - 1) * (to - from)) / (STAGES - 1));
  return { cols: n, rows: n };
}

export function canGo(m: Maze, x: number, y: number, dir: Dir): boolean {
  return !(m.walls[y * m.cols + x] & DIRS[dir].bit);
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 고정 시드 + 깊이 우선 탐색. 길이 하나뿐인 미로(고리 없음) */
export function generate(cols: number, rows: number, seed: number): Maze {
  const rnd = mulberry32(seed);
  const walls = new Uint8Array(cols * rows).fill(N | E | S | W);
  const seen = new Uint8Array(cols * rows);
  const stack = [0];
  seen[0] = 1;
  while (stack.length) {
    const i = stack[stack.length - 1];
    const x = i % cols, y = Math.floor(i / cols);
    const opts: [Dir, number][] = [];
    for (const dir of DIR_LIST) {
      const nx = x + DIRS[dir].dx, ny = y + DIRS[dir].dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen[ny * cols + nx]) opts.push([dir, ny * cols + nx]);
    }
    if (!opts.length) {
      stack.pop();
      continue;
    }
    const [dir, j] = opts[Math.floor(rnd() * opts.length)];
    walls[i] &= ~DIRS[dir].bit;
    walls[j] &= ~DIRS[DIRS[dir].back].bit;
    seen[j] = 1;
    stack.push(j);
  }
  return { cols, rows, walls };
}

/** 출발(왼쪽 위) → 도착(오른쪽 아래) 정답 길이와, 출발에서 닿는 칸 수 */
export function solve(m: Maze): { length: number; reached: number } {
  const { cols, rows } = m;
  const dist = new Int32Array(cols * rows).fill(-1);
  dist[0] = 0;
  const q = [0];
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % cols, y = Math.floor(i / cols);
    for (const dir of DIR_LIST) {
      if (!canGo(m, x, y, dir)) continue;
      const j = (y + DIRS[dir].dy) * cols + (x + DIRS[dir].dx);
      if (dist[j] < 0) {
        dist[j] = dist[i] + 1;
        q.push(j);
      }
    }
  }
  return { length: dist[cols * rows - 1], reached: q.length };
}

/**
 * 등급마다 다른 미로 50개 + 우주 미로 1개. 크기가 같은 단계끼리는 정답이 긴 미로를 뒤 단계에 둬요.
 * 결과: [단계 묶음][단계 − 1]
 */
export function buildAllMazes(): Maze[][] {
  return LEVELS.map((_, g) => {
    const list: Maze[] = [];
    const last = stagesOf(g);
    let stage = 1;
    while (stage <= last) {
      const { cols, rows } = sizeOf(stage, g);
      let count = 0;
      while (stage + count <= last && sizeOf(stage + count, g).cols === cols) count++;
      const group = Array.from({ length: count }, (_, k) =>
        generate(cols, rows, ((g + 1) * 1000003 + stage * 7919 + k * 104729 + 12345) >>> 0),
      ).sort((a, b) => solve(a).length - solve(b).length);
      list.push(...group);
      stage += count;
    }
    return list;
  });
}

/** 칸 하나 = 16진수 한 글자 */
export function encodeWalls(walls: Uint8Array): string {
  let s = "";
  for (const w of walls) s += w.toString(16);
  return s;
}

export function decodeWalls(s: string): Uint8Array {
  const walls = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) walls[i] = parseInt(s[i], 16);
  return walls;
}
