import { describe, expect, it } from "vitest";
import { GRADES, sizeOf, STAGES } from "./maze";
import { camAxis, MIN_VIEW, viewFor } from "./view";

describe("시야", () => {
  for (const [w, h] of [[343, 560], [358, 640], [398, 700], [448, 520]]) {
    it(`${w}×${h}: 보이는 넓이 = p, 아니면 최소 3×3칸`, () => {
      for (const g of GRADES) {
        for (let s = 1; s <= STAGES; s++) {
          const { cols, rows } = sizeOf(s);
          const v = viewFor(w, h, cols, rows, g.p);
          if (v.floored) {
            expect(Math.min(v.seenCols, v.seenRows)).toBeGreaterThanOrEqual(MIN_VIEW - 1e-9);
            expect(v.actual).toBeGreaterThan(g.p);
          } else {
            expect(v.actual).toBeCloseTo(g.p, 6);
          }
        }
      }
    });
  }

  it("초보는 미로 전체가 보여요", () => {
    const v = viewFor(343, 560, 29, 39, 1);
    expect(v.seenCols).toBeCloseTo(29);
    expect(v.seenRows).toBeCloseTo(39);
  });

  it("카메라는 가장자리에서 멈추고, 미로가 작으면 가운데 정렬", () => {
    expect(camAxis(0.5, 10, 30)).toBe(0);
    expect(camAxis(29.5, 10, 30)).toBe(20);
    expect(camAxis(15, 10, 30)).toBe(10);
    expect(camAxis(3, 12, 10)).toBe(-1);
  });
});
