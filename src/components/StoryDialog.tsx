import { useEffect } from "react";
import characterUrl from "../assets/character.jpg";

interface Props {
  title: string;
  lines: readonly string[];
  action: string;
  onClose(): void;
}

/** 이야기 장면 (처음 시작할 때) */
export function StoryDialog({ title, lines, action, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="story-title">
      <div className="card story">
        <img className="card-art" src={characterUrl} alt="" />
        <h2 id="story-title">{title}</h2>
        {lines.map(line => (
          <p key={line}>{line}</p>
        ))}
        <div className="actions">
          <button className="primary" onClick={onClose} autoFocus>
            {action}
          </button>
        </div>
      </div>
    </div>
  );
}
