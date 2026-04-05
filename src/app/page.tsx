'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MonacoPane } from '@/components/editor/MonacoPane';
import { PersonaForm } from '@/components/editor/PersonaForm';
import { PetCompanion } from '@/components/incubator/PetCompanion';
import { DiscoveredFile } from '@/lib/discovery';

export default function Home() {
  const [view, setView] = useState<'incubator' | 'editor'>('incubator');
  const [files, setFiles] = useState<DiscoveredFile[]>([]);
  const [activeFile, setActiveFile] = useState<DiscoveredFile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (view === 'editor') {
      fetch('/api/files').then(r => r.json()).then(d => setFiles(d.files || []));
    }
  }, [view]);

  if (view === 'incubator') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.08),transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="text-8xl mb-8 animate-bounce">🥚</div>
          <h1 className="text-4xl text-purple-500 font-bold mb-2 tracking-[0.2em]">SoulShell</h1>
          <p className="text-gray-500 text-sm mb-2">Agent Persona Visual Terminal</p>
          <p className="text-gray-700 text-xs mb-10 max-w-md text-center">
            Discover, edit, and inject personality into your AI tools.
            One soul, every platform.
          </p>
          <button
            onClick={() => setView('editor')}
            className="px-8 py-3 bg-gradient-to-r from-purple-800 to-blue-800 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-800/60"
          >
            Hatch Your Companion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 font-sans">
      {/* Left: File Tree */}
      <Sidebar files={files} activeId={activeFile?.id || null} onSelect={setActiveFile} />

      {/* Center: Monaco Editor */}
      <main className="flex-1 flex flex-col border-r border-gray-800">
        {activeFile ? (
          <MonacoPane file={activeFile} refreshKey={refreshKey} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3">
            <div className="text-4xl opacity-30">📂</div>
            <p className="text-sm">Select a file from the sidebar</p>
          </div>
        )}
      </main>

      {/* Right: Persona Form + Pet Companion */}
      <aside className="w-96 flex flex-col bg-gray-900">
        <div className="h-[60%] border-b border-gray-800 overflow-hidden">
          <PersonaForm
            activeFile={activeFile}
            onInjected={() => setRefreshKey(k => k + 1)}
          />
        </div>
        <div className="h-[40%] p-3">
          <PetCompanion />
        </div>
      </aside>
    </div>
  );
}
