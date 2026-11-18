// 가족 구출 이야기. 주인공은 헤드폰을 쓰고 기타를 메는 검은 고양이예요 (형 · 누나가 있고 동생이 둘인 둘째).
// 이름 · 대사 · 이야기 문장은 언어마다 src/i18n/*.ts에 있어요.

export type MemberId = "brother" | "sister" | "littleBrother" | "littleSister" | "dad" | "mom";

/** 단계 묶음 순서대로: 초보 → 형, 중급 → 누나, 고급 → 남동생, 특급 → 여동생, 신 → 아빠, 우주 → 엄마 */
export const FAMILY: readonly MemberId[] = ["brother", "sister", "littleBrother", "littleSister", "dad", "mom"];

/** 가족사진 순서 */
export const PHOTO_ORDER: readonly MemberId[] = ["dad", "mom", "brother", "sister", "littleSister", "littleBrother"];
