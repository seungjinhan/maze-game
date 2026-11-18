import { useEffect, useLayoutEffect, useRef, useState } from "react";
import characterUrl from "../assets/character.jpg";
import { FamilyFace } from "../components/FamilyFace";
import { MazeGame } from "../game/engine";
import { fmtTime } from "../lib/format";
import { getMaze } from "../lib/maps";
import { LEVELS, SPACE, STAGES, type Dir } from "../lib/maze";
import { FAMILY, SPACE_OPENED } from "../lib/story";
import type { Best } from "../lib/progress";
import type { View } from "../lib/view";

export interface ClearResult {
  timeMs: number;
  moves: number;
  best: Best;
  newBest: boolean;
  /** 새로 열린 단계가 있는지 */
  opened: boolean;
}

interface Props {
  grade: number;
  stage: number;
  onCleared(grade: number, stage: number, timeMs: number, moves: number): ClearResult;
  next: { label: string; go(): void } | null;
}

const KEYS: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
};
const SWIPE_PX = 24;

function viewText(p: number, v: View | null): string {
  if (!v) return "";
  if (v.floored) return `보이는 넓이 ${Math.round(p * 100)}% → 최소 3×3칸이라 실제 ${Math.round(v.actual * 100)}%`;
  return `보이는 넓이 ${Math.round(v.actual * 100)}% · 약 ${Math.round(v.seenCols)}×${Math.round(v.seenRows)}칸 보임`;
}

export function Game({ grade, stage, onCleared, next }: Props) {
  const g = LEVELS[grade];
  const isSpace = grade === SPACE;
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<MazeGame | null>(null);
  const clearedRef = useRef(onCleared);
  clearedRef.current = onCleared;
  const swipe = useRef<{ x: number; y: number; last: Dir | null } | null>(null);

  const [moves, setMoves] = useState(0);
  const [timeMs, setTimeMs] = useState(0);
  const [view, setView] = useState<View | null>(null);
  const [result, setResult] = useState<ClearResult | null>(null);

  // 우주 미로는 밤하늘 색으로 (미로를 만들기 전에 색을 바꿔야 캔버스가 새 색을 읽어요)
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("space", isSpace);
    return () => document.documentElement.classList.remove("space");
  }, [isSpace]);

  useEffect(() => {
    const box = boxRef.current!;
    const bump = () => {
      box.classList.remove("bump");
      void box.offsetWidth;
      box.classList.add("bump");
    };
    const game = new MazeGame(canvasRef.current!, getMaze(grade, stage), LEVELS[grade].p, {
      onStep: setMoves,
      onView: setView,
      onBump: bump,
      onFinish: (t, m) => {
        setTimeMs(t);
        setResult(clearedRef.current(grade, stage, t, m));
      },
    });
    gameRef.current = game;

    const fit = () => {
      const r = box.getBoundingClientRect();
      game.resize(r.width, r.height, window.devicePixelRatio || 1);
    };
    fit(); // 첫 크기는 바로 재요. 이후 바뀌면 다시 재요.
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    const onKey = (e: KeyboardEvent) => {
      const dir = KEYS[e.key];
      if (dir) {
        e.preventDefault();
        game.move(dir);
      }
    };
    const onVisibility = () => (document.hidden ? game.pause() : game.resume());
    const dark = matchMedia("(prefers-color-scheme: dark)");
    const onTheme = () => game.themeChanged();
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    dark.addEventListener("change", onTheme);
    const timer = window.setInterval(() => setTimeMs(game.elapsed()), 200);

    return () => {
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      dark.removeEventListener("change", onTheme);
      clearInterval(timer);
      game.destroy();
      gameRef.current = null;
    };
  }, [grade, stage]);

  const restart = () => {
    gameRef.current?.reset();
    setMoves(0);
    setTimeMs(0);
    setResult(null);
  };

  // 등급의 50단계 · 우주 미로를 깨면 가족 한 명을 구출해요
  const member = isSpace || stage === STAGES ? FAMILY[grade] : null;
  const headline = member ? `${member.object} 구출했어요!` : "도착!";
  const subline = member ? `“${member.line}”` : `${g.name} · ${stage}단계`;
  const title = isSpace ? "우주 · 엄마를 찾아서" : `${g.name} · ${stage}단계`;

  return (
    <main className="screen game">
      <div className="hud">
        <div className="hud-top">
          <h1 className="hud-title">{title}</h1>
          <div className="hud-stats">
            <span>{fmtTime(timeMs)}</span>
            <span>{moves}칸</span>
            <button className="ghost" onClick={restart}>다시 하기</button>
          </div>
        </div>
        {/* 한 줄 고정: 줄바꿈되면 미로 높이 ↔ 칸 수 글자가 서로 바뀌며 화면이 떨려요 */}
        <p className="hud-view">{viewText(g.p, view)}</p>
      </div>

      <div
        ref={boxRef}
        className="board"
        onPointerDown={e => {
          swipe.current = { x: e.clientX, y: e.clientY, last: null };
        }}
        onPointerMove={e => {
          const s = swipe.current;
          if (!s) return;
          const dx = e.clientX - s.x, dy = e.clientY - s.y;
          if (Math.hypot(dx, dy) < SWIPE_PX) return;
          const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
          s.x = e.clientX;
          s.y = e.clientY;
          if (dir === s.last) return; // 한 번 밀 때 같은 방향은 한 번만
          s.last = dir;
          gameRef.current?.move(dir);
        }}
        onPointerUp={() => (swipe.current = null)}
        onPointerCancel={() => (swipe.current = null)}
      >
        <canvas ref={canvasRef} />
        {result && (
          <div className="overlay">
            <div className="card" role="dialog" aria-labelledby="clear-title">
              {member ? (
                <div className="rescue-art" aria-hidden="true">
                  <img src={characterUrl} alt="" />
                  <FamilyFace id={member.id} size={84} />
                </div>
              ) : (
                <img className="card-art" src={characterUrl} alt="" />
              )}
              <h2 id="clear-title">{headline}</h2>
              <p>{subline}</p>
              {grade === SPACE - 1 && stage === STAGES && <p className="story-note">{SPACE_OPENED}</p>}
              <dl className="result">
                <div>
                  <dt>시간</dt>
                  <dd>{fmtTime(result.timeMs)}</dd>
                </div>
                <div>
                  <dt>이동</dt>
                  <dd>{result.moves}칸</dd>
                </div>
                <div>
                  <dt>최고 기록</dt>
                  <dd className={result.newBest ? "new-best" : undefined}>{result.newBest ? "새 기록" : fmtTime(result.best.timeMs)}</dd>
                </div>
              </dl>
              <div className="actions">
                <button className="secondary" onClick={restart}>다시 하기</button>
                {next && (
                  <button className="primary" onClick={next.go}>
                    {next.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="hint">밀면 모퉁이나 갈림길까지 곧게 가요 · 출발 왼쪽 위, 도착 오른쪽 아래</p>
    </main>
  );
}
