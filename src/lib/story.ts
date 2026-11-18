// 가족 구출 이야기. 주인공은 헤드폰을 쓰고 기타를 메는 검은 고양이예요 (형 · 누나가 있고 동생이 둘인 둘째).

export type MemberId = "brother" | "sister" | "littleBrother" | "littleSister" | "dad" | "mom";

export interface Member {
  id: MemberId;
  name: string;
  /** "형을" · "누나를"처럼 조사를 붙인 이름 */
  object: string;
  /** 구출했을 때 하는 말 */
  line: string;
}

/** 단계 묶음 순서대로: 초보 → 형, 중급 → 누나, 고급 → 남동생, 특급 → 여동생, 신 → 아빠, 우주 → 엄마 */
export const FAMILY: readonly Member[] = [
  { id: "brother", name: "형", object: "형을", line: "왔구나! 역시 내 동생이야. 누나는 더 깊은 곳에 있대." },
  { id: "sister", name: "누나", object: "누나를", line: "고마워! 미로가 점점 어두워져. 남동생이 무서워하고 있을 거야." },
  { id: "littleBrother", name: "남동생", object: "남동생을", line: "형아! 진짜 올 줄 알았어. 여동생은 저 안쪽에 있어." },
  { id: "littleSister", name: "여동생", object: "여동생을", line: "오빠다! 아빠는 제일 어두운 미로에 갇혔대." },
  { id: "dad", name: "아빠", object: "아빠를", line: "장하다, 우리 아들! 그런데… 엄마 목소리가 하늘 위에서 들리는구나." },
  { id: "mom", name: "엄마", object: "엄마를", line: "드디어 다 모였네. 이제 다 같이 집에 가자." },
];

/** 가족사진 순서 */
export const PHOTO_ORDER: readonly MemberId[] = ["dad", "mom", "brother", "sister", "littleSister", "littleBrother"];

export const memberById = (id: MemberId) => FAMILY.find(m => m.id === id)!;

export const INTRO = [
  "별똥별이 떨어진 밤, 우리 집 앞마당이 거대한 미로로 바뀌었어요.",
  "엄마, 아빠, 형, 누나, 남동생, 여동생이 미로 곳곳에 갇혀 버렸어요. 나만 겨우 빠져나왔어요.",
  "헤드폰을 쓰고 기타를 메고, 이제 가족을 구하러 가요. 깊이 들어갈수록 앞이 잘 안 보일 거예요.",
];

export const SPACE_OPENED = "아빠를 구하자 밤하늘이 갈라지며 숨어 있던 우주 미로가 나타났어요. 엄마는 별빛 미로 가장 깊은 곳에 있어요.";

export const ENDING = [
  "엄마 손을 잡자 미로가 별가루처럼 흩어졌어요.",
  "앞마당엔 다시 우리 집이 서 있었어요.",
  "형, 누나, 남동생, 여동생, 아빠, 엄마, 그리고 나. 온 가족이 다시 만났어요.",
  "오늘 밤엔 내가 기타를 치고, 다 같이 노래를 불러요.",
];
