import type { MemberId } from "../lib/story";

// 주인공과 같은 검은 고양이 가족. 사람마다 표시(모자 · 리본 · 꽃 · 수염 …)로 구별해요.
const FUR = "#26211d";
const SKIN = "#f3c79d";
const PINK = "#e9a0a0";

function Accessory({ id }: { id: MemberId }) {
  switch (id) {
    case "dad":
      return (
        <g>
          <path d="M33 54 L44 52 M56 52 L67 54" stroke={FUR} strokeWidth="3" strokeLinecap="round" />
          <path d="M38 72 Q44 66 50 70 Q56 66 62 72 Q56 75 50 72.5 Q44 75 38 72 Z" fill={FUR} />
        </g>
      );
    case "mom":
      return (
        <g>
          <path d="M18 54 Q12 84 26 96 L32 70 Z M82 54 Q88 84 74 96 L68 70 Z" fill={FUR} />
          <g transform="translate(73 30)">
            {[0, 72, 144, 216, 288].map(a => (
              <circle key={a} cx={6 * Math.cos((a * Math.PI) / 180)} cy={6 * Math.sin((a * Math.PI) / 180)} r="4.5" fill="#f28fb0" />
            ))}
            <circle r="3.5" fill="#ffd166" />
          </g>
        </g>
      );
    case "brother":
      return (
        <g>
          <path d="M24 42 Q50 12 76 42 Z" fill="#3d6fd8" />
          <ellipse cx="60" cy="42" rx="22" ry="5" fill="#2c56b3" />
        </g>
      );
    case "sister":
      return (
        <g>
          <circle cx="86" cy="62" r="10" fill={FUR} />
          <path d="M66 22 L76 16 L76 30 Z M86 22 L76 16 L76 30 Z" fill="#7650c4" />
          <circle cx="76" cy="23" r="3.5" fill="#5b3aa3" />
        </g>
      );
    case "littleSister":
      return (
        <g>
          <circle cx="14" cy="56" r="8" fill={FUR} />
          <circle cx="86" cy="56" r="8" fill={FUR} />
          <path d="M8 44 L16 48 L8 52 Z M24 44 L16 48 L24 52 Z M76 44 L84 48 L76 52 Z M92 44 L84 48 L92 52 Z" fill="#e5484d" />
        </g>
      );
    case "littleBrother":
      return (
        <g>
          <path d="M50 30 Q46 18 56 16" stroke={FUR} strokeWidth="4" fill="none" strokeLinecap="round" />
          <g transform="rotate(-25 66 74)">
            <rect x="59" y="71" width="14" height="6" rx="2" fill="#f5deb3" stroke="#d9b98a" strokeWidth="0.8" />
          </g>
        </g>
      );
  }
}

interface Props {
  id: MemberId;
  /** 아직 구출하지 못했으면 회색 */
  rescued?: boolean;
  size?: number;
  label?: string;
}

export function FamilyFace({ id, rescued = true, size = 48, label }: Props) {
  const small = id === "littleBrother" || id === "littleSister";
  return (
    <svg
      className={`family-face${rescued ? "" : " locked"}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g transform={small ? "translate(7 12) scale(0.86)" : undefined}>
        <path d="M17 42 L23 6 L45 26 Z M83 42 L77 6 L55 26 Z" fill={FUR} />
        <path d="M23 34 L26 14 L38 26 Z M77 34 L74 14 L62 26 Z" fill={PINK} />
        <circle cx="50" cy="58" r="36" fill={FUR} />
        <ellipse cx="50" cy="66" rx="28" ry="24" fill={SKIN} />
        <path d="M22 54 Q28 32 50 32 Q72 32 78 54 Q68 46 60 48 Q52 42 44 48 Q34 45 22 54 Z" fill={FUR} />
        <path d="M35 63 Q39.5 58.5 44 63 M56 63 Q60.5 58.5 65 63" stroke={FUR} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <ellipse cx="35" cy="71" rx="5" ry="3" fill={PINK} opacity="0.55" />
        <ellipse cx="65" cy="71" rx="5" ry="3" fill={PINK} opacity="0.55" />
        <path d="M47.5 68 L52.5 68 L50 71 Z" fill="#b0705f" />
        <path d="M45 74 Q47.5 77 50 74 Q52.5 77 55 74" stroke={FUR} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M24 70 L36 72 M24 76 L36 75 M76 70 L64 72 M76 76 L64 75" stroke={FUR} strokeWidth="1" opacity="0.6" />
        <Accessory id={id} />
      </g>
    </svg>
  );
}
