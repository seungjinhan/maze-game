import { useEffect, useRef, useState } from "react";
import faceUrl from "../assets/face.jpg";
import { LockIcon } from "../components/LockIcon";
import { fmtTime } from "../lib/format";
import { GRADES, sizeOf, STAGES } from "../lib/maze";
import { clearedInGrade, indexOf, recordKey, stageOpen, type Progress, type Records } from "../lib/progress";

const PER_CHAPTER = 10;
const CHAPTERS = STAGES / PER_CHAPTER;

interface Props {
  grade: number;
  progress: Progress;
  records: Records;
  onPlay(stage: number): void;
}

/** 챕터(10단계)씩 스크롤로 이어서 보여줘요 */
export function StageSelect({ grade, progress, records, onPlay }: Props) {
  const g = GRADES[grade];
  const [shown, setShown] = useState(1);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) setShown(n => Math.min(CHAPTERS, n + 1));
    });
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <main className="screen stages">
      <header className="stages-head">
        <h1>
          <img className="avatar" src={faceUrl} alt="" />
          {g.name}
        </h1>
        <p>
          미로의 {Math.round(g.p * 100)}%가 보여요 · 깬 단계 {clearedInGrade(progress, grade)}/{STAGES}
        </p>
      </header>

      {Array.from({ length: shown }, (_, ch) => {
        const first = ch * PER_CHAPTER + 1, last = first + PER_CHAPTER - 1;
        const a = sizeOf(first, grade), b = sizeOf(last, grade);
        return (
          <section key={ch} className="chapter">
            <h2>
              {ch + 1}챕터 <small>{first}~{last}단계 · {a.cols}×{a.rows} → {b.cols}×{b.rows}칸</small>
            </h2>
            <ol className="stage-grid">
              {Array.from({ length: PER_CHAPTER }, (_, k) => {
                const stage = first + k;
                const open = stageOpen(progress, grade, stage);
                const best = records[recordKey(grade, stage)];
                const current = open && indexOf(grade, stage) === progress.earned;
                return (
                  <li key={stage}>
                    <button
                      className={`stage-tile${current ? " current" : ""}${best ? " cleared" : ""}`}
                      disabled={!open}
                      onClick={() => onPlay(stage)}
                      aria-label={`${stage}단계${open ? (best ? `, 최고 ${fmtTime(best.timeMs)}` : "") : ", 잠김"}`}
                    >
                      <span className="stage-no">{stage}</span>
                      <span className="stage-meta">{!open ? <LockIcon /> : best ? fmtTime(best.timeMs) : current ? "도전" : ""}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
      {shown < CHAPTERS && <div ref={sentinel} className="sentinel" aria-hidden="true" />}
    </main>
  );
}
