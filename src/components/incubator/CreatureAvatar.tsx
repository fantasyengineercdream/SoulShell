'use client';

export type CreatureType = 'dragon' | 'cat' | 'owl' | 'spirit' | 'blob';

interface Props {
  creature: CreatureType;
  size?: number;
  animate?: boolean;
}

const CREATURES: Record<CreatureType, { body: string; eye: string; accent: string; label: string }> = {
  dragon: {
    label: '小龙',
    body: '#e07b3a',
    eye: '#2d1a0e',
    accent: '#f5c842',
  },
  cat: {
    label: '灵猫',
    body: '#8b7355',
    eye: '#1a1a1a',
    accent: '#f5e6c8',
  },
  owl: {
    label: '夜枭',
    body: '#5c4a3a',
    eye: '#ffd700',
    accent: '#8b7355',
  },
  spirit: {
    label: '幽灵',
    body: '#c4b5fd',
    eye: '#4c1d95',
    accent: '#e9d5ff',
  },
  blob: {
    label: '团子',
    body: '#86efac',
    eye: '#064e3b',
    accent: '#d1fae5',
  },
};

export function CreatureAvatar({ creature, size = 120, animate = true }: Props) {
  const c = CREATURES[creature];
  const s = size;
  const bodyR = s * 0.38;
  const eyeR = s * 0.06;
  const eyeY = s * 0.42;
  const leftEyeX = s * 0.4;
  const rightEyeX = s * 0.6;
  const mouthY = s * 0.55;

  // Ear/horn/wing positions depend on creature type
  const renderFeature = () => {
    switch (creature) {
      case 'dragon':
        return (
          <>
            {/* Horns */}
            <polygon points={`${s*0.35},${s*0.28} ${s*0.3},${s*0.12} ${s*0.4},${s*0.24}`} fill={c.accent} />
            <polygon points={`${s*0.65},${s*0.28} ${s*0.7},${s*0.12} ${s*0.6},${s*0.24}`} fill={c.accent} />
            {/* Wings */}
            <ellipse cx={s*0.18} cy={s*0.5} rx={s*0.1} ry={s*0.15} fill={c.accent} opacity={0.6} />
            <ellipse cx={s*0.82} cy={s*0.5} rx={s*0.1} ry={s*0.15} fill={c.accent} opacity={0.6} />
          </>
        );
      case 'cat':
        return (
          <>
            {/* Ears */}
            <polygon points={`${s*0.3},${s*0.3} ${s*0.25},${s*0.12} ${s*0.4},${s*0.25}`} fill={c.body} />
            <polygon points={`${s*0.7},${s*0.3} ${s*0.75},${s*0.12} ${s*0.6},${s*0.25}`} fill={c.body} />
            <polygon points={`${s*0.32},${s*0.28} ${s*0.27},${s*0.16} ${s*0.38},${s*0.25}`} fill={c.accent} />
            <polygon points={`${s*0.68},${s*0.28} ${s*0.73},${s*0.16} ${s*0.62},${s*0.25}`} fill={c.accent} />
            {/* Whiskers */}
            <line x1={s*0.2} y1={s*0.5} x2={s*0.35} y2={s*0.52} stroke={c.eye} strokeWidth={1} opacity={0.3} />
            <line x1={s*0.2} y1={s*0.55} x2={s*0.35} y2={s*0.54} stroke={c.eye} strokeWidth={1} opacity={0.3} />
            <line x1={s*0.8} y1={s*0.5} x2={s*0.65} y2={s*0.52} stroke={c.eye} strokeWidth={1} opacity={0.3} />
            <line x1={s*0.8} y1={s*0.55} x2={s*0.65} y2={s*0.54} stroke={c.eye} strokeWidth={1} opacity={0.3} />
          </>
        );
      case 'owl':
        return (
          <>
            {/* Ear tufts */}
            <polygon points={`${s*0.3},${s*0.28} ${s*0.28},${s*0.1} ${s*0.38},${s*0.22}`} fill={c.accent} />
            <polygon points={`${s*0.7},${s*0.28} ${s*0.72},${s*0.1} ${s*0.62},${s*0.22}`} fill={c.accent} />
            {/* Big eyes */}
            <circle cx={leftEyeX} cy={eyeY} r={eyeR * 1.8} fill="white" />
            <circle cx={rightEyeX} cy={eyeY} r={eyeR * 1.8} fill="white" />
          </>
        );
      case 'spirit':
        return (
          <>
            {/* Wavy bottom */}
            <path d={`M${s*0.3},${s*0.7} Q${s*0.35},${s*0.75} ${s*0.4},${s*0.7} Q${s*0.45},${s*0.65} ${s*0.5},${s*0.7} Q${s*0.55},${s*0.75} ${s*0.6},${s*0.7} Q${s*0.65},${s*0.65} ${s*0.7},${s*0.7}`}
              fill="none" stroke={c.accent} strokeWidth={2} opacity={0.5} />
          </>
        );
      case 'blob':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className={`inline-block ${animate ? 'animate-[float_3s_ease-in-out_infinite]' : ''}`}
      style={{ width: s, height: s }}>
      <svg viewBox={`0 0 ${s} ${s}`} width={s} height={s}>
        {/* Glow */}
        <defs>
          <radialGradient id={`glow-${creature}`}>
            <stop offset="0%" stopColor={c.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={c.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={s/2} cy={s/2} r={bodyR * 1.4} fill={`url(#glow-${creature})`} />

        {/* Features behind body */}
        {renderFeature()}

        {/* Body */}
        <ellipse cx={s/2} cy={s/2} rx={bodyR} ry={bodyR * 0.9} fill={c.body} />

        {/* Belly */}
        <ellipse cx={s/2} cy={s*0.55} rx={bodyR*0.6} ry={bodyR*0.5} fill={c.accent} opacity={0.4} />

        {/* Eyes */}
        <circle cx={leftEyeX} cy={eyeY} r={eyeR} fill={c.eye} />
        <circle cx={rightEyeX} cy={eyeY} r={eyeR} fill={c.eye} />
        {/* Eye shine */}
        <circle cx={leftEyeX + eyeR*0.3} cy={eyeY - eyeR*0.3} r={eyeR*0.35} fill="white" />
        <circle cx={rightEyeX + eyeR*0.3} cy={eyeY - eyeR*0.3} r={eyeR*0.35} fill="white" />

        {/* Mouth */}
        <path d={`M${s*0.45},${mouthY} Q${s*0.5},${mouthY + s*0.03} ${s*0.55},${mouthY}`}
          fill="none" stroke={c.eye} strokeWidth={1.5} strokeLinecap="round" />

        {/* Blush */}
        <circle cx={s*0.33} cy={s*0.53} r={s*0.04} fill="#ff9999" opacity={0.3} />
        <circle cx={s*0.67} cy={s*0.53} r={s*0.04} fill="#ff9999" opacity={0.3} />
      </svg>
    </div>
  );
}

export function CreatureSelector({ selected, onSelect }: { selected: CreatureType; onSelect: (c: CreatureType) => void }) {
  const types: CreatureType[] = ['dragon', 'cat', 'owl', 'spirit', 'blob'];
  return (
    <div className="flex gap-3 justify-center">
      {types.map(t => (
        <button key={t} onClick={() => onSelect(t)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            selected === t ? 'bg-amber-100 scale-110 shadow-md' : 'hover:bg-amber-50'
          }`}>
          <CreatureAvatar creature={t} size={48} animate={false} />
          <span className="text-[10px] text-stone-500 font-medium">{CREATURES[t].label}</span>
        </button>
      ))}
    </div>
  );
}

export { CREATURES };
