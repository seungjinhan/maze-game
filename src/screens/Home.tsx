import { useCallback, useRef, useState } from "react";
import characterUrl from "../assets/character.jpg";
import { AdminDialog } from "../components/AdminDialog";
import { FamilyFace } from "../components/FamilyFace";
import { LockIcon } from "../components/LockIcon";
import { StoryDialog } from "../components/StoryDialog";
import { GRADES, LEVELS, SPACE, STAGES } from "../lib/maze";
import {
  clearedInGrade, FINAL, gradeOpen, introSeen, markIntroSeen, rescued, type Progress,
} from "../lib/progress";
import { FAMILY, INTRO, memberById, PHOTO_ORDER } from "../lib/story";

const LONG_PRESS_MS = 1200;

interface Props {
  progress: Progress;
  onOpenGrade(grade: number): void;
  onOpenSpace(): void;
  onOpenEnding(): void;
  onProgress(p: Progress): void;
}

export function Home({ progress, onOpenGrade, onOpenSpace, onOpenEnding, onProgress }: Props) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(() => !introSeen());
  const pressTimer = useRef(0);
  const startPress = () => {
    pressTimer.current = window.setTimeout(() => setAdminOpen(true), LONG_PRESS_MS);
  };
  const endPress = () => clearTimeout(pressTimer.current);
  const closeAdmin = useCallback(() => setAdminOpen(false), []);
  const closeStory = useCallback(() => {
    markIntroSeen();
    setStoryOpen(false);
  }, []);

  const levelOf = (id: string) => FAMILY.findIndex(m => m.id === id);
  const savedCount = FAMILY.filter((_, i) => rescued(progress, i)).length;
  const allHome = progress.earned > FINAL;

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
        <p className="home-lead">
          미로에 갇힌 가족 여섯을 구해요. 등급이 오를수록 화면에 보이는 미로가 좁아져요.{" "}
          <button className="link" onClick={() => setStoryOpen(true)}>이야기 다시 보기</button>
        </p>
        {progress.admin && <span className="admin-chip">관리자 · 모두 열림</span>}
      </header>

      <section className="family" aria-label={`구출한 가족 ${savedCount}/6`}>
        <ol className="family-row">
          {PHOTO_ORDER.map(id => {
            const saved = rescued(progress, levelOf(id));
            return (
              <li key={id}>
                <FamilyFace id={id} rescued={saved} size={44} />
                <span className={saved ? "" : "dim"}>{memberById(id).name}</span>
              </li>
            );
          })}
        </ol>
        <p className="family-count">
          구출한 가족 <b>{savedCount}</b>/6
        </p>
        {allHome && (
          <button className="ending-link" onClick={onOpenEnding}>
            온 가족이 다시 만났어요 · 엔딩 다시 보기
          </button>
        )}
      </section>

      <ol className="grade-list">
        {GRADES.map((g, i) => {
          const open = gradeOpen(progress, i);
          const cleared = clearedInGrade(progress, i);
          const side = Math.sqrt(g.p) * 100;
          const member = FAMILY[i];
          return (
            <li key={g.name}>
              <button
                className="grade-card"
                disabled={!open}
                onClick={() => onOpenGrade(i)}
                aria-label={`${g.name}, ${member.object} 구해요, ${open ? `${cleared}/${STAGES}단계` : "잠김"}`}
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
                    {open
                      ? `${member.object} 구해요 · ${Math.round(g.p * 100)}% 보여요`
                      : `${GRADES[i - 1].name} 50단계를 깨면 열려요`}
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
        {gradeOpen(progress, SPACE) && (
          <li>
            <button className="grade-card space-card" onClick={onOpenSpace} aria-label="우주, 엄마를 구해요">
              <span className="grade-viz" aria-hidden="true">
                <span style={{ width: `${Math.sqrt(LEVELS[SPACE].p) * 100}%`, height: `${Math.sqrt(LEVELS[SPACE].p) * 100}%` }} />
              </span>
              <span className="grade-text">
                <span className="grade-name">우주</span>
                <span className="grade-sub">숨어 있던 별빛 미로 · 엄마를 구해요</span>
              </span>
              <span className="grade-count">
                {rescued(progress, SPACE) ? 1 : 0}
                <small>/1</small>
              </span>
            </button>
          </li>
        )}
      </ol>

      {storyOpen && <StoryDialog title="가족을 구하러 가요" lines={INTRO} action={savedCount ? "닫기" : "구하러 가기"} onClose={closeStory} />}
      {adminOpen && <AdminDialog progress={progress} onProgress={onProgress} onClose={closeAdmin} />}
    </main>
  );
}
