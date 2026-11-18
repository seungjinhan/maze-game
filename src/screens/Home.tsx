import { useCallback, useRef, useState } from "react";
import characterUrl from "../assets/character.jpg";
import { AdminDialog } from "../components/AdminDialog";
import { FamilyFace } from "../components/FamilyFace";
import { LockIcon } from "../components/LockIcon";
import { StoryDialog } from "../components/StoryDialog";
import { LANGS, useI18n, type LangCode } from "../i18n";
import { GRADES, LEVELS, SPACE, STAGES } from "../lib/maze";
import {
  clearedInGrade, FINAL, gradeOpen, introSeen, markIntroSeen, rescued, type Progress,
} from "../lib/progress";
import { FAMILY, PHOTO_ORDER } from "../lib/story";

const LONG_PRESS_MS = 1200;

function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 10h16M10 2c2.5 2.5 2.5 13.5 0 16M10 2c-2.5 2.5-2.5 13.5 0 16" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

interface Props {
  progress: Progress;
  onOpenGrade(grade: number): void;
  onOpenSpace(): void;
  onOpenEnding(): void;
  onProgress(p: Progress): void;
}

export function Home({ progress, onOpenGrade, onOpenSpace, onOpenEnding, onProgress }: Props) {
  const { t, lang, setLang } = useI18n();
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

  const levelOf = (id: (typeof FAMILY)[number]) => FAMILY.indexOf(id);
  const savedCount = FAMILY.filter((_, i) => rescued(progress, i)).length;
  const allHome = progress.earned > FINAL;

  return (
    <main className="screen home">
      <header className="home-head">
        <label className="lang-pick">
          <GlobeIcon />
          <span className="sr-only">{t.langLabel}</span>
          <select id="lang" value={lang} onChange={e => setLang(e.target.value as LangCode)} aria-label={t.langLabel}>
            {LANGS.map(l => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <img className="hero-art" src={characterUrl} alt={t.heroAlt} />
        {/* 제목을 길게 누르면 관리자 창이 열려요 (테스트용, 화면에는 표시하지 않아요) */}
        <h1
          className="home-title"
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
          onContextMenu={e => e.preventDefault()}
        >
          {t.appName}
        </h1>
        <p className="home-lead">
          {t.lead}{" "}
          <button className="link" onClick={() => setStoryOpen(true)}>{t.storyAgain}</button>
        </p>
        {progress.admin && <span className="admin-chip">{t.adminChip}</span>}
      </header>

      <section className="family" aria-label={t.familyCount(savedCount)}>
        <ol className="family-row">
          {PHOTO_ORDER.map(id => {
            const saved = rescued(progress, levelOf(id));
            return (
              <li key={id}>
                <FamilyFace id={id} rescued={saved} size={44} />
                <span className={saved ? "" : "dim"}>{t.members[id]}</span>
              </li>
            );
          })}
        </ol>
        <p className="family-count">{t.familyCount(savedCount)}</p>
        {allHome && (
          <button className="ending-link" onClick={onOpenEnding}>
            {t.endingAgain}
          </button>
        )}
      </section>

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
                aria-label={`${t.levels[i]}, ${t.rescueGoal(FAMILY[i])}, ${open ? `${cleared}/${STAGES}` : t.locked}`}
              >
                <span className="grade-viz" aria-hidden="true">
                  <span style={{ width: `${side}%`, height: `${side}%` }} />
                </span>
                <span className="grade-text">
                  <span className="grade-name">
                    {!open && <LockIcon />}
                    {t.levels[i]}
                  </span>
                  <span className="grade-sub">
                    {open ? `${t.rescueGoal(FAMILY[i])} · ${t.visible(Math.round(g.p * 100))}` : t.lockedUntil(t.levels[i - 1])}
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
            <button className="grade-card space-card" onClick={onOpenSpace} aria-label={`${t.levels[SPACE]}, ${t.spaceSub}`}>
              <span className="grade-viz" aria-hidden="true">
                <span style={{ width: `${Math.sqrt(LEVELS[SPACE].p) * 100}%`, height: `${Math.sqrt(LEVELS[SPACE].p) * 100}%` }} />
              </span>
              <span className="grade-text">
                <span className="grade-name">{t.levels[SPACE]}</span>
                <span className="grade-sub">{t.spaceSub}</span>
              </span>
              <span className="grade-count">
                {rescued(progress, SPACE) ? 1 : 0}
                <small>/1</small>
              </span>
            </button>
          </li>
        )}
      </ol>

      {storyOpen && <StoryDialog title={t.introTitle} lines={t.intro} action={savedCount ? t.close : t.introGo} onClose={closeStory} />}
      {adminOpen && <AdminDialog progress={progress} onProgress={onProgress} onClose={closeAdmin} />}
    </main>
  );
}
