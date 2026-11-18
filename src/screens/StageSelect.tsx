import { useEffect, useRef, useState } from "react";
import faceUrl from "../assets/face.jpg";
import { LockIcon } from "../components/LockIcon";
import { useI18n } from "../i18n";
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
  const { t } = useI18n();
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
          {t.levels[grade]}
        </h1>
        <p>{t.stagesSub(Math.round(g.p * 100), clearedInGrade(progress, grade))}</p>
      </header>

      {Array.from({ length: shown }, (_, ch) => {
        const first = ch * PER_CHAPTER + 1, last = first + PER_CHAPTER - 1;
        const size = sizeOf(first, grade).cols;
        return (
          <section key={ch} className="chapter">
            <h2>
              {t.chapterTitle(ch + 1)} <small>{t.chapterRange(first, last, size)}</small>
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
                      aria-label={`${t.stageLabel(stage)}${open ? (best ? `, ${t.bestRecord} ${fmtTime(best.timeMs)}` : "") : `, ${t.locked}`}`}
                    >
                      <span className="stage-no">{stage}</span>
                      <span className="stage-meta">{!open ? <LockIcon /> : best ? fmtTime(best.timeMs) : current ? t.tryNow : ""}</span>
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
