import { describe, expect, it } from "vitest";
import data from "../data/maps.json";
import { getMaze } from "./maps";
import { buildAllMazes, encodeWalls, GRADES, LEVELS, N, S, E, W, sizeOf, solve, SPACE, stagesOf, STAGES } from "./maze";

describe("미로 251개 (5등급 × 50 + 우주 1)", () => {
  it("maps.json이 생성기 결과와 같아요 (고정 시드)", () => {
    const all = buildAllMazes();
    all.forEach((list, g) => list.forEach((m, i) => expect(data.grades[g][i].w).toBe(encodeWalls(m.walls))));
  });

  it("크기 규칙, 모든 칸 연결, 바깥 벽, 정답 길이 순서", () => {
    for (let g = 0; g < LEVELS.length; g++) {
      for (let s = 1; s <= stagesOf(g); s++) {
        const m = getMaze(g, s);
        expect({ cols: m.cols, rows: m.rows }).toEqual(sizeOf(s, g));
        const r = solve(m);
        expect(r.reached).toBe(m.cols * m.rows);
        for (let x = 0; x < m.cols; x++) {
          expect(m.walls[x] & N).toBe(N);
          expect(m.walls[(m.rows - 1) * m.cols + x] & S).toBe(S);
        }
        for (let y = 0; y < m.rows; y++) {
          expect(m.walls[y * m.cols] & W).toBe(W);
          expect(m.walls[y * m.cols + m.cols - 1] & E).toBe(E);
        }
        if (s > 1 && sizeOf(s - 1, g).cols === m.cols) expect(solve(getMaze(g, s - 1)).length).toBeLessThanOrEqual(r.length);
      }
    }
  });

  it("같은 미로가 없어요 (등급마다 달라요)", () => {
    const set = new Set(data.grades.flat().map(m => m.w));
    expect(set.size).toBe(GRADES.length * STAGES + 1);
  });

  it("크기: 정사각형. 초보 5 → 10, 중급 10 → 15, 고급 15 → 20, 특급 20 → 25, 신 25 → 30, 우주 50", () => {
    const ends = [[5, 10], [10, 15], [15, 20], [20, 25], [25, 30]];
    ends.forEach(([a, b], g) => {
      expect(sizeOf(1, g)).toEqual({ cols: a, rows: a });
      expect(sizeOf(STAGES, g)).toEqual({ cols: b, rows: b });
      for (let s = 2; s <= STAGES; s++) expect(sizeOf(s, g).cols).toBeGreaterThanOrEqual(sizeOf(s - 1, g).cols);
    });
    expect(sizeOf(1, SPACE)).toEqual({ cols: 50, rows: 50 });
    expect(getMaze(SPACE, 1).cols).toBe(50);
  });
});
