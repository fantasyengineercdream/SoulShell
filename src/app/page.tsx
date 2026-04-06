'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MonacoPane } from '@/components/editor/MonacoPane';
import { GhostBuilder } from '@/components/editor/GhostBuilder';
import { PetCompanion } from '@/components/incubator/PetCompanion';
import { DiscoveredFile } from '@/lib/discovery';

export default function Home() {
  const [view, setView] = useState<'incubator' | 'editor'>('incubator');
  const [files, setFiles] = useState<DiscoveredFile[]>([]);
  const [activeFile, setActiveFile] = useState<DiscoveredFile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rightTab, setRightTab] = useState<'ghost' | 'pet'>('ghost');

  useEffect(() => {
    if (view === 'editor') {
      fetch('/api/files').then(r => r.json()).then(d => setFiles(d.files || []));
    }
  }, [view]);

  // ─── Incubator: Hatching Screen ─────────────────────────
  if (view === 'incubator') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#fff8ef] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-amber-200/30 animate-[spin_25s_linear_infinite]" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-amber-100/20 animate-[spin_40s_linear_infinite_reverse]" />
          <div className="absolute w-[700px] h-[700px] rounded-full bg-amber-100/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-12">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-100 soul-glow animate-soul-pulse flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),transparent)]" />
              <span className="text-6xl relative z-10">🥚</span>
            </div>
            <div className="absolute top-1/4 -right-6 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_16px_#ffd700] animate-pulse" />
            <div className="absolute bottom-1/3 -left-8 w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] animate-pulse" />
          </div>

          <h1 className="text-5xl font-extrabold text-amber-900 font-headline tracking-tight mb-3">SoulShell</h1>
          <p className="text-stone-500 text-base mb-1 font-medium">灵魂诞壳 · Agent 人格通用终端</p>
          <p className="text-stone-400 text-sm mb-10 max-w-md text-center leading-relaxed">
            发现、编辑、注入——让你的 AI 工具拥有灵魂。<br />
            一个灵魂，如影随形。
          </p>

          <button onClick={() => setView('editor')}
            className="px-10 py-4 bg-gradient-to-r from-amber-700 to-amber-400 rounded-full text-white font-bold text-lg shadow-xl shadow-amber-200/50 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-3">
            <span>✨</span> 孵化你的伙伴
          </button>
        </div>
      </div>
    );
  }

  // ─── Editor: Main Workspace ─────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#fff8ef]">
      {/* Left: File Tree */}
      <Sidebar files={files} activeId={activeFile?.id || null} onSelect={setActiveFile} />

      {/* Center: Monaco Editor */}
      <main className="flex-1 flex flex-col">
        {activeFile ? (
          <MonacoPane file={activeFile} refreshKey={refreshKey} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-4">
            <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center">
              <span className="text-4xl opacity-40">📂</span>
            </div>
            <p className="text-sm font-medium">从左侧选择一个文件</p>
            <p className="text-xs text-stone-300">查看你的 Agent 怎么认识你</p>
          </div>
        )}
      </main>

      {/* Right: Ghost Builder / Pet Companion */}
      <aside className="w-[420px] flex flex-col border-l border-amber-100">
        {/* Tab Switcher */}
        <div className="flex border-b border-amber-100 bg-[#fbf3e4]">
          <button
            onClick={() => setRightTab('ghost')}
            className={`flex-1 py-3 text-sm font-bold transition ${
              rightTab === 'ghost'
                ? 'text-amber-800 border-b-2 border-amber-500'
                : 'text-stone-400 hover:text-amber-600'
            }`}>
            👻 Ghost in the Shell
          </button>
          <button
            onClick={() => setRightTab('pet')}
            className={`flex-1 py-3 text-sm font-bold transition ${
              rightTab === 'pet'
                ? 'text-amber-800 border-b-2 border-amber-500'
                : 'text-stone-400 hover:text-amber-600'
            }`}>
            🐣 伙伴终端
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {rightTab === 'ghost' ? (
            <GhostBuilder activeFile={activeFile} files={files} onInjected={() => setRefreshKey(k => k + 1)} />
          ) : (
            <div className="h-full p-3 bg-[#f5edde]">
              <PetCompanion files={files} />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
