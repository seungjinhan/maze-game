import { describe, expect, it } from "vitest";
import { checkAdminPassword } from "./admin";
import {
  afterClear, clearedInGrade, gradeOpen, isBetter, LAST, lastOpenStage, stageOpen, type Progress,
} from "./progress";

const p = (earned: number, admin = false): Progress => ({ earned, admin });

describe("진행 · 잠금", () => {
  it("처음엔 초보 1단계만 열려요", () => {
    expect(gradeOpen(p(0), 0)).toBe(true);
    expect(gradeOpen(p(0), 1)).toBe(false);
    expect(stageOpen(p(0), 0, 2)).toBe(false);
    expect(lastOpenStage(p(0), 0)).toBe(1);
  });

  it("현재 단계를 깨야 다음이 열려요. 다시 깨면 그대로예요", () => {
    const a = afterClear(p(0), 0, 1);
    expect(a).toEqual({ progress: p(1), opened: true });
    expect(afterClear(p(5), 0, 3)).toEqual({ progress: p(5), opened: false });
  });

  it("초보 50단계를 깨면 중급이 열려요", () => {
    const a = afterClear(p(49), 0, 50);
    expect(a.opened).toBe(true);
    expect(gradeOpen(a.progress, 1)).toBe(true);
    expect(clearedInGrade(a.progress, 0)).toBe(50);
    expect(clearedInGrade(a.progress, 1)).toBe(0);
  });

  it("신 50단계까지 깨면 신도 50/50이에요", () => {
    const a = afterClear(p(LAST), 4, 50);
    expect(a).toEqual({ progress: p(LAST + 1), opened: false });
    expect(clearedInGrade(a.progress, 4)).toBe(50);
    expect(stageOpen(a.progress, 4, 50)).toBe(true);
  });

  it("관리자는 모두 열지만, 앞질러 깬 단계는 진행에 안 쳐요", () => {
    expect(gradeOpen(p(0, true), 4)).toBe(true);
    expect(lastOpenStage(p(0, true), 4)).toBe(50);
    expect(afterClear(p(3, true), 4, 50).progress).toEqual(p(3, true));
    expect(afterClear(p(3, true), 0, 4).progress).toEqual(p(4, true));
  });

  it("최고 기록: 시간이 짧거나, 같으면 이동이 적은 쪽", () => {
    expect(isBetter({ timeMs: 9000, moves: 40 }, undefined)).toBe(true);
    expect(isBetter({ timeMs: 9000, moves: 40 }, { timeMs: 10000, moves: 30 })).toBe(true);
    expect(isBetter({ timeMs: 9000, moves: 40 }, { timeMs: 9000, moves: 30 })).toBe(false);
  });

  it("틀린 관리자 비밀번호는 거부해요", async () => {
    expect(await checkAdminPassword("not-the-password")).toBe("wrong");
  });
});
