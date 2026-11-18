import { useEffect, useRef, useState, type FormEvent } from "react";
import { useI18n } from "../i18n";
import { checkAdminPassword } from "../lib/admin";
import type { Progress } from "../lib/progress";

interface Props {
  progress: Progress;
  onProgress(p: Progress): void;
  onClose(): void;
}

/** 테스트용 관리자 창. 홈 제목을 길게 누르면 열려요. */
export function AdminDialog({ progress, onProgress, onClose }: Props) {
  const { t } = useI18n();
  const a = t.admin;
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
    setError(result === "wrong" ? a.wrong : a.unsupported);
    inputRef.current?.select();
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
      {progress.admin ? (
        <div className="card">
          <h2 id="admin-title">{a.onTitle}</h2>
          <p>{a.onDesc}</p>
          <div className="actions">
            <button type="button" className="secondary" onClick={onClose}>{t.close}</button>
            <button
              type="button"
              className="primary"
              onClick={() => {
                onProgress({ ...progress, admin: false });
                onClose();
              }}
            >
              {a.relock}
            </button>
          </div>
        </div>
      ) : (
        <form className="card" onSubmit={submit} autoComplete="off">
          <h2 id="admin-title">{a.title}</h2>
          <p>{a.desc}</p>
          <input
            ref={inputRef}
            id="admin-password"
            type="password"
            placeholder={a.placeholder}
            aria-label={a.placeholder}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button type="button" className="secondary" onClick={onClose}>{a.cancel}</button>
            <button type="submit" className="primary" disabled={checking || !password}>{a.open}</button>
          </div>
        </form>
      )}
    </div>
  );
}
