'use client';
import { useMemo, useState } from 'react';
import { DiscoveredFile } from '@/lib/discovery';
import { ArrowLeft, Check, Eye, EyeOff, Zap } from 'lucide-react';

interface PersonaData {
  id: string;
  name: string;
  scene: string;
  tone: string;
  boundaries: string;
  goal: string;
  memoryModuleIds: string[];
}

interface SoulCoreData {
  name: string;
  identity: string;
  spirit: string;
  boundaries: string;
  summary: string;
}

interface MemoryModuleData {
  id: string;
  label: string;
  source: string;
  summary: string;
}

interface Props {
  activeFile: DiscoveredFile | null;
  files: DiscoveredFile[];
  masks: PersonaData[];
  selectedMaskId: string;
  soulCore: SoulCoreData;
  memoryModules: MemoryModuleData[];
  onSelectMask: (maskId: string) => void;
  onInjected: () => void;
}

type Step = 'mask' | 'scope' | 'inject';

interface ScopeRow {
  scene: string;
  identity: boolean;
  voice: boolean;
  memory: boolean;
  boundaries: boolean;
}

export function GhostBuilder({
  activeFile,
  files,
  masks,
  selectedMaskId,
  soulCore,
  memoryModules,
  onSelectMask,
  onInjected,
}: Props) {
  const [step, setStep] = useState<Step>('mask');
  const [scopes, setScopes] = useState<ScopeRow[]>([
    { scene: '当前平台', identity: true, voice: true, memory: true, boundaries: true },
    { scene: '跨平台同步', identity: true, voice: true, memory: false, boundaries: true },
    { scene: '敏感场景', identity: true, voice: false, memory: false, boundaries: true },
  ]);
  const [targets, setTargets] = useState<Set<string>>(new Set());
  const [injecting, setInjecting] = useState(false);
  const [injected, setInjected] = useState(false);

  const selectedMask = masks.find((mask) => mask.id === selectedMaskId) || masks[0] || null;
  const activeModules = useMemo(
    () => memoryModules.filter((module) => selectedMask?.memoryModuleIds.includes(module.id)),
    [memoryModules, selectedMask],
  );
  const injectableFiles = files.filter((file) => file.injectable && file.exists);

  const toggleTarget = (id: string) => {
    setTargets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleScope = (rowIdx: number, field: keyof Omit<ScopeRow, 'scene'>) => {
    setScopes((prev) => prev.map((row, index) => (index === rowIdx ? { ...row, [field]: !row[field] } : row)));
  };

  const buildPersona = () => {
    if (!selectedMask) return null;

    return {
      identity: `${soulCore.name}\n\n${soulCore.identity}\n\n场景面具：${selectedMask.name} / ${selectedMask.scene}`,
      communication: selectedMask.tone,
      workMode: `目标：${selectedMask.goal}\n\n记忆模块：${
        activeModules.map((module) => `${module.label}（${module.source}）`).join('、') || '未选择'
      }`,
      forbidden: `${soulCore.boundaries}\n\n场景边界：${selectedMask.boundaries}`,
      expertise: `${soulCore.summary}\n\n精神意象：${soulCore.spirit}`,
    };
  };

  const handleInject = async () => {
    const persona = buildPersona();
    if (!persona || targets.size === 0) return;

    setInjecting(true);
    try {
      for (const targetId of targets) {
        const file = files.find((item) => item.id === targetId);
        if (!file) continue;

        await fetch('/api/inject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: file.platform,
            targetPath: file.path,
            persona,
          }),
        });
      }

      setInjected(true);
      onInjected();
      setTimeout(() => setInjected(false), 3000);
    } finally {
      setInjecting(false);
    }
  };

  if (!selectedMask) {
    return (
      <div className="flex h-full items-center justify-center bg-[#fbf3e4]/60 p-6 text-center text-sm leading-7 text-stone-500">
        先去 Persona 面具页面创建至少一个面具，再回来进行注入。
      </div>
    );
  }

  if (step === 'mask') {
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-[#fbf3e4]/60 p-5">
        <div className="mb-4">
          <h3 className="font-headline text-lg font-extrabold text-amber-900">Ghost In The Shell</h3>
          <p className="text-[11px] text-stone-400">
            这里不再维护另一套人格。Ghost 直接使用 Persona 页面定义的 Soul Core 与 Persona 面具。
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">共享 Soul Core</p>
          <p className="mt-2 text-sm font-extrabold text-amber-950">{soulCore.name}</p>
          <p className="mt-2 text-xs leading-6 text-stone-600">{soulCore.identity}</p>
          <p className="mt-2 text-xs leading-6 text-stone-500">{soulCore.spirit}</p>
        </div>

        <div className="mt-4 flex-1 space-y-3">
          {masks.map((mask) => {
            const isSelected = mask.id === selectedMaskId;
            const linkedModules = memoryModules.filter((module) => mask.memoryModuleIds.includes(module.id));

            return (
              <button
                key={mask.id}
                onClick={() => onSelectMask(mask.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  isSelected ? 'border-amber-300 bg-white shadow-sm' : 'border-amber-100 bg-white/80 hover:border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-amber-950">{mask.name}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">{mask.scene}</p>
                  </div>
                  {isSelected && (
                    <div className="rounded-full bg-amber-900 px-2.5 py-1 text-[10px] font-bold text-white">
                      当前使用
                    </div>
                  )}
                </div>
                <p className="mt-3 text-xs leading-6 text-stone-600">{mask.tone}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {linkedModules.map((module) => (
                    <span
                      key={module.id}
                      className="rounded-full bg-[#fbf3e4] px-3 py-1 text-[10px] font-bold text-stone-700"
                    >
                      {module.label}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setStep('scope')}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-amber-700 to-amber-400 py-3 text-sm font-bold text-white shadow-lg shadow-amber-200/50 transition hover:scale-[1.02] active:scale-95"
        >
          下一步：场景暴露控制
        </button>
      </div>
    );
  }

  if (step === 'scope') {
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-[#fbf3e4]/60 p-5">
        <button
          onClick={() => setStep('mask')}
          className="mb-3 flex items-center gap-1 text-xs text-stone-400 transition hover:text-amber-700"
        >
          <ArrowLeft size={12} /> 返回面具
        </button>

        <div className="mb-4">
          <h3 className="font-headline text-lg font-extrabold text-amber-900">场景暴露矩阵</h3>
          <p className="text-[11px] text-stone-400">
            同一个 Persona 面具，在不同场景下可以暴露不同程度的身份、语气、记忆和边界。
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-extrabold text-amber-950">{selectedMask.name}</p>
          <p className="mt-2 text-xs leading-6 text-stone-600">{selectedMask.goal}</p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase text-amber-700">
                <th className="py-2 pr-2 text-left">场景</th>
                <th className="px-1 py-2 text-center">身份</th>
                <th className="px-1 py-2 text-center">语气</th>
                <th className="px-1 py-2 text-center">记忆</th>
                <th className="px-1 py-2 text-center">边界</th>
              </tr>
            </thead>
            <tbody>
              {scopes.map((row, rowIndex) => (
                <tr key={row.scene} className="border-t border-amber-50">
                  <td className="py-2.5 pr-2 font-medium text-stone-600">{row.scene}</td>
                  {(['identity', 'voice', 'memory', 'boundaries'] as const).map((field) => (
                    <td key={field} className="px-1 py-2.5 text-center">
                      <button
                        onClick={() => toggleScope(rowIndex, field)}
                        className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                          row[field] ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-300'
                        }`}
                      >
                        {row[field] ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">当前注入预览</p>
          <div className="mt-3 space-y-2 text-xs leading-6 text-stone-700">
            <p>共享内核：{soulCore.name}</p>
            <p>场景面具：{selectedMask.name}</p>
            <p>记忆模块：{activeModules.map((module) => module.label).join('、') || '未选择'}</p>
            <p>边界：{selectedMask.boundaries}</p>
          </div>
        </div>

        <button
          onClick={() => setStep('inject')}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-amber-700 to-amber-400 py-3 text-sm font-bold text-white shadow-lg shadow-amber-200/50 transition hover:scale-[1.02] active:scale-95"
        >
          下一步：注入灵魂
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#fbf3e4]/60 p-5">
      <button
        onClick={() => setStep('scope')}
        className="mb-3 flex items-center gap-1 text-xs text-stone-400 transition hover:text-amber-700"
      >
        <ArrowLeft size={12} /> 返回场景
      </button>

      <div className="mb-4">
        <h3 className="font-headline text-lg font-extrabold text-amber-900">注入灵魂</h3>
        <p className="text-[11px] text-stone-400">
          使用 Persona 页面已经定义好的面具，把同一套人格结构注入到目标 Agent。
        </p>
      </div>

      <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-extrabold text-amber-950">{selectedMask.name}</p>
        <p className="mt-2 text-xs leading-6 text-stone-600">{selectedMask.scene}</p>
        <div className="mt-3 rounded-lg bg-amber-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-800">灵魂预览</p>
          <div className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-stone-700">
            <p>
              <span className="font-semibold text-amber-700">Soul Core：</span>
              {soulCore.name}
            </p>
            <p>
              <span className="font-semibold text-amber-700">语气：</span>
              {selectedMask.tone}
            </p>
            <p>
              <span className="font-semibold text-amber-700">记忆模块：</span>
              {activeModules.map((module) => module.label).join('、') || '未选择'}
            </p>
            <p>
              <span className="font-semibold text-amber-700">边界：</span>
              {selectedMask.boundaries}
            </p>
            {activeFile && (
              <p>
                <span className="font-semibold text-amber-700">当前文件：</span>
                {activeFile.displayName}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">选择注入目标</p>
        <div className="space-y-2">
          {injectableFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => toggleTarget(file.id)}
              className={`w-full rounded-xl border p-3 text-left text-xs transition ${
                targets.has(file.id) ? 'border-amber-300 bg-amber-100' : 'border-amber-100 bg-white hover:border-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                    targets.has(file.id) ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-300'
                  }`}
                >
                  {targets.has(file.id) ? '✓' : ''}
                </div>
                <div>
                  <p className="font-semibold text-stone-700">
                    {file.platform} · {file.displayName}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    仅替换 SoulShell 注入区块，不覆盖原文件正文。
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4">
        {injected && (
          <div className="mb-4 rounded-xl bg-gradient-to-r from-amber-100 to-green-100 p-4 text-center">
            <div className="mb-2 text-3xl">✓</div>
            <p className="font-headline font-bold text-amber-900">灵魂已注入</p>
            <p className="mt-1 text-xs text-stone-600">注入内容来自 Persona 页面正在管理的同一张面具。</p>
          </div>
        )}

        <button
          onClick={handleInject}
          disabled={targets.size === 0 || injecting || injected}
          className={`w-full rounded-full py-3.5 text-sm font-bold transition-all ${
            injected
              ? 'bg-green-600 text-white'
              : targets.size > 0
                ? 'bg-gradient-to-r from-amber-700 to-amber-400 text-white shadow-xl shadow-amber-200/50 hover:scale-[1.02] active:scale-95'
                : 'cursor-not-allowed bg-stone-300 text-stone-500'
          }`}
        >
          {injected ? (
            <span className="inline-flex items-center gap-2">
              <Check size={16} /> 灵魂已注入 {targets.size} 个目标
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Zap size={16} /> {injecting ? '正在注入灵魂...' : `注入灵魂到 ${targets.size} 个目标`}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
