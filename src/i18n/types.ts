import type { MemberId } from "../lib/story";

export type LangCode = "ko" | "en" | "ja" | "vi" | "zh-Hant" | "zh-Hans" | "th" | "es" | "id";

/** 화면 · 이야기 글자 전부. 언어마다 하나씩 채워요. */
export interface Dict {
  appName: string;
  langLabel: string;
  heroAlt: string;
  lead: string;
  storyAgain: string;
  adminChip: string;
  familyCount(n: number): string;
  endingAgain: string;
  /** 초보 · 중급 · 고급 · 특급 · 신 · 우주 */
  levels: readonly [string, string, string, string, string, string];
  members: Record<MemberId, string>;
  memberLines: Record<MemberId, string>;
  rescueGoal(m: MemberId): string;
  rescued(m: MemberId): string;
  goRescue(m: MemberId): string;
  visible(pct: number): string;
  lockedUntil(prevLevel: string): string;
  spaceSub: string;
  stagesSub(pct: number, cleared: number): string;
  chapterTitle(n: number): string;
  chapterRange(first: number, last: number, size: number): string;
  stageLabel(n: number): string;
  tryNow: string;
  locked: string;
  introTitle: string;
  introGo: string;
  close: string;
  intro: readonly string[];
  spaceOpened: string;
  ending: readonly string[];
  gameTitle(level: string, stage: number): string;
  spaceTitle: string;
  restart: string;
  cells(n: number): string;
  viewNormal(pct: number, cols: number, rows: number): string;
  viewFloored(pct: number, actual: number): string;
  hint: string;
  arrived: string;
  time: string;
  moves: string;
  bestRecord: string;
  newBest: string;
  nextStage: string;
  toSpace: string;
  meetFamily: string;
  endingTitle: string;
  me: string;
  theEnd: string;
  toHome: string;
  admin: {
    title: string;
    desc: string;
    placeholder: string;
    cancel: string;
    open: string;
    wrong: string;
    unsupported: string;
    onTitle: string;
    onDesc: string;
    relock: string;
  };
}
