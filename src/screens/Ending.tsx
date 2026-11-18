import { useLayoutEffect } from "react";
import faceUrl from "../assets/face.jpg";
import { FamilyFace } from "../components/FamilyFace";
import { useI18n } from "../i18n";
import { PHOTO_ORDER, type MemberId } from "../lib/story";

interface Props {
  onHome(): void;
}

/** 행복한 엔딩: 온 가족이 다시 만나요 */
export function Ending({ onHome }: Props) {
  const { t } = useI18n();
  useLayoutEffect(() => {
    document.documentElement.classList.add("space");
    return () => document.documentElement.classList.remove("space");
  }, []);

  const face = (id: MemberId) => (
    <li key={id}>
      <FamilyFace id={id} size={72} label={t.members[id]} />
      <span>{t.members[id]}</span>
    </li>
  );

  return (
    <main className="screen ending">
      <div className="stars" aria-hidden="true" />
      <h1 className="ending-title">{t.endingTitle}</h1>
      <figure className="family-photo">
        <ol>
          {PHOTO_ORDER.slice(0, 3).map(face)}
          <li className="me">
            <img src={faceUrl} alt={t.me} />
            <span>{t.me}</span>
          </li>
          {PHOTO_ORDER.slice(3).map(face)}
        </ol>
      </figure>
      <div className="ending-text">
        {t.ending.map(line => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <p className="ending-end">{t.theEnd}</p>
      <button className="primary ending-home" onClick={onHome}>{t.toHome}</button>
    </main>
  );
}
