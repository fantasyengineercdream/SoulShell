'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MonacoPane } from '@/components/editor/MonacoPane';
import { GhostBuilder } from '@/components/editor/GhostBuilder';
import { PetCompanion } from '@/components/incubator/PetCompanion';
import { DiscoveredFile } from '@/lib/discovery';

export default function Home() {
  const [hatched, setHatched] = useState(false);
  const [files, setFiles] = useState<DiscoveredFile[]>([]);
  const [activeFile, setActiveFile] = useState<DiscoveredFile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rightTab, setRightTab] = useState<'ghost' | 'pet'>('pet');

  useEffect(() => {
    const saved = localStorage.getItem('soulshell-hatched');
    if (saved === 'true') { setHatched(true); setRightTab('ghost'); }
  }, []);

  // 始终加载文件（前置页面也要展示检测结果）
  useEffect(() => {
    fetch('/api/files').then(r => r.json()).then(d => setFiles(d.files || []));
  }, []);

  const handleHatched = () => {
    localStorage.setItem('soulshell-hatched', 'true');
    setHatched(true);
  };

  const ccFiles = files.filter(f => f.platform === 'Claude Code' && f.exists);
  const ocFiles = files.filter(f => f.platform === 'OpenClaw' && f.exists);

  // ─── 未孵化：前置页面（带检测摘要）─────────────────
  if (!hatched) {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-[#fff8ef] relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-amber-200/20 animate-[spin_25s_linear_infinite]" />
          <div className="absolute w-[700px] h-[700px] rounded-full bg-amber-100/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="relative mb-8">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-100 soul-glow animate-soul-pulse flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.8),transparent)]" />
              <span className="text-5xl relative z-10">🥚</span>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-amber-900 font-headline tracking-tight mb-2">SoulShell</h1>
          <p className="text-stone-500 text-sm font-medium mb-1">灵魂诞壳 · Agent 人格通用终端</p>
          <p className="text-stone-400 text-xs mb-8 text-center">发现、编辑、注入——让你的 AI 工具拥有灵魂</p>

          {/* ── 检测摘要 ── */}
          <div className="w-full grid grid-cols-2 gap-3 mb-6">
            <div className={`p-4 rounded-xl border ${ccFiles.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-stone-50 border-stone-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span>🔶</span>
                <span className="font-bold text-sm text-stone-700">Claude Code</span>
              </div>
              {ccFiles.length > 0 ? (
                <div className="text-xs text-stone-500 space-y-0.5">
                  <p className="text-green-600 font-semibold">✓ 已检测到 {ccFiles.length} 个文件</p>
                  {ccFiles.map(f => <p key={f.id} className="truncate">· {f.displayName}</p>)}
                </div>
              ) : (
                <p className="text-xs text-stone-400">扫描中...</p>
              )}
            </div>

            <div className={`p-4 rounded-xl border ${ocFiles.length > 0 ? 'bg-green-50 border-green-200' : 'bg-stone-50 border-stone-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span>🦅</span>
                <span className="font-bold text-sm text-stone-700">OpenClaw</span>
              </div>
              {ocFiles.length > 0 ? (
                <div className="text-xs text-stone-500 space-y-0.5">
                  <p className="text-green-600 font-semibold">✓ 已检测到 {ocFiles.length} 个文件</p>
                  {ocFiles.slice(0, 4).map(f => <p key={f.id} className="truncate">· {f.displayName}</p>)}
                  {ocFiles.length > 4 && <p className="text-stone-300">+{ocFiles.length - 4} 更多</p>}
                </div>
              ) : (
                <p className="text-xs text-stone-400">扫描中...</p>
              )}
            </div>
          </div>

          {/* ── 孵化区 ── */}
          <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-5">
            <PetCompanion files={[]} onHatched={handleHatched} fullscreenMode={true} />
          </div>

          {/* ── 前置层占位 ── */}
          <div className="w-full bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 mb-5">
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-2">记忆层接入（即将推出）</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {['mem0', 'Second Me', 'memsearch', 'Twitter', '小红书', 'Obsidian'].map(name => (
                <div key={name} className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-full border border-amber-100 text-[10px] text-stone-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-200" />
                  {name}
                </div>
              ))}
            </div>
            <p className="text-[9px] text-stone-300 text-center mt-2">导入社交媒体、知识库，让灵魂更完整</p>
          </div>

          {/* ── 灵魂孕育占位 ── */}
          <div className="w-full bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-dashed border-amber-200">
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">灵魂孕育引擎（即将推出）</p>
            <p className="text-[9px] text-stone-300">将记忆层各个记忆源按照用户需求整合编排，构建独一无二的灵魂</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── 已孵化：编辑器工作区 ─────────────────────────
  const savedCreature = typeof window !== 'undefined' ? localStorage.getItem('soulshell-creature') : null;
  const savedPetName = typeof window !== 'undefined' ? localStorage.getItem('soulshell-pet-name') : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#fff8ef] relative">
      <Sidebar files={files} activeId={activeFile?.id || null} onSelect={setActiveFile} />

      <main className="flex-1 flex flex-col">
        {activeFile ? (
          <MonacoPane file={activeFile} refreshKey={refreshKey} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-4">
            <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center">
              <span className="text-4xl opacity-40">📂</span>
            </div>
            <p className="text-sm font-medium text-stone-500">从左侧选择一个文件</p>
            <p className="text-xs text-stone-300">查看你的 Agent 怎么认识你</p>
          </div>
        )}
      </main>

      <aside className="w-[420px] flex flex-col border-l border-amber-100">
        {/* 宠物始终可见的头部 */}
        {savedCreature && (
          <div className="flex items-center gap-3 px-4 py-2 bg-[#fbf3e4] border-b border-amber-100">
            <span className="text-2xl">
              {savedCreature === 'dragon' ? '🐲' : savedCreature === 'cat' ? '🐱' : savedCreature === 'owl' ? '🦉' : savedCreature === 'spirit' ? '👻' : '🟢'}
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-900">{savedPetName || '灵魂伙伴'}</p>
              <p className="text-[9px] text-stone-400">如影随形 · 跨平台守护</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        )}

        <div className="flex border-b border-amber-100 bg-[#fbf3e4]">
          <button onClick={() => setRightTab('ghost')}
            className={`flex-1 py-2.5 text-sm font-bold transition ${rightTab === 'ghost' ? 'text-amber-800 border-b-2 border-amber-500' : 'text-stone-400 hover:text-amber-600'}`}>
            👻 灵魂注入
          </button>
          <button onClick={() => setRightTab('pet')}
            className={`flex-1 py-2.5 text-sm font-bold transition ${rightTab === 'pet' ? 'text-amber-800 border-b-2 border-amber-500' : 'text-stone-400 hover:text-amber-600'}`}>
            💬 伙伴对话
          </button>
        </div>
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
