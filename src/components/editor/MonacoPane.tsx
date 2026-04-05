'use client';
import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { DiscoveredFile } from '@/lib/discovery';
import { Save, AlertTriangle, Check } from 'lucide-react';

interface Props {
  file: DiscoveredFile;
  refreshKey?: number;
}

export function MonacoPane({ file, refreshKey }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const fetchContent = useCallback(() => {
    setLoading(true);
    fetch(`/api/file?path=${encodeURIComponent(file.path)}`)
      .then(r => r.json())
      .then(d => { setContent(d.content || ''); setLoading(false); })
      .catch(() => { setContent(''); setLoading(false); });
  }, [file.path]);

  useEffect(() => { fetchContent(); }, [fetchContent, refreshKey]);

  const save = async () => {
    if (file.isReadonly) return;
    await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: file.path, content }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const lang = file.name.endsWith('.json') ? 'json'
    : file.name.endsWith('.toml') ? 'toml'
    : 'markdown';

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-950">
        <span className="text-xs font-mono text-gray-500 truncate max-w-[70%]">{file.path}</span>
        <div className="flex items-center gap-2">
          {file.isReadonly && <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded">READ ONLY</span>}
          {!file.isReadonly && (
            <button
              onClick={save}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                saved
                  ? 'bg-green-800 text-green-300'
                  : 'bg-purple-700 hover:bg-purple-600 text-white'
              }`}
            >
              {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}
            </button>
          )}
        </div>
      </div>

      {file.warning && (
        <div className="bg-yellow-900/20 text-yellow-500 text-xs p-2.5 flex items-center gap-2 border-b border-yellow-900/30">
          <AlertTriangle size={14} /> {file.warning}
        </div>
      )}

      <div className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm">Loading...</div>
        ) : (
          <Editor
            height="100%"
            language={lang}
            theme="vs-dark"
            value={content}
            onChange={v => setContent(v || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              readOnly: file.isReadonly,
              fontSize: 13,
              lineHeight: 1.6,
              padding: { top: 12 },
            }}
          />
        )}
      </div>
    </div>
  );
}
