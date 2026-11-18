import { describe, expect, it } from "vitest";
import data from "../data/maps.json";
import { getMaze } from "./maps";
import { buildAllMazes, encodeWalls, GRADES, N, S, E, W, sizeOf, solve, STAGES } from "./maze";

describe("미로 250개", () => {
  it("maps.json이 생성기 결과와 같아요 (고정 시드)", () => {
    const all = buildAllMazes();
    all.forEach((list, g) => list.forEach((m, i) => expect(data.grades[g][i].w).toBe(encodeWalls(m.walls))));
  });

  it("크기 규칙, 모든 칸 연결, 바깥 벽, 정답 길이 순서", () => {
    for (let g = 0; g < GRADES.length; g++) {
      for (let s = 1; s <= STAGES; s++) {
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
    expect(set.size).toBe(GRADES.length * STAGES);
  });

  it("크기: 초보 7×9 → 18×24, 나머지 11×15 → 29×39, 단계마다 줄지 않아요", () => {
    for (let g = 0; g < GRADES.length; g++) {
      for (let s = 2; s <= STAGES; s++) expect(sizeOf(s, g).cols).toBeGreaterThanOrEqual(sizeOf(s - 1, g).cols);
    }
    expect(sizeOf(1, 0)).toEqual({ cols: 7, rows: 9 });
    expect(sizeOf(50, 0)).toEqual({ cols: 18, rows: 24 });
    expect(sizeOf(1, 1)).toEqual({ cols: 11, rows: 15 });
    expect(sizeOf(50, 4)).toEqual({ cols: 29, rows: 39 });
  });
});
