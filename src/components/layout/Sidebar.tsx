'use client';
import { DiscoveredFile } from '@/lib/discovery';
import { Folder, FileText, Lock, AlertTriangle, Plus } from 'lucide-react';

interface Props {
  files: DiscoveredFile[];
  activeId: string | null;
  onSelect: (f: DiscoveredFile) => void;
}

const PLATFORM_ICONS: Record<string, string> = {
  'Claude Code': '🔶',
  'OpenClaw': '🦅',
  'Codex': '🟦',
};

export function Sidebar({ files, activeId, onSelect }: Props) {
  const platforms = Array.from(new Set(files.map(f => f.platform)));

  return (
    <aside className="w-72 h-full flex flex-col p-6 bg-[#fff8ef]/80 backdrop-blur-2xl rounded-r-[2rem] shadow-[8px_0_32px_rgba(30,27,19,0.04)]">
      {/* Logo */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-200/50">
          <span className="text-white text-lg">🥚</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-amber-900 font-headline tracking-tight leading-none">SoulShell</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-600/70 mt-0.5">Radiant Sanctuary</p>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto space-y-5">
        {platforms.map(p => (
          <div key={p}>
            <div className="flex items-center gap-2 font-semibold text-sm text-stone-500 mb-2 px-2">
              <span>{PLATFORM_ICONS[p] || '📁'}</span>
              <span>{p}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {files.filter(f => f.platform === p).map(file => (
                <button
                  key={file.id}
                  onClick={() => onSelect(file)}
                  className={`flex items-center gap-2 text-left px-4 py-2.5 rounded-full text-sm transition-all duration-200 w-full group ${
                    activeId === file.id
                      ? 'bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-lg shadow-amber-200/40'
                      : 'text-stone-500 hover:bg-amber-50 hover:translate-x-1'
                  }`}
                >
                  <FileText size={14} className={activeId === file.id ? 'text-white' : 'text-amber-700/50 group-hover:text-amber-600'} />
                  <span className="truncate flex-1">{file.name}</span>
                  {file.isReadonly && <Lock size={10} className="opacity-40" />}
                  {file.warning && <AlertTriangle size={10} className={activeId === file.id ? 'text-amber-100' : 'text-amber-500/60'} />}
                </button>
              ))}
            </div>
          </div>
        ))}

        {files.length === 0 && (
          <div className="text-stone-400 text-sm text-center mt-8 px-4">
            <p className="mb-2">No agent configs detected.</p>
            <p className="text-xs text-stone-300">Install Claude Code or OpenClaw to get started.</p>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-4">
        <button className="w-full py-3 bg-[#e9e2d3] text-amber-900 rounded-full font-bold text-sm shadow-sm hover:bg-[#e0d8c8] transition-colors flex items-center justify-center gap-2">
          <Plus size={16} />
          Add Custom Path
        </button>
      </div>
    </aside>
  );
}
