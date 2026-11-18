import { GRADES, STAGES } from "./maze";

// 진행: 초보 1~50 → 중급 1~50 → … → 신 50. 위치 번호 = 등급 × 50 + (단계 − 1)
export const LAST = GRADES.length * STAGES - 1;

export interface Progress {
  /** 직접 깨서 연 가장 먼 위치. 신 50단계까지 다 깨면 LAST + 1 */
  earned: number;
  /** 관리자 잠금 풀기 (테스트용) */
  admin: boolean;
}

export const indexOf = (grade: number, stage: number) => grade * STAGES + (stage - 1);
export const openUpTo = (p: Progress) => (p.admin ? LAST : Math.min(p.earned, LAST));
export const gradeOpen = (p: Progress, grade: number) => openUpTo(p) >= grade * STAGES;
export const stageOpen = (p: Progress, grade: number, stage: number) => indexOf(grade, stage) <= openUpTo(p);
export const lastOpenStage = (p: Progress, grade: number) => Math.min(STAGES, openUpTo(p) - grade * STAGES + 1);
/** 그 등급에서 직접 깬 단계 수 */
export const clearedInGrade = (p: Progress, grade: number) => Math.max(0, Math.min(STAGES, p.earned - grade * STAGES));

/**
 * 깼을 때: 지금 깬 곳이 직접 연 가장 먼 위치면 진행이 하나 늘어요. 관리자로 앞질러 깬 단계는 진행에 안 쳐요.
 * opened = 새로 열린 단계가 있는지 (신 50단계는 다음이 없어요)
 */
export function afterClear(p: Progress, grade: number, stage: number): { progress: Progress; opened: boolean } {
  const i = indexOf(grade, stage);
  if (i !== p.earned) return { progress: p, opened: false };
  return { progress: { ...p, earned: i + 1 }, opened: i < LAST };
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

export function loadProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "null");
    if (raw && Number.isInteger(raw.earned)) {
      return { earned: Math.min(LAST + 1, Math.max(0, raw.earned)), admin: raw.admin === true };
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
