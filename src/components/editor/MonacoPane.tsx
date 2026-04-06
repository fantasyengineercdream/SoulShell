'use client';
import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { DiscoveredFile } from '@/lib/discovery';
import { Save, AlertTriangle, Check, Info, History, RotateCcw } from 'lucide-react';

interface Props {
  file: DiscoveredFile;
  refreshKey?: number;
}

interface Backup {
  name: string;
  path: string;
  time: string;
}

export function MonacoPane({ file, refreshKey }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [reverting, setReverting] = useState(false);

  const fetchContent = useCallback(() => {
    setLoading(true);
    fetch(`/api/file?path=${encodeURIComponent(file.path)}`)
      .then(r => r.json())
      .then(d => { setContent(d.content || ''); setLoading(false); })
      .catch(() => { setContent(''); setLoading(false); });
  }, [file.path]);

  useEffect(() => { fetchContent(); }, [fetchContent, refreshKey]);

  const fetchBackups = async () => {
    const res = await fetch(`/api/file?path=${encodeURIComponent(file.path)}&action=backups`);
    const data = await res.json();
    setBackups(data.backups || []);
  };

  const toggleHistory = () => {
    if (!showHistory) fetchBackups();
    setShowHistory(!showHistory);
  };

  const revert = async (backup: Backup) => {
    setReverting(true);
    const res = await fetch('/api/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revert', path: file.path, backupPath: backup.path }),
    });
    const data = await res.json();
    if (data.content) setContent(data.content);
    setReverting(false);
    setShowHistory(false);
    fetchBackups();
  };

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

  const formatTime = (t: string) => {
    // "2026-04-06T10-30-15-123Z" → "04-06 10:30"
    const match = t.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})/);
    if (match) return `${match[2]}-${match[3]} ${match[4]}:${match[5]}`;
    return t.substring(0, 16);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white/40 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-amber-100 bg-[#fbf3e4]/80 px-5 py-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-amber-900 font-headline">{file.displayName}</span>
            {file.injectable && <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">可注入</span>}
            {file.isReadonly && <span className="text-[9px] bg-stone-200 text-stone-500 px-2 py-0.5 rounded-full font-semibold">只读</span>}
          </div>
          <div className="flex items-center gap-2">
            {/* 历史回退按钮 */}
            {!file.isReadonly && (
              <button onClick={toggleHistory}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  showHistory ? 'bg-amber-200 text-amber-800' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                }`}>
                <History size={12} /> 历史
              </button>
            )}
            {/* 保存按钮 */}
            {!file.isReadonly && (
              <button onClick={save}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  saved ? 'bg-green-100 text-green-700' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-200'
                }`}>
                {saved ? <><Check size={14} /> 已保存</> : <><Save size={14} /> 保存</>}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
          <Info size={10} /> <span>{file.description}</span>
        </div>
      </div>

      {/* 历史备份列表 */}
      {showHistory && (
        <div className="border-b border-amber-100 bg-amber-50/50 px-5 py-3 max-h-40 overflow-y-auto">
          <p className="text-[10px] text-amber-700 font-bold uppercase mb-2">历史版本（点击回退）</p>
          {backups.length === 0 ? (
            <p className="text-xs text-stone-400">暂无历史备份</p>
          ) : (
            <div className="space-y-1">
              {backups.slice(0, 10).map((b, i) => (
                <button key={i} onClick={() => revert(b)} disabled={reverting}
                  className="w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-lg text-xs hover:bg-amber-100 transition text-stone-600 group">
                  <RotateCcw size={11} className="text-amber-500 group-hover:text-amber-700" />
                  <span className="font-mono text-[11px]">{formatTime(b.time)}</span>
                  {i === 0 && <span className="text-[9px] text-amber-500 ml-auto">最近</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warning */}
      {file.warning && (
        <div className="bg-amber-50 text-amber-700 text-xs p-3 flex items-center gap-2 border-b border-amber-100">
          <AlertTriangle size={14} className="shrink-0" /> {file.warning}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-stone-400 text-sm">加载中...</div>
        ) : (
          <Editor height="100%" language={lang} theme="vs" value={content} onChange={v => setContent(v || '')}
            options={{ minimap: { enabled: false }, wordWrap: 'on', readOnly: file.isReadonly, fontSize: 13, lineHeight: 1.7, padding: { top: 16 }, renderLineHighlight: 'none', scrollBeyondLastLine: false }} />
        )}
      </div>
    </div>
  );
}
