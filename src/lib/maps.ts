import data from "../data/maps.json";
import { decodeWalls, type Maze } from "./maze";

const cache = new Map<string, Maze>();

/** 미리 만든 미로 (grade 0~4, stage 1~50) */
export function getMaze(grade: number, stage: number): Maze {
  const key = `${grade}-${stage}`;
  let m = cache.get(key);
  if (!m) {
    const raw = data.grades[grade][stage - 1];
    m = { cols: raw.c, rows: raw.r, walls: decodeWalls(raw.w) };
    cache.set(key, m);
  }
  return m;
}
