// 미로 250개(5등급 × 50단계)를 만들어 src/data/maps.json에 저장해요.
// 고정 시드라 몇 번을 돌려도 같은 미로가 나와요. 실행: npm run maps
import { writeFileSync } from "node:fs";
import { buildAllMazes, encodeWalls, solve } from "../src/lib/maze.ts";

const all = buildAllMazes();
const data = {
  version: 1,
  grades: all.map(list => list.map(m => ({ c: m.cols, r: m.rows, w: encodeWalls(m.walls) }))),
};

for (const [g, list] of all.entries()) {
  for (const [i, m] of list.entries()) {
    const { reached } = solve(m);
    if (reached !== m.cols * m.rows) throw new Error(`등급 ${g} ${i + 1}단계: 이어지지 않은 칸이 있어요`);
  }
}

const out = new URL("../src/data/maps.json", import.meta.url);
writeFileSync(out, JSON.stringify(data) + "\n");
console.log(`미로 ${all.flat().length}개를 저장했어요: src/data/maps.json`);
