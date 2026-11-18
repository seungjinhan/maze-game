import { useCallback, useEffect, useState } from "react";
import { GRADES, SPACE, STAGES } from "./lib/maze";
import {
  afterClear,
  endingOpen,
  gradeOpen,
  isBetter,
  loadProgress,
  loadRecords,
  recordKey,
  saveProgress,
  saveRecords,
  stageOpen,
  type Progress,
  type Records,
} from "./lib/progress";
import { parseHash, toHash, type Route } from "./lib/route";
import { useI18n } from "./i18n";
import { FAMILY } from "./lib/story";
import { Ending } from "./screens/Ending";
import { Game, type ClearResult } from "./screens/Game";
import { Home } from "./screens/Home";
import { StageSelect } from "./screens/StageSelect";

export default function App() {
  const { t } = useI18n();
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [records, setRecords] = useState<Records>(loadRecords);

  useEffect(() => {
    const onHash = () => setRoute(parseHash(location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((r: Route, replace = false) => {
    if (replace) location.replace(toHash(r));
    else location.hash = toHash(r);
    setRoute(r);
  }, []);

  const updateProgress = useCallback((p: Progress) => {
    setProgress(p);
    saveProgress(p);
  }, []);

  // 잠긴 곳 주소로 들어오면 홈으로 보내요
  const allowed =
    route.name === "home" ||
    (route.name === "stages" && gradeOpen(progress, route.grade)) ||
    (route.name === "play" && stageOpen(progress, route.grade, route.stage)) ||
    (route.name === "space" && stageOpen(progress, SPACE, 1)) ||
    (route.name === "ending" && endingOpen(progress));
  useEffect(() => {
    if (!allowed) go({ name: "home" }, true);
  }, [allowed, go]);
  if (!allowed) return null;

  const onCleared = (grade: number, stage: number, timeMs: number, moves: number): ClearResult => {
    const { progress: nextProgress, opened } = afterClear(progress, grade, stage);
    if (nextProgress !== progress) updateProgress(nextProgress);
    const key = recordKey(grade, stage);
    const now = { timeMs, moves };
    const newBest = isBetter(now, records[key]);
    if (newBest) {
      const r = { ...records, [key]: now };
      setRecords(r);
      saveRecords(r);
    }
    return { timeMs, moves, best: newBest ? now : records[key], newBest, opened };
  };

  if (route.name === "stages") {
    return (
      <StageSelect
        grade={route.grade}
        progress={progress}
        records={records}
        onPlay={stage => go({ name: "play", grade: route.grade, stage })}
      />
    );
  }

  if (route.name === "ending") return <Ending onHome={() => go({ name: "home" }, true)} />;

  if (route.name === "space") {
    const next = endingOpen(progress) ? { label: t.meetFamily, go: () => go({ name: "ending" }, true) } : null;
    return <Game key="space" grade={SPACE} stage={1} onCleared={onCleared} next={next} />;
  }

  if (route.name === "play") {
    const { grade, stage } = route;
    // 다음: 같은 등급 다음 단계 → 다음 등급 1단계 → (신 50단계 다음) 우주. 다음 판은 뒤로 가기 기록을 쌓지 않아요.
    let next: { label: string; go(): void } | null = null;
    if (stage < STAGES) {
      if (stageOpen(progress, grade, stage + 1)) next = { label: t.nextStage, go: () => go({ name: "play", grade, stage: stage + 1 }, true) };
    } else if (grade < GRADES.length - 1) {
      if (stageOpen(progress, grade + 1, 1)) {
        next = { label: t.goRescue(FAMILY[grade + 1]), go: () => go({ name: "play", grade: grade + 1, stage: 1 }, true) };
      }
    } else if (stageOpen(progress, SPACE, 1)) {
      next = { label: t.toSpace, go: () => go({ name: "space" }, true) };
    }
    return <Game key={`${grade}-${stage}`} grade={grade} stage={stage} onCleared={onCleared} next={next} />;
  }

  return (
    <Home
      progress={progress}
      onOpenGrade={grade => go({ name: "stages", grade })}
      onOpenSpace={() => go({ name: "space" })}
      onOpenEnding={() => go({ name: "ending" })}
      onProgress={updateProgress}
    />
  );
}
