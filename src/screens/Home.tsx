import { useCallback, useRef, useState } from "react";
import characterUrl from "../assets/character.jpg";
import { AdminDialog } from "../components/AdminDialog";
import { LockIcon } from "../components/LockIcon";
import { GRADES, STAGES } from "../lib/maze";
import { clearedInGrade, gradeOpen, type Progress } from "../lib/progress";

const LONG_PRESS_MS = 1200;

interface Props {
  progress: Progress;
  onOpenGrade(grade: number): void;
  onProgress(p: Progress): void;
}

export function Home({ progress, onOpenGrade, onProgress }: Props) {
  const [adminOpen, setAdminOpen] = useState(false);
  const pressTimer = useRef(0);
  const startPress = () => {
    pressTimer.current = window.setTimeout(() => setAdminOpen(true), LONG_PRESS_MS);
  };
  const endPress = () => clearTimeout(pressTimer.current);
  const closeAdmin = useCallback(() => setAdminOpen(false), []);

  return (
    <main className="screen home">
      <header className="home-head">
        <img className="hero-art" src={characterUrl} alt="헤드폰을 쓰고 기타를 치는 검은 고양이 캐릭터" />
        {/* 제목을 길게 누르면 관리자 창이 열려요 (테스트용, 화면에는 표시하지 않아요) */}
        <h1
          className="home-title"
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
          onContextMenu={e => e.preventDefault()}
        >
          미로찾기
        </h1>
        <p className="home-lead">등급이 오를수록 화면에 보이는 미로가 좁아져요. 한 등급의 50단계를 모두 깨면 다음 등급이 열려요.</p>
        {progress.admin && <span className="admin-chip">관리자 · 모두 열림</span>}
      </header>

      <ol className="grade-list">
        {GRADES.map((g, i) => {
          const open = gradeOpen(progress, i);
          const cleared = clearedInGrade(progress, i);
          const side = Math.sqrt(g.p) * 100;
          return (
            <li key={g.name}>
              <button
                className="grade-card"
                disabled={!open}
                onClick={() => onOpenGrade(i)}
                aria-label={`${g.name}, 미로의 ${Math.round(g.p * 100)}% 보임, ${open ? `${cleared}/${STAGES}단계` : "잠김"}`}
              >
                <span className="grade-viz" aria-hidden="true">
                  <span style={{ width: `${side}%`, height: `${side}%` }} />
                </span>
                <span className="grade-text">
                  <span className="grade-name">
                    {!open && <LockIcon />}
                    {g.name}
                  </span>
                  <span className="grade-sub">
                    {open ? `미로의 ${Math.round(g.p * 100)}%가 보여요` : `${GRADES[i - 1].name} 50단계를 깨면 열려요`}
                  </span>
                </span>
                <span className="grade-count">
                  {cleared}
                  <small>/{STAGES}</small>
                </span>
                <span className="grade-bar" aria-hidden="true">
                  <span style={{ width: `${(cleared / STAGES) * 100}%` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {adminOpen && <AdminDialog progress={progress} onProgress={onProgress} onClose={closeAdmin} />}
    </main>
  );
}
