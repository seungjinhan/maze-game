import { describe, expect, it } from "vitest";
import { E, N, S, W, type Maze } from "./maze";
import { continueStraight } from "./move";

// 직접 그린 3×3 미로. 열린 쪽만 적어요.
//  (0,0)─(1,0)─(2,0)
//          │
//  (0,1)─(1,1)  (2,1)
//                 │
//  (0,2)─(1,2)─(2,2)
function build(open: Record<string, string>): Maze {
  const walls = new Uint8Array(9).fill(N | E | S | W);
  const bit: Record<string, number> = { n: N, e: E, s: S, w: W };
  for (const [k, dirs] of Object.entries(open)) {
    const [x, y] = k.split(",").map(Number);
    for (const d of dirs) walls[y * 3 + x] &= ~bit[d];
  }
  return { cols: 3, rows: 3, walls };
}
const m = build({
  "0,0": "e", "1,0": "wse", "2,0": "w",
  "0,1": "e", "1,1": "wn",
  "2,1": "s",
  "0,2": "e", "1,2": "we", "2,2": "wn",
});

describe("직선 자동 이동", () => {
  it("옆길 없는 직선이면 계속 가요", () => {
    expect(continueStraight(m, 1, 2, "right")).toBe(true); // (1,2): 앞(오른쪽) 열림, 옆길 없음
    expect(continueStraight(m, 1, 2, "left")).toBe(true);  // 반대로 와도 같아요
  });
  it("옆길(갈림길)이 있으면 멈춰요", () => {
    expect(continueStraight(m, 1, 0, "right")).toBe(false); // (1,0): 아래로 옆길
  });
  it("모퉁이에서 멈춰요 (꺾인 길은 안 따라가요)", () => {
    expect(continueStraight(m, 1, 1, "down")).toBe(false); // (1,1): 앞은 벽, 왼쪽으로 꺾임
    expect(continueStraight(m, 2, 2, "right")).toBe(false); // (2,2): 위로 꺾임
  });
  it("막다른 곳에서 멈춰요", () => {
    expect(continueStraight(m, 0, 1, "left")).toBe(false);
  });
});
