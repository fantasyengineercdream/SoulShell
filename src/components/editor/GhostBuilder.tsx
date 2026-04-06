'use client';
import { useState } from 'react';
import { DiscoveredFile } from '@/lib/discovery';
import { GHOST_TEMPLATES, GhostTemplate } from '@/lib/ghost-templates';
import { Zap, Check, ChevronRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface Props {
  activeFile: DiscoveredFile | null;
  files: DiscoveredFile[];
  onInjected: () => void;
}

type Step = 'gallery' | 'customize' | 'scope' | 'inject';

// 场景暴露矩阵
interface ScopeRow {
  scene: string;
  identity: boolean;
  voice: boolean;
  beliefs: boolean;
  boundaries: boolean;
}

export function GhostBuilder({ activeFile, files, onInjected }: Props) {
  const [step, setStep] = useState<Step>('gallery');
  const [selected, setSelected] = useState<GhostTemplate | null>(null);

  // 自定义素材
  const [userIdentity, setUserIdentity] = useState('');
  const [userMaterials, setUserMaterials] = useState('');

  // 场景暴露矩阵
  const [scopes, setScopes] = useState<ScopeRow[]>([
    { scene: '工作/编码', identity: true, voice: true, beliefs: true, boundaries: true },
    { scene: '私人/日常', identity: true, voice: true, beliefs: false, boundaries: true },
    { scene: '创作/写作', identity: true, voice: false, beliefs: true, boundaries: false },
  ]);

  // 注入目标
  const injectableFiles = files.filter(f => f.injectable && f.exists);
  const [targets, setTargets] = useState<Set<string>>(new Set());

  const [injecting, setInjecting] = useState(false);
  const [injected, setInjected] = useState(false);

  const toggleTarget = (id: string) => {
    setTargets(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleScope = (rowIdx: number, field: keyof Omit<ScopeRow, 'scene'>) => {
    setScopes(prev => prev.map((r, i) =>
      i === rowIdx ? { ...r, [field]: !r[field] } : r
    ));
  };

  const buildPersona = () => {
    if (!selected) return null;
    return {
      identity: selected.soul.identity + (userIdentity ? `\n\n关于用户：${userIdentity}` : ''),
      communication: selected.soul.voice,
      workMode: `核心信念：${selected.soul.coreBeliefs}`,
      forbidden: selected.soul.boundaries,
      expertise: userMaterials || '（用户未填写）',
    };
  };

  const handleInject = async () => {
    const persona = buildPersona();
    if (!persona || targets.size === 0) return;
    setInjecting(true);
    try {
      for (const targetId of targets) {
        const file = files.find(f => f.id === targetId);
        if (!file) continue;
        await fetch('/api/inject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: file.platform, targetPath: file.path, persona }),
        });
      }
      setInjected(true);
      onInjected();
      setTimeout(() => setInjected(false), 3000);
    } finally {
      setInjecting(false);
    }
  };

  // ── Step 1: 模板画廊 ──
  if (step === 'gallery') {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-5 bg-[#fbf3e4]/60">
        <div className="mb-4">
          <h3 className="text-lg font-extrabold text-amber-900 font-headline">Ghost in the Shell</h3>
          <p className="text-xs text-stone-400">选择一个灵魂模板作为起点 · 致敬攻壳机动队</p>
        </div>

        <div className="space-y-3 flex-1">
          {GHOST_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => { setSelected(t); setStep('customize'); }}
              className={`w-full text-left p-4 rounded-xl transition-all group ${
                selected?.id === t.id
                  ? 'bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-400'
                  : 'bg-white hover:bg-amber-50/80 border border-amber-100 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl">{t.icon}</span>
                <span className="font-bold text-amber-900 text-sm">{t.name}</span>
                <ChevronRight size={14} className="ml-auto text-stone-300 group-hover:text-amber-500 transition" />
              </div>
              <p className="text-[11px] text-stone-400 pl-9">{t.tagline}</p>
              <div className="flex gap-1.5 pl-9 mt-2">
                {t.scenes.map(s => (
                  <span key={s} className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* 前置层占位 */}
        <div className="mt-4 p-4 border border-dashed border-amber-200 rounded-xl bg-amber-50/30">
          <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-2">灵魂原料 · 记忆层接入（即将推出）</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {['mem0', 'Second Me', 'memsearch', 'Twitter', '小红书', 'Obsidian'].map(name => (
              <span key={name} className="text-[10px] px-2 py-1 bg-white/60 rounded-full text-stone-400 border border-amber-100">{name}</span>
            ))}
          </div>
          <p className="text-[9px] text-stone-300">导入更丰富的记忆源，让构建的灵魂更贴合真实的你</p>
        </div>
      </div>
    );
  }

  // ── Step 2: 个性化定制 ──
  if (step === 'customize' && selected) {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-5 bg-[#fbf3e4]/60">
        <button onClick={() => setStep('gallery')} className="flex items-center gap-1 text-xs text-stone-400 hover:text-amber-700 mb-3 transition">
          <ArrowLeft size={12} /> 返回模板
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{selected.icon}</span>
          <div>
            <h3 className="font-bold text-amber-900 font-headline">{selected.name}</h3>
            <p className="text-[10px] text-stone-400">{selected.nameEn}</p>
          </div>
        </div>

        {/* 预览人格核心 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 text-xs text-stone-600 leading-relaxed">
          <p className="text-[10px] text-amber-600 font-bold uppercase mb-2">灵魂预览</p>
          <p className="mb-2"><span className="text-amber-800 font-semibold">身份：</span>{selected.soul.identity}</p>
          <p className="mb-2"><span className="text-amber-800 font-semibold">语言：</span>{selected.soul.voice}</p>
          <p><span className="text-amber-800 font-semibold">红线：</span>{selected.soul.boundaries}</p>
        </div>

        {/* 行为校准对比 */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <p className="text-[10px] text-amber-600 font-bold uppercase mb-2">行为校准（好/坏对比）</p>
          <div className="space-y-2 text-[11px]">
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <p className="text-green-700 font-semibold text-[10px] mb-1">✓ 好的回答</p>
              <p className="text-green-900 whitespace-pre-line">{selected.examples.good}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <p className="text-red-700 font-semibold text-[10px] mb-1">✗ 坏的回答</p>
              <p className="text-red-900 whitespace-pre-line">{selected.examples.bad}</p>
            </div>
          </div>
        </div>

        {/* 个人素材 */}
        <div className="mb-4">
          <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">你的身份（可选）</label>
          <textarea value={userIdentity} onChange={e => setUserIdentity(e.target.value)}
            placeholder="你是谁？你希望 AI 怎么对待你？"
            className="w-full bg-white border-none rounded-xl p-3 text-sm text-stone-700 min-h-[48px] focus:ring-2 focus:ring-amber-300 outline-none resize-y shadow-sm" />
        </div>

        <div className="mb-4">
          <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">补充素材（可选）</label>
          <textarea value={userMaterials} onChange={e => setUserMaterials(e.target.value)}
            placeholder="粘贴你的自我介绍、社交媒体 bio、或者技术栈..."
            className="w-full bg-white border-none rounded-xl p-3 text-sm text-stone-700 min-h-[48px] focus:ring-2 focus:ring-amber-300 outline-none resize-y shadow-sm" />
        </div>

        <button onClick={() => setStep('scope')}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full text-white font-bold text-sm shadow-lg shadow-amber-200/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
          下一步：场景控制 <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // ── Step 3: 场景暴露矩阵 ──
  if (step === 'scope' && selected) {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-5 bg-[#fbf3e4]/60">
        <button onClick={() => setStep('customize')} className="flex items-center gap-1 text-xs text-stone-400 hover:text-amber-700 mb-3 transition">
          <ArrowLeft size={12} /> 返回定制
        </button>

        <div className="mb-4">
          <h3 className="font-bold text-amber-900 font-headline">场景暴露矩阵</h3>
          <p className="text-[10px] text-stone-400">控制不同场景下暴露哪些人格维度</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-amber-700 font-bold uppercase">
                <th className="text-left py-2 pr-2">场景</th>
                <th className="text-center py-2 px-1">身份</th>
                <th className="text-center py-2 px-1">语言</th>
                <th className="text-center py-2 px-1">信念</th>
                <th className="text-center py-2 px-1">红线</th>
              </tr>
            </thead>
            <tbody>
              {scopes.map((row, i) => (
                <tr key={row.scene} className="border-t border-amber-50">
                  <td className="py-2.5 pr-2 font-medium text-stone-600">{row.scene}</td>
                  {(['identity', 'voice', 'beliefs', 'boundaries'] as const).map(field => (
                    <td key={field} className="text-center py-2.5 px-1">
                      <button onClick={() => toggleScope(i, field)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                          row[field] ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-300'
                        }`}>
                        {row[field] ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] text-stone-400 mb-4 leading-relaxed">
          不同场景下，你的 AI 可以表现出不同的人格面。例如工作时严谨直接，私人场景时更加温暖随性。
          <br />
          <span className="text-amber-600">（黑客松 Demo：概念展示，后续版本将支持按项目/平台自动切换）</span>
        </p>

        <button onClick={() => setStep('inject')}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full text-white font-bold text-sm shadow-lg shadow-amber-200/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
          下一步：注入灵魂 <Zap size={16} />
        </button>
      </div>
    );
  }

  // ── Step 4: 多平台注入 ──
  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 bg-[#fbf3e4]/60">
      <button onClick={() => setStep('scope')} className="flex items-center gap-1 text-xs text-stone-400 hover:text-amber-700 mb-3 transition">
        <ArrowLeft size={12} /> 返回场景
      </button>

      <div className="mb-4">
        <h3 className="font-bold text-amber-900 font-headline">注入灵魂</h3>
        <p className="text-[10px] text-stone-400">选择要注入的目标，一键让灵魂如影随形</p>
      </div>

      {selected && (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <span className="font-bold text-amber-900 text-sm">{selected.name}</span>
              <p className="text-[11px] text-stone-500">{selected.tagline}</p>
            </div>
          </div>

          {/* 灵魂预览——注入后各平台会变成什么样 */}
          <div className="bg-amber-50 rounded-lg p-3 mb-3">
            <p className="text-[10px] text-amber-800 font-bold mb-2">💫 灵魂预览（注入后生效内容）</p>
            <div className="text-[11px] text-stone-600 space-y-1.5 leading-relaxed">
              <p><span className="text-amber-700 font-semibold">身份：</span>{selected.soul.identity.substring(0, 80)}...</p>
              <p><span className="text-amber-700 font-semibold">语言：</span>{selected.soul.voice.substring(0, 80)}...</p>
              <p><span className="text-amber-700 font-semibold">红线：</span>{selected.soul.boundaries.substring(0, 80)}...</p>
            </div>
          </div>

          {/* 注入前后对比 */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-red-50 rounded-lg p-2 border border-red-100">
              <p className="text-red-600 font-bold mb-1">注入前</p>
              <p className="text-red-800">Agent 使用默认人格，不认识你，不了解你的偏好</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 border border-green-100">
              <p className="text-green-600 font-bold mb-1">注入后</p>
              <p className="text-green-800">Agent 拥有定制灵魂，如影随形，跨平台一致体验</p>
            </div>
          </div>
        </div>
      )}

      {/* 注入目标选择 */}
      <div className="mb-4">
        <p className="text-[10px] text-amber-700 font-bold uppercase mb-2">选择注入目标</p>
        <div className="space-y-2">
          {injectableFiles.map(file => (
            <button key={file.id}
              onClick={() => toggleTarget(file.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs transition ${
                targets.has(file.id)
                  ? 'bg-amber-100 border-2 border-amber-400'
                  : 'bg-white border border-amber-100 hover:border-amber-300'
              }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                targets.has(file.id) ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-300'
              }`}>
                {targets.has(file.id) ? '✓' : ''}
              </div>
              <div>
                <p className="font-semibold text-stone-700">{file.platform} · {file.displayName}</p>
                <p className="text-[10px] text-stone-400">
                  {file.platform === 'Claude Code' ? '追加到文件底部，原内容保留' : '覆写并自动备份 .bak'}
                </p>
              </div>
            </button>
          ))}

          {injectableFiles.length === 0 && (
            <p className="text-xs text-stone-400 text-center py-4">未发现可注入的文件。请确认 Claude Code 或 OpenClaw 已安装。</p>
          )}
        </div>
      </div>

      {/* 注入按钮 */}
      <div className="mt-auto pt-3">
        {injected && (
          <div className="mb-4 bg-gradient-to-r from-amber-100 to-green-100 rounded-xl p-4 text-center animate-[pulse_2s_ease-in-out_infinite]">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-amber-900 font-bold font-headline">灵魂已注入！</p>
            <p className="text-xs text-stone-600 mt-1">你的 AI 工具已拥有新的灵魂。下次对话即刻生效。</p>
            <p className="text-[10px] text-amber-600 mt-2 font-semibold">一个灵魂，如影随形。</p>
          </div>
        )}
        <button onClick={handleInject}
          disabled={targets.size === 0 || !selected || injecting || injected}
          className={`w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            injected
              ? 'bg-green-600 text-white'
              : targets.size > 0 && selected
                ? 'bg-gradient-to-r from-amber-700 to-amber-400 text-white shadow-xl shadow-amber-200/50 hover:scale-[1.02] active:scale-95'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
          }`}>
          {injected
            ? <><Check size={16} /> 灵魂已注入 {targets.size} 个平台</>
            : <><Zap size={16} /> {injecting ? '正在注入灵魂...' : `注入灵魂到 ${targets.size} 个平台`}</>}
        </button>
      </div>
    </div>
  );
}
