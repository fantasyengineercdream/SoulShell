'use client';
import { useState } from 'react';
import { DiscoveredFile } from '@/lib/discovery';
import { TEMPLATES } from '@/lib/templates';
import { Zap, BookOpen, Check, Shield } from 'lucide-react';

interface Props {
  activeFile: DiscoveredFile | null;
  onInjected: () => void;
}

interface SliderField {
  key: string;
  left: string;
  right: string;
  value: number;
}

interface ToggleField {
  key: string;
  label: string;
  active: boolean;
}

export function PersonaForm({ activeFile, onInjected }: Props) {
  const [identity, setIdentity] = useState('');
  const [expertise, setExpertise] = useState('');

  const [sliders, setSliders] = useState<SliderField[]>([
    { key: 'logical_empathetic', left: 'Logical', right: 'Empathetic', value: 50 },
    { key: 'stoic_vibrant', left: 'Stoic', right: 'Vibrant', value: 50 },
    { key: 'traditional_innovative', left: 'Traditional', right: 'Innovative', value: 50 },
    { key: 'concise_verbose', left: 'Concise', right: 'Detailed', value: 30 },
  ]);

  const [toggles, setToggles] = useState<ToggleField[]>([
    { key: 'no_emoji', label: 'Never use emojis', active: true },
    { key: 'no_apology', label: 'Never apologize', active: false },
    { key: 'no_overexplain', label: 'Never over-explain', active: true },
    { key: 'challenge_ok', label: 'Push back when wrong', active: true },
  ]);

  const [injecting, setInjecting] = useState(false);
  const [injected, setInjected] = useState(false);

  const loadTemplate = (name: string) => {
    const t = TEMPLATES[name];
    if (!t) return;
    setIdentity(t.identity);
    setExpertise(t.expertise);
  };

  const updateSlider = (idx: number, value: number) => {
    setSliders(prev => prev.map((s, i) => i === idx ? { ...s, value } : s));
  };

  const toggleField = (idx: number) => {
    setToggles(prev => prev.map((t, i) => i === idx ? { ...t, active: !t.active } : t));
  };

  const buildPersona = () => {
    const communication = sliders.map(s => {
      const pct = s.value;
      if (pct < 30) return `Strongly ${s.left}`;
      if (pct < 45) return `Leaning ${s.left}`;
      if (pct > 70) return `Strongly ${s.right}`;
      if (pct > 55) return `Leaning ${s.right}`;
      return `Balanced ${s.left}/${s.right}`;
    }).join('. ');

    const forbidden = toggles.filter(t => t.active).map(t => t.label).join('. ');
    const workMode = sliders.find(s => s.key === 'concise_verbose')
      ? `Output style: ${sliders.find(s => s.key === 'concise_verbose')!.value < 40 ? 'Ultra-concise, bullet points' : 'Detailed explanations'}`
      : '';

    return { identity, communication, workMode, forbidden, expertise };
  };

  const canInject = activeFile && !activeFile.isReadonly && activeFile.type === 'persona';

  const handleInject = async () => {
    if (!activeFile) return;
    setInjecting(true);
    try {
      const persona = buildPersona();
      await fetch('/api/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: activeFile.platform, targetPath: activeFile.path, persona }),
      });
      setInjected(true);
      onInjected();
      setTimeout(() => setInjected(false), 3000);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 bg-[#fbf3e4]/60">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-amber-900 font-headline">Ghost in the Shell</h3>
        <p className="text-xs text-stone-400">5-Layer Persona Editor</p>
      </div>

      {/* Templates */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={12} className="text-amber-600" />
          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Templates</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TEMPLATES).map(([name, t]) => (
            <button
              key={name}
              onClick={() => loadTemplate(name)}
              title={t.description}
              className="text-[10px] px-3 py-1.5 bg-white rounded-full border border-amber-100 hover:border-amber-400 hover:bg-amber-50 transition text-stone-500 hover:text-amber-800 shadow-sm"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Identity (text) */}
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Identity</label>
        <textarea
          value={identity}
          onChange={e => setIdentity(e.target.value)}
          placeholder="Who is this AI? Role, values, personality..."
          className="w-full bg-white border-none rounded-xl p-3 text-sm text-stone-700 min-h-[56px] focus:ring-2 focus:ring-amber-300 outline-none resize-y shadow-sm"
        />
      </div>

      {/* Personality Matrix (sliders) */}
      <div className="mb-4 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-amber-600 text-lg">🧠</span>
          <span className="text-sm font-bold text-amber-900 font-headline">Personality Matrix</span>
        </div>
        <div className="space-y-5">
          {sliders.map((s, i) => (
            <div key={s.key}>
              <div className="flex justify-between text-[11px] font-semibold text-stone-500 mb-1.5">
                <span>{s.left}</span>
                <span className="text-amber-700">{s.right}</span>
              </div>
              <input
                type="range" min={0} max={100} value={s.value}
                onChange={e => updateSlider(i, parseInt(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Red Lines (toggles) */}
      <div className="mb-4 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-amber-600" />
          <span className="text-sm font-bold text-amber-900 font-headline">Red Lines</span>
        </div>
        <div className="space-y-2">
          {toggles.map((t, i) => (
            <div key={t.key} className="flex items-center justify-between py-2 px-3 bg-[#fbf3e4] rounded-full">
              <span className="text-xs text-stone-600 font-medium">{t.label}</span>
              <button
                onClick={() => toggleField(i)}
                className={`toggle-switch ${t.active ? 'active' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Expertise (text) */}
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Expertise</label>
        <textarea
          value={expertise}
          onChange={e => setExpertise(e.target.value)}
          placeholder="Tech stack, domains, current project..."
          className="w-full bg-white border-none rounded-xl p-3 text-sm text-stone-700 min-h-[56px] focus:ring-2 focus:ring-amber-300 outline-none resize-y shadow-sm"
        />
      </div>

      {/* Inject Button */}
      <div className="mt-auto pt-3">
        {activeFile && (
          <p className="text-[10px] text-stone-400 mb-2 text-center">
            Target: <span className="text-amber-700 font-semibold">{activeFile.platform} / {activeFile.name}</span>
          </p>
        )}
        <button
          onClick={handleInject}
          disabled={!canInject || injecting}
          className={`w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            injected
              ? 'bg-green-100 text-green-700'
              : canInject
                ? 'bg-gradient-to-r from-amber-700 to-amber-400 text-white shadow-xl shadow-amber-200/50 hover:scale-[1.02] active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {injected ? <><Check size={16} /> Soul Injected!</> : <><Zap size={16} /> {injecting ? 'Injecting...' : 'Inject Soul'}</>}
        </button>
      </div>
    </div>
  );
}
