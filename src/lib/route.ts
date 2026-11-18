import { GRADES, STAGES } from "./maze";

// 화면 주소는 #으로 해요: #/ 홈, #/g/2 고급 단계 선택, #/play/2/14 고급 14단계, #/space 우주 미로, #/ending 엔딩.
// 뒤로 가기는 브라우저(토스에서는 내비게이션 바)가 맡아요. 화면에 뒤로 가기 버튼은 두지 않아요.
export type Route =
  | { name: "home" }
  | { name: "stages"; grade: number }
  | { name: "play"; grade: number; stage: number }
  | { name: "space" }
  | { name: "ending" };

const gradeOk = (g: number) => Number.isInteger(g) && g >= 0 && g < GRADES.length;
const stageOk = (s: number) => Number.isInteger(s) && s >= 1 && s <= STAGES;

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "g" && parts.length === 2 && gradeOk(Number(parts[1]))) return { name: "stages", grade: Number(parts[1]) };
  if (parts[0] === "play" && parts.length === 3) {
    const grade = Number(parts[1]), stage = Number(parts[2]);
    if (gradeOk(grade) && stageOk(stage)) return { name: "play", grade, stage };
  }
  if (parts.length === 1 && parts[0] === "space") return { name: "space" };
  if (parts.length === 1 && parts[0] === "ending") return { name: "ending" };
  return { name: "home" };
}

export function toHash(r: Route): string {
  if (r.name === "stages") return `#/g/${r.grade}`;
  if (r.name === "play") return `#/play/${r.grade}/${r.stage}`;
  if (r.name === "space") return "#/space";
  if (r.name === "ending") return "#/ending";
  return "#/";
}
