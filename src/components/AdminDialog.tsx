import { useEffect, useRef, useState, type FormEvent } from "react";
import { checkAdminPassword } from "../lib/admin";
import type { Progress } from "../lib/progress";

interface Props {
  progress: Progress;
  onProgress(p: Progress): void;
  onClose(): void;
}

/** 테스트용 관리자 창. 홈 제목을 길게 누르면 열려요. */
export function AdminDialog({ progress, onProgress, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    const result = await checkAdminPassword(password);
    setChecking(false);
    if (result === "ok") {
      onProgress({ ...progress, admin: true });
      onClose();
      return;
    }
    setError(result === "wrong" ? "비밀번호가 맞지 않아요. 다시 넣어 주세요." : "이 브라우저에서는 비밀번호를 확인할 수 없어요.");
    inputRef.current?.select();
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
      {progress.admin ? (
        <div className="card">
          <h2 id="admin-title">관리자</h2>
          <p>모든 등급과 단계가 열려 있어요. 다시 잠그면 직접 깬 곳까지만 열려요.</p>
          <div className="actions">
            <button type="button" className="secondary" onClick={onClose}>닫기</button>
            <button
              type="button"
              className="primary"
              onClick={() => {
                onProgress({ ...progress, admin: false });
                onClose();
              }}
            >
              다시 잠그기
            </button>
          </div>
        </div>
      ) : (
        <form className="card" onSubmit={submit} autoComplete="off">
          <h2 id="admin-title">관리자 확인</h2>
          <p>비밀번호를 넣으면 모든 등급과 단계가 열려요.</p>
          <input
            ref={inputRef}
            id="admin-password"
            type="password"
            placeholder="비밀번호"
            aria-label="관리자 비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button type="button" className="secondary" onClick={onClose}>취소</button>
            <button type="submit" className="primary" disabled={checking || !password}>열기</button>
          </div>
        </form>
      )}
    </div>
  );
}
