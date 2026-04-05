'use client';
import { useState } from 'react';
import { DiscoveredFile } from '@/lib/discovery';
import { TEMPLATES } from '@/lib/templates';
import { Zap, BookOpen, Check } from 'lucide-react';

interface Props {
  activeFile: DiscoveredFile | null;
  onInjected: () => void;
}

const FIELDS: { key: string; label: string; hint: string }[] = [
  { key: 'identity', label: 'Identity', hint: 'Who is this AI? Role, values, personality.' },
  { key: 'communication', label: 'Communication', hint: 'How should it talk? Tone, format, length.' },
  { key: 'workMode', label: 'Work Mode', hint: 'How should it work? Process, habits, pace.' },
  { key: 'forbidden', label: 'Forbidden', hint: 'What must it NEVER do? Red lines.' },
  { key: 'expertise', label: 'Expertise', hint: 'Domains, tech stack, current focus.' },
];

export function PersonaForm({ activeFile, onInjected }: Props) {
  const [data, setData] = useState({
    identity: '', communication: '', workMode: '', forbidden: '', expertise: ''
  });
  const [injecting, setInjecting] = useState(false);
  const [injected, setInjected] = useState(false);

  const loadTemplate = (name: string) => {
    const t = TEMPLATES[name];
    if (t) setData({ identity: t.identity, communication: t.communication, workMode: t.workMode, forbidden: t.forbidden, expertise: t.expertise });
  };

  const canInject = activeFile && !activeFile.isReadonly && activeFile.type === 'persona';

  const handleInject = async () => {
    if (!activeFile) return;
    setInjecting(true);
    try {
      await fetch('/api/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: activeFile.platform, targetPath: activeFile.path, persona: data }),
      });
      setInjected(true);
      onInjected();
      setTimeout(() => setInjected(false), 3000);
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-200 text-sm mb-1">Ghost in the Shell</h3>
        <p className="text-[10px] text-gray-600">5-Layer Persona Editor</p>
      </div>

      {/* Template Selector */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={12} className="text-purple-400" />
          <span className="text-[10px] text-gray-500 uppercase font-bold">Puppeteer Templates</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TEMPLATES).map(([name, t]) => (
            <button
              key={name}
              onClick={() => loadTemplate(name)}
              className="text-[10px] px-2 py-1 bg-gray-800 hover:bg-purple-900/50 rounded border border-gray-700 hover:border-purple-600 transition text-gray-400 hover:text-purple-300"
              title={t.description}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Layer Form */}
      <div className="space-y-3 flex-1">
        {FIELDS.map(({ key, label, hint }) => (
          <div key={key}>
            <label className="block text-[10px] font-bold text-purple-400 uppercase mb-0.5">{label}</label>
            <p className="text-[9px] text-gray-600 mb-1">{hint}</p>
            <textarea
              value={(data as Record<string, string>)[key]}
              onChange={e => setData({ ...data, [key]: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-xs text-gray-300 min-h-[48px] focus:border-purple-500 outline-none resize-y leading-relaxed"
            />
          </div>
        ))}
      </div>

      {/* Inject Button */}
      <div className="mt-4 pt-3 border-t border-gray-800">
        {activeFile && (
          <p className="text-[10px] text-gray-600 mb-2">
            Target: <span className="text-gray-400">{activeFile.platform} / {activeFile.name}</span>
          </p>
        )}
        <button
          onClick={handleInject}
          disabled={!canInject || injecting}
          className={`w-full py-2.5 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            injected
              ? 'bg-green-800 text-green-300'
              : canInject
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {injected ? <><Check size={16} /> Injected!</> : <><Zap size={16} /> {injecting ? 'Injecting...' : 'Inject Persona'}</>}
        </button>
        {!canInject && activeFile && (
          <p className="text-[9px] text-gray-600 text-center mt-1.5">Select an editable persona file to inject.</p>
        )}
      </div>
    </div>
  );
}
