import { useLayoutEffect } from "react";
import faceUrl from "../assets/face.jpg";
import { FamilyFace } from "../components/FamilyFace";
import { ENDING, memberById, PHOTO_ORDER } from "../lib/story";

interface Props {
  onHome(): void;
}

/** 행복한 엔딩: 온 가족이 다시 만나요 */
export function Ending({ onHome }: Props) {
  useLayoutEffect(() => {
    document.documentElement.classList.add("space");
    return () => document.documentElement.classList.remove("space");
  }, []);

  return (
    <main className="screen ending">
      <div className="stars" aria-hidden="true" />
      <h1 className="ending-title">온 가족이 다시 만났어요</h1>
      <figure className="family-photo">
        <ol>
          {PHOTO_ORDER.slice(0, 3).map(id => (
            <li key={id}>
              <FamilyFace id={id} size={72} label={memberById(id).name} />
              <span>{memberById(id).name}</span>
            </li>
          ))}
          <li className="me">
            <img src={faceUrl} alt="나" />
            <span>나</span>
          </li>
          {PHOTO_ORDER.slice(3).map(id => (
            <li key={id}>
              <FamilyFace id={id} size={72} label={memberById(id).name} />
              <span>{memberById(id).name}</span>
            </li>
          ))}
        </ol>
      </figure>
      <div className="ending-text">
        {ENDING.map(line => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <p className="ending-end">끝</p>
      <button className="primary ending-home" onClick={onHome}>처음 화면으로</button>
    </main>
  );
}
