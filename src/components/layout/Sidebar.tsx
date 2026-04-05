'use client';
import { DiscoveredFile } from '@/lib/discovery';
import { Folder, FileText, Lock, AlertTriangle } from 'lucide-react';

interface Props {
  files: DiscoveredFile[];
  activeId: string | null;
  onSelect: (f: DiscoveredFile) => void;
}

const TYPE_COLORS: Record<string, string> = {
  persona: 'text-purple-400',
  memory: 'text-yellow-400',
  rules: 'text-blue-400',
  config: 'text-gray-400',
};

const PLATFORM_COLORS: Record<string, string> = {
  'Claude Code': 'text-orange-400',
  'OpenClaw': 'text-green-400',
  'Codex': 'text-cyan-400',
};

export function Sidebar({ files, activeId, onSelect }: Props) {
  const platforms = Array.from(new Set(files.map(f => f.platform)));

  return (
    <div className="w-64 border-r border-gray-800 bg-gray-900 p-4 h-full overflow-y-auto flex flex-col">
      <h2 className="text-xl font-bold mb-2 text-purple-400 tracking-wider">SoulShell</h2>
      <p className="text-[10px] text-gray-600 mb-6">Agent Persona Visual Terminal</p>

      {platforms.map(p => (
        <div key={p} className="mb-5">
          <div className={`flex items-center gap-2 font-bold text-sm mb-2 ${PLATFORM_COLORS[p] || 'text-gray-300'}`}>
            <Folder size={14} /> {p}
          </div>
          <div className="flex flex-col gap-0.5 pl-3">
            {files.filter(f => f.platform === p).map(file => (
              <button
                key={file.id}
                onClick={() => onSelect(file)}
                className={`flex items-center gap-2 text-left px-2 py-1.5 rounded text-xs transition-colors w-full ${
                  activeId === file.id
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                }`}
              >
                <FileText size={12} className={TYPE_COLORS[file.type] || 'text-gray-500'} />
                <span className="truncate flex-1">{file.name}</span>
                {file.isReadonly && <Lock size={10} className="opacity-40" />}
                {file.warning && <AlertTriangle size={10} className="text-yellow-500 opacity-60" />}
              </button>
            ))}
          </div>
        </div>
      ))}

      {files.length === 0 && (
        <div className="text-gray-600 text-xs mt-4">No agent config files detected.</div>
      )}
    </div>
  );
}
