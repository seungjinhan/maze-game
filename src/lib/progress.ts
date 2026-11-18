import { GRADES, SPACE, STAGES } from "./maze";

// 진행: 초보 1~50 → 중급 1~50 → … → 신 50 → 우주. 위치 번호 = 등급 × 50 + (단계 − 1), 우주 = FINAL
export const FINAL = GRADES.length * STAGES;

export interface Progress {
  /** 직접 깨서 연 가장 먼 위치. 우주까지 깨면 FINAL + 1 (엔딩) */
  earned: number;
  /** 관리자 잠금 풀기 (테스트용) */
  admin: boolean;
}

export const indexOf = (level: number, stage: number) => (level === SPACE ? FINAL : level * STAGES + (stage - 1));
export const openUpTo = (p: Progress) => (p.admin ? FINAL : Math.min(p.earned, FINAL));
export const gradeOpen = (p: Progress, level: number) => openUpTo(p) >= level * STAGES;
export const stageOpen = (p: Progress, level: number, stage: number) => indexOf(level, stage) <= openUpTo(p);
export const lastOpenStage = (p: Progress, level: number) =>
  level === SPACE ? 1 : Math.min(STAGES, openUpTo(p) - level * STAGES + 1);
/** 그 등급에서 직접 깬 단계 수 */
export const clearedInGrade = (p: Progress, grade: number) => Math.max(0, Math.min(STAGES, p.earned - grade * STAGES));
/** 가족 구출: 등급 g의 50단계를 깨면 g번째 가족, 우주를 깨면 엄마 */
export const rescued = (p: Progress, level: number) => (level === SPACE ? p.earned > FINAL : clearedInGrade(p, level) === STAGES);
export const endingOpen = (p: Progress) => p.admin || p.earned > FINAL;

/**
 * 깼을 때: 지금 깬 곳이 직접 연 가장 먼 위치면 진행이 하나 늘어요. 관리자로 앞질러 깬 단계는 진행에 안 쳐요.
 * opened = 새로 열린 곳이 있는지 (우주를 깨면 엔딩이 열리지만 단계는 아니에요)
 */
export function afterClear(p: Progress, level: number, stage: number): { progress: Progress; opened: boolean } {
  const i = indexOf(level, stage);
  if (i !== p.earned) return { progress: p, opened: false };
  return { progress: { ...p, earned: i + 1 }, opened: i < FINAL };
}

export interface Best {
  timeMs: number;
  moves: number;
}
export type Records = Record<string, Best>;
export const recordKey = (grade: number, stage: number) => `${grade}-${stage}`;

/** 시간이 짧으면 새 기록. 시간이 같으면 이동 칸 수가 적은 쪽 */
export function isBetter(next: Best, prev: Best | undefined): boolean {
  if (!prev) return true;
  return next.timeMs < prev.timeMs || (next.timeMs === prev.timeMs && next.moves < prev.moves);
}

// ── 기기 저장 ──────────────────────────────────────
const PROGRESS_KEY = "maze-game.progress";
const RECORDS_KEY = "maze-game.records";
const INTRO_KEY = "maze-game.intro-seen";

export function loadProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "null");
    if (raw && Number.isInteger(raw.earned)) {
      return { earned: Math.min(FINAL + 1, Math.max(0, raw.earned)), admin: raw.admin === true };
    }
  } catch {
    /* 저장소를 못 쓰면 처음부터 */
  }
  return { earned: 0, admin: false };
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* 무시 */
  }
}

export function loadRecords(): Records {
  try {
    const raw = JSON.parse(localStorage.getItem(RECORDS_KEY) ?? "null");
    if (raw && typeof raw === "object") return raw as Records;
  } catch {
    /* 무시 */
  }
  return {};
}

export function saveRecords(r: Records): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(r));
  } catch {
    /* 무시 */
  }
}

export function introSeen(): boolean {
  try {
    return localStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return true;
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* 무시 */
  }
}
