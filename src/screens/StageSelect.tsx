import { useEffect, useRef, useState } from "react";
import faceUrl from "../assets/face.jpg";
import { LockIcon } from "../components/LockIcon";
import { useI18n } from "../i18n";
import { fmtTime } from "../lib/format";
import { GRADES, STAGES } from "../lib/maze";
import { clearedInGrade, indexOf, recordKey, stageOpen, type Progress, type Records } from "../lib/progress";

const PAGE = 10; // 스크롤하면 10단계씩 더 불러와요

interface Props {
  grade: number;
  progress: Progress;
  records: Records;
  onPlay(stage: number): void;
}

/** 단계 칸을 이어서 보여주고, 스크롤하면 10개씩 더 불러와요 */
export function StageSelect({ grade, progress, records, onPlay }: Props) {
  const g = GRADES[grade];
  const { t } = useI18n();
  const [shown, setShown] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) setShown(n => Math.min(STAGES, n + PAGE));
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

      <ol className="stage-grid">
        {Array.from({ length: shown }, (_, k) => {
          const stage = k + 1;
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
      {shown < STAGES && <div ref={sentinel} className="sentinel" aria-hidden="true" />}
    </main>
  );
}
