'use client';
import { DiscoveredFile } from '@/lib/discovery';
import { FileText, Lock, AlertTriangle, Plus, ChevronDown, Info } from 'lucide-react';
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
  const platforms = Array.from(new Set(files.map(f => f.platform)));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  const toggleLayer = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
          const layers = Array.from(new Set(platformFiles.map(f => f.layer)));
          const meta = PLATFORM_META[platform] || { icon: '📁', color: 'text-stone-500' };

          return (
            <div key={platform}>
              {/* Platform Header */}
              <div className={`flex items-center gap-2 font-bold text-sm mb-2 px-2 ${meta.color}`}>
                <span>{meta.icon}</span>
                <span>{platform}</span>
                <span className="text-[10px] font-normal text-stone-400 ml-auto">{platformFiles.length} 文件</span>
              </div>

              {/* Layers */}
              {layers.map(layer => {
                const layerKey = `${platform}:${layer}`;
                const layerFiles = platformFiles.filter(f => f.layer === layer);
                const isCollapsed = collapsed[layerKey];
                const layerDesc = layerFiles[0]?.layerDescription || '';

                return (
                  <div key={layerKey} className="mb-1">
                    {/* Layer Header */}
                    <button
                      onClick={() => toggleLayer(layerKey)}
                      onMouseEnter={() => setHoveredLayer(layerKey)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-stone-500 hover:text-amber-700 transition w-full group"
                    >
                      <ChevronDown size={10} className={`transition-transform shrink-0 ${isCollapsed ? '-rotate-90' : ''}`} />
                      <span className="font-semibold truncate">{layer}</span>
                      <Info size={9} className="opacity-0 group-hover:opacity-40 shrink-0 ml-auto" />
                    </button>

                    {/* Layer Description Tooltip */}
                    {hoveredLayer === layerKey && layerDesc && (
                      <div className="mx-3 mb-1 px-3 py-1.5 bg-amber-50 rounded-lg text-[10px] text-amber-700 leading-relaxed border border-amber-100">
                        {layerDesc}
                      </div>
                    )}

                    {/* Files */}
                    {!isCollapsed && (
                      <div className="flex flex-col gap-0.5 pl-1">
                        {layerFiles.map(file => (
                          <button
                            key={file.id}
                            onClick={() => onSelect(file)}
                            title={file.description}
                            className={`flex items-center gap-2 text-left px-3 py-2 rounded-xl text-xs transition-all duration-200 w-full group ${
                              activeId === file.id
                                ? 'bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-md shadow-amber-200/40'
                                : 'text-stone-500 hover:bg-amber-50/80 hover:translate-x-0.5'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeId === file.id ? 'bg-white' : TYPE_DOT[file.type] || 'bg-stone-300'}`} />
                            <FileText size={12} className={`shrink-0 ${activeId === file.id ? 'text-white/80' : 'text-amber-700/40 group-hover:text-amber-600'}`} />
                            <span className="truncate flex-1">{file.displayName}</span>
                            {file.isReadonly && <Lock size={9} className="opacity-40 shrink-0" />}
                            {file.warning && <AlertTriangle size={9} className={`shrink-0 ${activeId === file.id ? 'text-amber-100' : 'text-yellow-500/60'}`} />}
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

        {files.length === 0 && (
          <div className="text-stone-400 text-sm text-center mt-8 px-4">
            <p className="mb-2">未检测到 Agent 配置文件</p>
            <p className="text-xs text-stone-300">请安装 Claude Code 或 OpenClaw</p>
          </div>
        )}
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
