// 테스트용 관리자 잠금 풀기. 비밀번호 원문은 저장소에 없고 해시만 둬요.
// 확인이 기기 안에서만 이뤄져서 진짜 보안은 아니에요. 게임 진행을 막는 용도로만 써요.
const SALT = "maze-game:";
const PASSWORD_HASH = "0d480a9bb494f6a502a51bc667d161ba000685030d31c34995706ff93ba9fcc6";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function checkAdminPassword(password: string): Promise<"ok" | "wrong" | "unsupported"> {
  if (!globalThis.crypto?.subtle) return "unsupported";
  return (await sha256(SALT + password)) === PASSWORD_HASH ? "ok" : "wrong";
}
