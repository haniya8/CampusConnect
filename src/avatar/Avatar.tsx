import type { AvatarSpec } from '../types';
import { BGS, HAIR_COLORS, OUTFITS, SKINS } from './parts';

const DARK = '#2E2540';

export function Avatar({ spec, size = 48, label }: { spec: AvatarSpec; size?: number; label?: string }) {
  const skin = SKINS[spec.skin]?.value ?? SKINS[0].value;
  const hair = HAIR_COLORS[spec.hairColor]?.value ?? HAIR_COLORS[0].value;
  const outfit = OUTFITS[spec.outfit]?.value ?? OUTFITS[0].value;
  const bg = BGS[spec.bg]?.value ?? BGS[0].value;
  const s = spec.hairStyle;
  const fringe = 'M27 46 Q24 18 50 18 Q76 18 73 46 Q70 33 56 30 Q40 33 27 46Z';

  return (
    <span
      className="inline-block shrink-0 overflow-hidden rounded-full align-middle"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label ?? 'Avatar'}>
        <rect width="100" height="100" fill={bg} />
        {/* hair behind the head */}
        {s === 'long' && <path d="M25 48 Q22 16 50 16 Q78 16 75 48 L78 84 Q50 92 22 84Z" fill={hair} />}
        {s === 'ponytail' && <path d="M70 34 Q94 40 86 72 Q80 84 74 70 Q82 52 68 44Z" fill={hair} />}
        {/* body */}
        <path d="M12 100 Q14 72 50 70 Q86 72 88 100Z" fill={outfit} />
        <path d="M40 71 Q50 80 60 71" stroke="#fff" strokeOpacity=".7" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* neck */}
        <rect x="43" y="58" width="14" height="16" rx="5" fill={skin} />
        <rect x="43" y="58" width="14" height="16" rx="5" fill="#000" opacity=".08" />
        {/* scarf wraps behind face */}
        {s === 'scarf' && (
          <path d="M21 50 Q19 12 50 12 Q81 12 79 50 Q81 72 74 90 L26 90 Q19 72 21 50Z" fill={hair} />
        )}
        {s !== 'scarf' && (
          <>
            <circle cx="28" cy="48" r="4" fill={skin} />
            <circle cx="72" cy="48" r="4" fill={skin} />
          </>
        )}
        {/* head */}
        <ellipse cx="50" cy="46" rx="22" ry="24" fill={skin} />
        {/* hair in front */}
        {(s === 'short' || s === 'long' || s === 'ponytail' || s === 'bun') && <path d={fringe} fill={hair} />}
        {s === 'bun' && <circle cx="50" cy="13" r="9" fill={hair} />}
        {s === 'curly' && (
          <g fill={hair}>
            {[[29, 36, 10], [39, 26, 11], [51, 21, 11], [63, 26, 11], [72, 37, 10]].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
            <path d={fringe} />
          </g>
        )}
        {s === 'scarf' && (
          <>
            <path d="M28 44 Q50 22 72 44 L75 34 Q50 4 25 34Z" fill={hair} />
            <path d="M28 44 Q50 22 72 44" stroke="#000" strokeOpacity=".12" strokeWidth="2" fill="none" />
          </>
        )}
        {/* face */}
        <circle cx="41" cy="47" r="2.6" fill={DARK} />
        <circle cx="59" cy="47" r="2.6" fill={DARK} />
        <circle cx="41.8" cy="46.2" r=".8" fill="#fff" />
        <circle cx="59.8" cy="46.2" r=".8" fill="#fff" />
        <g stroke={DARK} strokeOpacity=".7" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d={spec.expression === 'wow' ? 'M35 38 Q41 34 47 38' : 'M35 40 Q41 37 47 40'} />
          <path d={spec.expression === 'wow' ? 'M53 38 Q59 34 65 38' : 'M53 40 Q59 37 65 40'} />
        </g>
        <circle cx="35" cy="55" r="3.5" fill="#F08A8A" opacity=".25" />
        <circle cx="65" cy="55" r="3.5" fill="#F08A8A" opacity=".25" />
        {spec.expression === 'smile' && (
          <path d="M43 58 Q50 64 57 58" stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {spec.expression === 'grin' && <path d="M41 56 Q50 70 59 56Z" fill={DARK} />}
        {spec.expression === 'calm' && (
          <path d="M45 60 L55 60" stroke={DARK} strokeWidth="2" strokeLinecap="round" />
        )}
        {spec.expression === 'wow' && <ellipse cx="50" cy="61" rx="3" ry="4" fill={DARK} />}
        {/* accessories */}
        {spec.accessory === 'glasses' && (
          <g stroke={DARK} strokeWidth="1.8" fill="#fff" fillOpacity=".25">
            <circle cx="41" cy="47" r="7.5" />
            <circle cx="59" cy="47" r="7.5" />
            <path d="M48.5 46 L51.5 46" />
          </g>
        )}
        {spec.accessory === 'sunglasses' && (
          <g fill={DARK}>
            <rect x="32" y="41" width="17" height="11" rx="4" />
            <rect x="51" y="41" width="17" height="11" rx="4" />
            <rect x="48" y="44" width="4" height="2" />
          </g>
        )}
        {spec.accessory === 'headphones' && (
          <g>
            <path d="M26 48 Q26 12 50 12 Q74 12 74 48" stroke={DARK} strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="20" y="42" width="9" height="18" rx="4" fill={DARK} />
            <rect x="71" y="42" width="9" height="18" rx="4" fill={DARK} />
          </g>
        )}
        {spec.accessory === 'flower' && (
          <g transform="translate(68 24)">
            {[0, 72, 144, 216, 288].map((r) => (
              <circle key={r} cx="0" cy="-5" r="4" fill="#F7A8C8" transform={`rotate(${r})`} />
            ))}
            <circle r="3" fill="#FFD84D" />
          </g>
        )}
      </svg>
    </span>
  );
}
