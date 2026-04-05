'use client';
import { useState } from 'react';

export default function Home() {
  const [view, setView] = useState<'incubator' | 'editor'>('incubator');

  if (view === 'incubator') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
        <h1 className="text-4xl text-purple-500 font-bold mb-8 tracking-widest">SoulShell Incubator</h1>
        <button onClick={() => setView('editor')} className="px-6 py-3 bg-purple-900 rounded hover:bg-purple-800 transition">
          Hatch Soul
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <aside className="w-64 border-r border-gray-800 bg-gray-900 p-4">File Tree</aside>
      <main className="flex-1 flex flex-col border-r border-gray-800">
        <header className="h-12 border-b border-gray-800 flex items-center px-4">Raw Editor</header>
        <div className="flex-1 p-4">Monaco Pane</div>
      </main>
      <aside className="w-96 flex flex-col bg-gray-900">
        <div className="h-1/2 border-b border-gray-800 p-4 overflow-y-auto">Persona Form</div>
        <div className="h-1/2 p-4 flex flex-col">Pet Companion Terminal</div>
      </aside>
    </div>
  );
}
