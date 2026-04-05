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
    <div className="flex-1 flex flex-col h-full bg-white/40 backdrop-blur-sm">
      {/* Header bar */}
      <div className="h-12 border-b border-amber-100 flex items-center justify-between px-5 bg-[#fbf3e4]/80">
        <span className="text-xs font-mono text-stone-400 truncate max-w-[65%]">{file.path}</span>
        <div className="flex items-center gap-3">
          {file.isReadonly && (
            <span className="text-[10px] bg-stone-200 text-stone-500 px-3 py-1 rounded-full font-semibold uppercase tracking-wider">只读</span>
          )}
          {!file.isReadonly && (
            <button
              onClick={save}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                saved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-200'
              }`}
            >
              {saved ? <><Check size={14} /> 已保存</> : <><Save size={14} /> 保存</>}
            </button>
          )}
        </div>
      </div>

      {/* Warning banner */}
      {file.warning && (
        <div className="bg-amber-50 text-amber-700 text-xs p-3 flex items-center gap-2 border-b border-amber-100">
          <AlertTriangle size={14} /> {file.warning}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-stone-400 text-sm">加载中...</div>
        ) : (
          <Editor
            height="100%"
            language={lang}
            theme="vs"
            value={content}
            onChange={v => setContent(v || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              readOnly: file.isReadonly,
              fontSize: 13,
              lineHeight: 1.7,
              padding: { top: 16 },
              renderLineHighlight: 'none',
              scrollBeyondLastLine: false,
            }}
          />
        )}
      </div>
    </div>
  );
}
