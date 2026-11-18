import { describe, expect, it } from "vitest";
import { FAMILY } from "../lib/story";
import { DICTS, LANGS, pickLang } from "./index";

describe("언어 9개", () => {
  it("목록과 글자 묶음이 같아요", () => {
    expect(LANGS.map(l => l.code).sort()).toEqual(Object.keys(DICTS).sort());
    expect(LANGS).toHaveLength(9);
  });

  for (const { code } of LANGS) {
    it(`${code}: 빈 글자가 없어요`, () => {
      const t = DICTS[code];
      const texts = [
        t.appName, t.langLabel, t.heroAlt, t.lead, t.storyAgain, t.adminChip, t.endingAgain, t.spaceSub, t.tryNow, t.locked,
        t.introTitle, t.introGo, t.close, t.spaceOpened, t.spaceTitle, t.restart, t.hint, t.arrived, t.time, t.moves,
        t.bestRecord, t.newBest, t.nextStage, t.toSpace, t.meetFamily, t.endingTitle, t.me, t.theEnd, t.toHome,
        ...Object.values(t.admin), ...t.levels, ...t.intro, ...t.ending,
        t.familyCount(3), t.visible(50), t.lockedUntil(t.levels[0]), t.stagesSub(30, 7), t.stageLabel(4), t.gameTitle(t.levels[1], 9), t.cells(12),
        t.viewNormal(5, 6, 9), t.viewFloored(5, 12),
        ...FAMILY.flatMap(m => [t.members[m], t.memberLines[m], t.rescueGoal(m), t.rescued(m), t.goRescue(m)]),
      ];
      for (const s of texts) expect(s.trim().length).toBeGreaterThan(0);
      expect(t.levels).toHaveLength(6);
      expect(t.intro).toHaveLength(3);
      expect(t.ending).toHaveLength(4);
      expect(t.visible(37)).toContain("37");
      expect(t.familyCount(4)).toContain("4");
    });
  }

  it("기기 언어로 고르고, 없으면 영어", () => {
    expect(pickLang(["ko-KR"])).toBe("ko");
    expect(pickLang(["ja-JP", "en"])).toBe("ja");
    expect(pickLang(["zh-TW"])).toBe("zh-Hant");
    expect(pickLang(["zh-Hant-HK"])).toBe("zh-Hant");
    expect(pickLang(["zh-CN"])).toBe("zh-Hans");
    expect(pickLang(["zh"])).toBe("zh-Hans");
    expect(pickLang(["in-ID"])).toBe("id");
    expect(pickLang(["id"])).toBe("id");
    expect(pickLang(["th-TH"])).toBe("th");
    expect(pickLang(["es-MX"])).toBe("es");
    expect(pickLang(["vi"])).toBe("vi");
    expect(pickLang(["fr-FR", "de"])).toBe("en");
    expect(pickLang(["fr-FR", "vi-VN"])).toBe("vi");
    expect(pickLang([])).toBe("en");
  });
});
