import { canGo, DIR_LIST, DIRS, type Dir, type Maze } from "./maze";

/**
 * 직선 자동 이동: dir 방향으로 (x, y)에 막 도착했을 때 계속 갈지.
 * 앞이 열려 있고 옆길이 없을 때만 계속 가요. 벽 · 모퉁이 · 갈림길에서 멈춰요.
 */
export function continueStraight(m: Maze, x: number, y: number, dir: Dir): boolean {
  if (!canGo(m, x, y, dir)) return false;
  return !DIR_LIST.some(d => d !== dir && d !== DIRS[dir].back && canGo(m, x, y, d));
}
