'use client';
import { DiscoveredFile } from '@/lib/discovery';
import { FileText, Lock, AlertTriangle, Plus, ChevronDown, Eye } from 'lucide-react';
import { useState } from 'react';

interface Props {
  files: DiscoveredFile[];
  activeId: string | null;
  onSelect: (f: DiscoveredFile) => void;
}

const PLATFORM_META: Record<string, { icon: string; color: string }> = {
  'Claude Code': { icon: '🔶', color: 'text-orange-800' },
  'OpenClaw': { icon: '🦅', color: 'text-green-800' },
};

const TYPE_DOT: Record<string, string> = {
  persona: 'bg-purple-400',
  memory: 'bg-yellow-400',
  rules: 'bg-blue-400',
  config: 'bg-stone-300',
};

export function Sidebar({ files, activeId, onSelect }: Props) {
  const platforms: Array<'Claude Code' | 'OpenClaw'> = ['Claude Code', 'OpenClaw'];
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCat = (key: string) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="w-80 h-full flex flex-col p-5 bg-[#fff8ef]/80 backdrop-blur-2xl rounded-r-[2rem] shadow-[8px_0_32px_rgba(30,27,19,0.04)] overflow-hidden">
      {/* Logo */}
      <div className="mb-6 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-200/50 shrink-0">
          <span className="text-white text-lg">🥚</span>
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-amber-900 font-headline tracking-tight leading-none">SoulShell</h1>
          <p className="text-[10px] tracking-[0.15em] text-amber-600/70 mt-0.5">灵魂诞壳 · 文件浏览器</p>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {platforms.map(platform => {
          const platformFiles = files.filter(f => f.platform === platform);
          const existingCount = platformFiles.filter(f => f.exists).length;
          const categories = Array.from(new Set(platformFiles.map(f => f.category)));
          const meta = PLATFORM_META[platform];

          return (
            <div key={platform}>
              {/* Platform Header */}
              <div className={`flex items-center gap-2 font-bold text-sm mb-2 px-2 ${meta.color}`}>
                <span>{meta.icon}</span>
                <span>{platform}</span>
                <span className="text-[10px] font-normal ml-auto">
                  {existingCount > 0 ? (
                    <span className="text-stone-400">{existingCount}/{platformFiles.length} 已发现</span>
                  ) : (
                    <span className="text-red-400">未安装</span>
                  )}
                </span>
              </div>

              {/* Categories */}
              {categories.map(cat => {
                const catKey = `${platform}:${cat}`;
                const catFiles = platformFiles.filter(f => f.category === cat);
                const isCollapsed = collapsed[catKey];

                return (
                  <div key={catKey} className="mb-0.5">
                    <button
                      onClick={() => toggleCat(catKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-stone-500 hover:text-amber-700 transition w-full"
                    >
                      <ChevronDown size={10} className={`transition-transform shrink-0 ${isCollapsed ? '-rotate-90' : ''}`} />
                      <span className="font-semibold">{cat}</span>
                    </button>

                    {!isCollapsed && (
                      <div className="flex flex-col gap-0.5 pl-1">
                        {catFiles.map(file => (
                          <button
                            key={file.id}
                            onClick={() => file.exists ? onSelect(file) : undefined}
                            title={file.description}
                            className={`flex items-center gap-2 text-left px-3 py-2 rounded-xl text-xs transition-all duration-200 w-full group ${
                              !file.exists
                                ? 'text-stone-300 cursor-default'
                                : activeId === file.id
                                  ? 'bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-md shadow-amber-200/40'
                                  : 'text-stone-500 hover:bg-amber-50/80 hover:translate-x-0.5'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              !file.exists ? 'bg-stone-200'
                              : activeId === file.id ? 'bg-white'
                              : TYPE_DOT[file.type]
                            }`} />
                            <FileText size={12} className={`shrink-0 ${
                              !file.exists ? 'text-stone-200'
                              : activeId === file.id ? 'text-white/80'
                              : 'text-amber-700/40 group-hover:text-amber-600'
                            }`} />
                            <span className="truncate flex-1">{file.displayName}</span>
                            {!file.exists && <span className="text-[9px] text-stone-300 shrink-0">未检测到</span>}
                            {file.exists && file.isReadonly && <Lock size={9} className="opacity-40 shrink-0" />}
                            {file.exists && file.warning && <AlertTriangle size={9} className={`shrink-0 ${activeId === file.id ? 'text-amber-100' : 'text-yellow-500/60'}`} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-4">
        <button className="w-full py-3 bg-[#e9e2d3] text-amber-900 rounded-full font-bold text-sm shadow-sm hover:bg-[#e0d8c8] transition-colors flex items-center justify-center gap-2">
          <Plus size={16} />
          添加自定义路径
        </button>
      </div>
    </aside>
  );
}
