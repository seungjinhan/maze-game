import { describe, expect, it } from "vitest";
import { parseHash, toHash } from "./route";

describe("화면 주소", () => {
  it("주소 ↔ 화면", () => {
    for (const r of [{ name: "home" }, { name: "stages", grade: 2 }, { name: "play", grade: 4, stage: 50 }, { name: "space" }, { name: "ending" }] as const) {
      expect(parseHash(toHash(r))).toEqual(r);
    }
  });
  it("이상한 주소는 홈으로", () => {
    for (const h of ["", "#", "#/g/9", "#/g/5", "#/play/5/1", "#/play/0/0", "#/play/0/51", "#/play/1.5/2", "#/x", "#/space/1"]) {
      expect(parseHash(h)).toEqual({ name: "home" });
    }
  });
});
