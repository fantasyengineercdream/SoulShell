'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MonacoPane } from '@/components/editor/MonacoPane';
import { GhostBuilder } from '@/components/editor/GhostBuilder';
import { PetCompanion } from '@/components/incubator/PetCompanion';
import { DiscoveredFile } from '@/lib/discovery';

type WorkspaceTab = 'sources' | 'incubator' | 'persona' | 'ghost' | 'pet';
type SourceKey = 'Claude Code' | 'OpenClaw' | 'mem0' | 'Second Me' | 'Twitter' | 'Obsidian';
type IncubatorMode = '稳定陪伴' | '开发协作' | '创作表达';
type MemoryModule = {
  id: string;
  label: string;
  source: string;
  summary: string;
};
type PersonaMask = {
  id: string;
  name: string;
  scene: string;
  tone: string;
  boundaries: string;
  goal: string;
  memoryModuleIds: string[];
};
type SoulCore = {
  name: string;
  identity: string;
  spirit: string;
  boundaries: string;
  summary: string;
};

const currentTabs: Array<{ id: WorkspaceTab; title: string; body: string }> = [
  { id: 'ghost', title: 'Ghost In The Shell', body: '当前主入口：查看、编辑、注入' },
  { id: 'pet', title: '伙伴终端', body: '测试对话与陪伴形态' },
];

const futureTabs: Array<{ id: WorkspaceTab; title: string; body: string }> = [
  { id: 'sources', title: '前置层', body: '接入记忆源与个人资料' },
  { id: 'incubator', title: '灵魂孕育', body: '把原料整理成灵魂 core' },
  { id: 'persona', title: 'Persona 面具', body: '按场景编辑不同人格' },
];

export default function Home() {
  const [hatched, setHatched] = useState(false);
  const [files, setFiles] = useState<DiscoveredFile[]>([]);
  const [activeFile, setActiveFile] = useState<DiscoveredFile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('ghost');
  const [selectedSource, setSelectedSource] = useState<SourceKey>('Claude Code');
  const [incubatorMode, setIncubatorMode] = useState<IncubatorMode>('稳定陪伴');
  const [incubatorSettings, setIncubatorSettings] = useState({
    keepBoundaries: true,
    preserveWritingStyle: true,
    allowPrivateMaterial: false,
  });
  const [soulCore, setSoulCore] = useState<SoulCore>({
    name: '如影随形的伙伴',
    identity: '长期陪伴用户、跨工具存在、可在不同场景代表用户行动的 AI 伙伴。',
    spirit: '可以是数码宝贝伙伴，也可以是黑暗物质的精灵。',
    boundaries: '安全、可回退、有边界感；不覆盖原文件；不擅自越权。',
    summary: '一个共享的灵魂内核，供不同 Persona 面具在不同场景中调用。',
  });
  const [personaMasks, setPersonaMasks] = useState<PersonaMask[]>([
    {
      id: 'mask-dev',
      name: '开发人格',
      scene: '编程 / 调试 / 重构',
      tone: '直接、清晰、认真负责，不花哨，不含糊。',
      boundaries: '不覆盖用户原文件；高风险操作先提示；保留回退路径。',
      goal: '稳定完成编码、重构、排查和注入任务。',
      memoryModuleIds: ['module-rules', 'module-codebase', 'module-feedback'],
    },
    {
      id: 'mask-companion',
      name: '陪伴人格',
      scene: '陪伴 / 对话 / 自我整理',
      tone: '温和、理解你、有回应感，但不过度越界。',
      boundaries: '不替用户下判断，不暴露敏感资料，不制造情绪依赖。',
      goal: '成为如影随形的伙伴与测试终端。',
      memoryModuleIds: ['module-profile', 'module-emotion', 'module-feedback'],
    },
  ]);
  const [selectedPersonaId, setSelectedPersonaId] = useState('mask-dev');

  // 始终加载文件（前置页面也要展示检测结果）
  useEffect(() => {
    localStorage.removeItem('soulshell-hatched');
    localStorage.removeItem('soulshell-creature');
    localStorage.removeItem('soulshell-pet-name');
    fetch('/api/files').then(r => r.json()).then(d => setFiles(d.files || []));
  }, []);

  const handleHatched = () => {
    setWorkspaceTab('ghost');
    setHatched(true);
  };

  const handleBackToLanding = () => {
    localStorage.removeItem('soulshell-hatched');
    setActiveFile(null);
    setWorkspaceTab('ghost');
    setHatched(false);
  };

  const ccFiles = files.filter(f => f.platform === 'Claude Code' && f.exists);
  const ocFiles = files.filter(f => f.platform === 'OpenClaw' && f.exists);
  const sourcePreviewMap: Record<SourceKey, { summary: string; items: string[]; notes: string[] }> = {
    'Claude Code': {
      summary: '已发现项目级与工具级人格/记忆文件，可直接进入后续灵魂构建。',
      items: ccFiles.length > 0 ? ccFiles.slice(0, 4).map((file) => `${file.displayName} · ${file.category}`) : ['CLAUDE.md · 项目规则', 'MEMORY.md · 记忆索引', 'project memory · 项目记忆'],
      notes: ['适合提取规则、反馈与项目偏好', '优先保留用户明确写下的要求'],
    },
    'OpenClaw': {
      summary: '已发现本地 SOUL / USER 等结构，适合作为陪伴式人格与用户认知原料。',
      items: ocFiles.length > 0 ? ocFiles.slice(0, 4).map((file) => `${file.displayName} · ${file.category}`) : ['SOUL.md · 灵魂定义', 'USER.md · 用户画像', 'memory · 本地陪伴记忆'],
      notes: ['强调本地陪伴关系', '适合补充陪伴人格与长期关系设定'],
    },
    mem0: {
      summary: '作为长期记忆层接入，补充跨工具稳定知识。',
      items: ['长期偏好', '稳定事实', '跨会话背景', '结构化记忆片段'],
      notes: ['不替代 Agent 本地结构', '作为上游记忆原料进入孕育层'],
    },
    'Second Me': {
      summary: '补充数字分身和长期画像，帮助形成更完整的人格基底。',
      items: ['自我介绍', '长期画像', '表达倾向', '价值观片段'],
      notes: ['更像长期画像源', '适合生成全局灵魂内核'],
    },
    Twitter: {
      summary: '采集公开表达与内容风格，帮助创作人格保持语气一致。',
      items: ['公开发言', '表达风格', '选题偏好', '常用句式'],
      notes: ['只取公开信息', '更适合创作人格，不默认全量暴露'],
    },
    Obsidian: {
      summary: '接入个人知识库后，可将知识与记忆分层管理。',
      items: ['知识卡片', '项目笔记', '长期主题', '素材索引'],
      notes: ['适合作为知识型原料', '可按库或按目录授权'],
    },
  };
  const activeSourcePreview = sourcePreviewMap[selectedSource];
  const generatedMemoryModules: MemoryModule[] = [
    { id: 'module-rules', label: '项目规则模块', source: 'Claude Code', summary: '来自 CLAUDE.md / 项目级规则与工作方式。' },
    { id: 'module-codebase', label: '代码库记忆模块', source: 'Claude Code', summary: '来自项目记忆、历史纠正与代码库认知。' },
    { id: 'module-feedback', label: '用户反馈模块', source: 'Claude Code + OpenClaw', summary: '来自用户纠正、偏好确认与长期反馈。' },
    { id: 'module-profile', label: '用户画像模块', source: 'OpenClaw / Second Me', summary: '来自用户身份、长期画像与自我描述。' },
    { id: 'module-emotion', label: '情绪边界模块', source: 'OpenClaw', summary: '来自陪伴关系、边界设置与情绪处理方式。' },
    { id: 'module-creative', label: '创作素材模块', source: 'Twitter / Obsidian', summary: '来自公开表达、素材库与写作习惯。' },
  ];
  const fallbackPersona: PersonaMask = {
    id: 'fallback',
    name: '默认面具',
    scene: '默认场景',
    tone: '直接、清晰、稳定。',
    boundaries: soulCore.boundaries,
    goal: '作为兜底人格，避免页面因空状态崩溃。',
    memoryModuleIds: ['module-feedback'],
  };
  const activePersona = personaMasks.find((mask) => mask.id === selectedPersonaId) || personaMasks[0] || fallbackPersona;

  useEffect(() => {
    if (personaMasks.length > 0 && !personaMasks.some((mask) => mask.id === selectedPersonaId)) {
      setSelectedPersonaId(personaMasks[0].id);
    }
  }, [personaMasks, selectedPersonaId]);

  const updateActivePersona = (field: keyof Omit<PersonaMask, 'id' | 'memoryModuleIds'>, value: string) => {
    setPersonaMasks((prev) =>
      prev.map((mask) => (mask.id === selectedPersonaId ? { ...mask, [field]: value } : mask)),
    );
  };

  const togglePersonaMemoryModule = (moduleId: string) => {
    setPersonaMasks((prev) =>
      prev.map((mask) =>
        mask.id === selectedPersonaId
          ? {
              ...mask,
              memoryModuleIds: mask.memoryModuleIds.includes(moduleId)
                ? mask.memoryModuleIds.filter((id) => id !== moduleId)
                : [...mask.memoryModuleIds, moduleId],
            }
          : mask,
      ),
    );
  };

  const addPersonaMask = () => {
    const nextId = `mask-${Date.now()}`;
    setPersonaMasks((prev) => [
      ...prev,
      {
        id: nextId,
        name: `新面具 ${prev.length + 1}`,
        scene: '新场景',
        tone: '定义这个场景下的语气与态度。',
        boundaries: soulCore.boundaries,
        goal: '定义这个面具要完成的目标。',
        memoryModuleIds: ['module-feedback'],
      },
    ]);
    setSelectedPersonaId(nextId);
  };

  // ─── 未孵化：前置页面（带检测摘要）─────────────────
  if (!hatched) {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-[#fff8ef] relative">
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <Link href="/pitch" className="inline-flex items-center rounded-full border border-amber-200 bg-white/85 px-4 py-2 text-sm font-bold text-amber-900 shadow-sm transition hover:bg-amber-50">展示页</Link>
        </div>
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
            <PetCompanion files={[]} onHatched={handleHatched} fullscreenMode={true} usePersistedState={false} />
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

  // ─── 已孵化：产品总览页 ─────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#fff8ef]">
      <div className="flex items-center justify-end gap-2 border-b border-amber-100 bg-white/65 px-4 py-4 backdrop-blur-sm">
        <button
          onClick={handleBackToLanding}
          className="inline-flex items-center rounded-full border border-amber-200 bg-white/90 px-4 py-2 text-sm font-bold text-amber-900 shadow-sm transition hover:bg-amber-50"
        >
          返回 Landing
        </button>
        <Link
          href="/pitch"
          className="inline-flex items-center rounded-full border border-amber-200 bg-white/90 px-4 py-2 text-sm font-bold text-amber-900 shadow-sm transition hover:bg-amber-50"
        >
          展示页
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="w-[260px] overflow-y-auto border-r border-amber-100 bg-[#fbf3e4]/80 p-5 backdrop-blur-sm">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-700">Product Overview</p>
            <h2 className="mt-2 font-headline text-3xl font-extrabold text-amber-950">SoulShell</h2>
            <p className="mt-2 text-xs leading-6 text-stone-500">孵化完成后，进入产品总览页，再切到不同模块。</p>
          </div>

          <div className="space-y-3">
            {[...currentTabs, ...futureTabs].map(({ id, title, body }) => (
              <button
                key={id}
                onClick={() => setWorkspaceTab(id)}
                className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                  workspaceTab === id
                    ? 'border-amber-300 bg-white text-amber-950 shadow-sm'
                    : 'border-amber-100 bg-white/55 text-stone-600 hover:bg-white/80'
                }`}
              >
                <p className="text-sm font-extrabold">{title}</p>
                <p className="mt-1 text-[11px] leading-5 opacity-80">{body}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-amber-100 bg-white/70 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">Detected</p>
            <div className="mt-3 space-y-2 text-xs text-stone-600">
              <div className="flex items-center justify-between rounded-xl bg-[#fff8ef] px-3 py-2">
                <span>Claude Code</span>
                <span className="font-bold text-amber-900">{ccFiles.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#fff8ef] px-3 py-2">
                <span>OpenClaw</span>
                <span className="font-bold text-amber-900">{ocFiles.length}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden">
          {workspaceTab === 'sources' && (
            <div className="h-full overflow-y-auto px-8 py-10">
            <div className="max-w-6xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">前置层</p>
              <h3 className="mt-3 font-headline text-4xl font-extrabold text-amber-950">灵魂原料接入</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                先接入用户已经存在的资料，再决定哪些信息会进入灵魂系统。不是要求用户从零重填一遍自己。
              </p>

              <div className="mt-8 rounded-[30px] border border-amber-100 bg-white/72 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 rounded-[24px] bg-[#fbf3e4] px-4 py-3">
                  {['选择资料源', '确认读取范围', '进入灵魂孕育'].map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${index < 2 ? 'bg-amber-900 text-white' : 'bg-amber-100 text-amber-800'}`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-bold text-stone-700">{step}</span>
                      {index < 2 && <div className="hidden h-px w-10 bg-amber-300 sm:block" />}
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.08fr_0.78fr]">
                  <div className="rounded-[26px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">资料源列表</p>
                        <p className="mt-1 text-sm text-stone-500">按需接入，不强制用户重填</p>
                      </div>
                      <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">已发现本地源</div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        ['Claude Code', '本地人格与记忆文件', `${ccFiles.length} 个文件`, true],
                        ['OpenClaw', '本地 SOUL / USER 配置', `${ocFiles.length} 个文件`, true],
                        ['mem0', '长期记忆层', '待接入', false],
                        ['Second Me', '数字分身画像', '待接入', false],
                        ['Twitter', '公开表达与 persona 素材', '待接入', false],
                        ['Obsidian', '个人知识库', '待接入', false],
                      ].map(([name, desc, status, ready]) => (
                        <button
                          key={String(name)}
                          onClick={() => setSelectedSource(name as SourceKey)}
                          className={`w-full rounded-[22px] border p-4 text-left transition ${
                            selectedSource === name
                              ? 'border-amber-300 bg-[#fff8ef] shadow-sm'
                              : 'border-amber-100 bg-[#fffaf2] hover:border-amber-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-extrabold text-amber-950">{name}</p>
                              <p className="mt-1 text-xs leading-5 text-stone-500">{desc}</p>
                            </div>
                            <div className={`rounded-full px-3 py-1 text-[11px] font-bold ${ready ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                              {status}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-[11px] text-stone-400">{ready ? '仅读取必要结构' : '保留扩展接口'}</div>
                            <button className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${ready ? 'bg-amber-900 text-white' : 'border border-amber-200 bg-white text-amber-900'}`}>
                              {ready ? '已启用' : '接入'}
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">已收集内容预览</p>
                        <p className="mt-1 text-sm text-stone-500">点击左侧资料源，查看会被收集的具体内容</p>
                      </div>
                      <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">{selectedSource}</div>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-amber-100 bg-[#fffaf2] p-4">
                      <p className="text-sm font-extrabold text-amber-950">{activeSourcePreview.summary}</p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {activeSourcePreview.items.map((item) => (
                          <div key={item} className="rounded-[18px] border border-amber-100 bg-white px-4 py-3">
                            <p className="text-sm font-bold text-stone-700">{item}</p>
                            <p className="mt-1 text-[11px] text-stone-400">将作为可选原料进入后续灵魂孕育</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[22px] border border-dashed border-amber-200 bg-[#fbf3e4] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">隐私控制</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {['可暴露给所有 Persona', '只保留在本地', '仅开发人格可见', '仅陪伴人格可见'].map((item) => (
                          <div key={item} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-stone-700">{item}</div>
                        ))}
                      </div>
                      <div className="mt-4 space-y-2">
                        {activeSourcePreview.notes.map((note) => (
                          <div key={note} className="rounded-xl bg-white px-3 py-2 text-xs text-stone-600">{note}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(255,241,214,0.92))] p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">本轮接入结果</p>
                    <div className="mt-4 rounded-[22px] bg-white/80 p-4">
                      <p className="text-sm font-extrabold text-amber-950">用户画像原料包</p>
                      <div className="mt-4 space-y-3 text-xs text-stone-600">
                        <div className="flex items-center justify-between rounded-xl bg-[#fbf3e4] px-3 py-2">
                          <span>工具级人格文件</span>
                          <span className="font-bold text-amber-900">{ccFiles.length + ocFiles.length}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-[#fbf3e4] px-3 py-2">
                          <span>可进入灵魂孕育</span>
                          <span className="font-bold text-amber-900">4 类原料</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-[#fbf3e4] px-3 py-2">
                          <span>隐私边界</span>
                          <span className="font-bold text-amber-900">已标记</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setWorkspaceTab('incubator')}
                      className="mt-4 w-full rounded-full bg-amber-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
                    >
                      进入灵魂孕育
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {workspaceTab === 'incubator' && (
          <div className="h-full overflow-y-auto px-8 py-10">
            <div className="max-w-6xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">灵魂孕育</p>
              <h3 className="mt-3 font-headline text-4xl font-extrabold text-amber-950">把分散原料整理成灵魂内核</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                这一页不再只是解释流程，而是模拟“原料池 → 编排规则 → 灵魂 core 输出”的工作台。
              </p>

              <div className="mt-8 rounded-[30px] border border-amber-100 bg-white/72 p-4 shadow-sm">
                <div className="grid gap-5 xl:grid-cols-[0.84fr_0.9fr_1.06fr]">
                  <div className="rounded-[26px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">原料池</p>
                    <p className="mt-1 text-sm text-stone-500">从前置层带过来的可用素材，可按目标重新编排</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(['稳定陪伴', '开发协作', '创作表达'] as IncubatorMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setIncubatorMode(mode)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            incubatorMode === mode ? 'bg-amber-900 text-white' : 'border border-amber-200 bg-white text-amber-900'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        ['用户偏好', '来自 Claude Code / OpenClaw 的纠正与风格要求'],
                        ['长期记忆', '以后可从 mem0 / Second Me 接入'],
                        ['场景素材', '社交媒体表达、写作偏好、项目资料'],
                        ['边界与红线', '哪些信息可暴露，哪些只留在本地'],
                      ].map(([title, body]) => (
                        <div key={title} className="rounded-[20px] border border-amber-100 bg-[#fffaf2] p-4">
                          <p className="text-sm font-extrabold text-amber-950">{title}</p>
                          <p className="mt-2 text-xs leading-6 text-stone-500">{body}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">编排面板</p>
                    <p className="mt-1 text-sm text-stone-500">用户在这里决定保留什么、隐藏什么、优先生成什么人格倾向</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {[
                        ['保留人格边界', 'keepBoundaries'],
                        ['保留写作风格', 'preserveWritingStyle'],
                        ['允许私人素材进入 core', 'allowPrivateMaterial'],
                      ].map(([label, key]) => (
                        <button
                          key={key}
                          onClick={() =>
                            setIncubatorSettings((prev) => ({
                              ...prev,
                              [key]: !prev[key as keyof typeof prev],
                            }))
                          }
                          className="flex items-center justify-between rounded-[18px] border border-amber-100 bg-[#fffaf2] px-4 py-3 text-sm font-bold text-stone-700"
                        >
                          <span>{label}</span>
                          <span className={`h-5 w-9 rounded-full p-0.5 ${incubatorSettings[key as keyof typeof incubatorSettings] ? 'bg-amber-900' : 'bg-stone-300'}`}>
                            <span className={`block h-4 w-4 rounded-full bg-white transition ${incubatorSettings[key as keyof typeof incubatorSettings] ? 'translate-x-4' : ''}`} />
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        ['提取有效记忆', '保留稳定偏好，剔除临时噪音'],
                        ['整理人格边界', '明确不能越过的红线'],
                        ['形成全局灵魂 core', '沉淀长期稳定的伙伴内核'],
                        ['分发给 Persona', '让不同场景调用不同记忆片段'],
                      ].map(([title, body], index) => (
                        <div key={title} className="flex gap-3 rounded-[20px] bg-[#fbf3e4] p-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-900 text-xs font-black text-white">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-amber-950">{title}</p>
                            <p className="mt-1 text-xs leading-6 text-stone-600">{body}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-[20px] border border-dashed border-amber-200 bg-white p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">产出格式</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['灵魂 core', '场景记忆包', '边界清单', 'Persona 草案'].map((item) => (
                          <span key={item} className="rounded-full bg-[#fbf3e4] px-3 py-1.5 text-[11px] font-bold text-stone-700">{item}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[20px] border border-amber-100 bg-[#fffaf2] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">当前选择</p>
                      <div className="mt-3 space-y-2 text-xs text-stone-700">
                        <div className="rounded-xl bg-white px-3 py-2">目标模式：{incubatorMode}</div>
                        <div className="rounded-xl bg-white px-3 py-2">边界保留：{incubatorSettings.keepBoundaries ? '开启' : '关闭'}</div>
                        <div className="rounded-xl bg-white px-3 py-2">写作风格：{incubatorSettings.preserveWritingStyle ? '保留' : '不优先保留'}</div>
                        <div className="rounded-xl bg-white px-3 py-2">私人素材进入 core：{incubatorSettings.allowPrivateMaterial ? '允许' : '禁止'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,249,240,0.98),rgba(255,233,187,0.82))] p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">灵魂 core 输出</p>
                        <h4 className="mt-2 font-headline text-3xl font-extrabold text-amber-950">如影随形的伙伴</h4>
                      </div>
                      <div className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-amber-800">已生成预览</div>
                    </div>

                    <div className="mt-5 rounded-[22px] border border-amber-200 bg-white/84 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">精神意象</p>
                      <p className="mt-2 text-sm leading-7 text-stone-700">
                        可以是数码宝贝伙伴，也可以是黑暗物质的精灵。重点不是形象，而是用户对“始终陪在身边的伙伴”的精神需求。
                      </p>
                    </div>

                    <div className="mt-4 rounded-[22px] border border-amber-200 bg-white/84 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">内核摘要</p>
                      <div className="mt-3 space-y-2 text-sm text-stone-700">
                        <div className="rounded-xl bg-[#fbf3e4] px-3 py-2">当前模式：{incubatorMode}</div>
                        <div className="rounded-xl bg-[#fbf3e4] px-3 py-2">核心要求：{incubatorSettings.keepBoundaries ? '安全、可回退、有边界感' : '允许更激进的个性暴露'}</div>
                        <div className="rounded-xl bg-[#fbf3e4] px-3 py-2">写作风格：{incubatorSettings.preserveWritingStyle ? '继承用户表达习惯' : '以任务效率优先'}</div>
                        <div className="rounded-xl bg-[#fbf3e4] px-3 py-2">私人素材：{incubatorSettings.allowPrivateMaterial ? '可进入内核' : '仅作场景调用'}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setWorkspaceTab('persona')}
                      className="mt-4 w-full rounded-full bg-amber-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
                    >
                      进入 Persona 面具
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {workspaceTab === 'persona' && (
          <div className="h-full overflow-y-auto px-8 py-10">
            <div className="max-w-6xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">Persona 面具</p>
              <h3 className="mt-3 font-headline text-4xl font-extrabold text-amber-950">一个灵魂内核，对应不同场景的人格面具</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                这里管理的面具会直接进入 Ghost In The Shell，不再是另一套独立系统。记忆调用也来自前置层与灵魂孕育阶段产出的模块，而不是重新手写。
              </p>

              <div className="mt-8 rounded-[30px] border border-amber-100 bg-white/72 p-4 shadow-sm">
                <div className="mt-1 grid gap-5 xl:grid-cols-[0.9fr_0.76fr_1.14fr]">
                  <div className="rounded-[26px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Soul Core</p>
                        <p className="mt-1 text-sm text-stone-500">所有 Persona 共享的全局灵魂内核</p>
                      </div>
                      <div className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">全局</div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">灵魂名称</p>
                        <input
                          value={soulCore.name}
                          onChange={(e) => setSoulCore((prev) => ({ ...prev, name: e.target.value }))}
                          className="mt-2 w-full rounded-[16px] border border-amber-100 bg-[#fffaf2] px-4 py-3 text-sm text-stone-700 outline-none focus:border-amber-300"
                        />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">核心身份</p>
                        <textarea
                          value={soulCore.identity}
                          onChange={(e) => setSoulCore((prev) => ({ ...prev, identity: e.target.value }))}
                          className="mt-2 min-h-[82px] w-full rounded-[18px] border border-amber-100 bg-[#fffaf2] px-4 py-3 text-sm leading-7 text-stone-700 outline-none focus:border-amber-300"
                        />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">精神意象</p>
                        <textarea
                          value={soulCore.spirit}
                          onChange={(e) => setSoulCore((prev) => ({ ...prev, spirit: e.target.value }))}
                          className="mt-2 min-h-[72px] w-full rounded-[18px] border border-amber-100 bg-[#fffaf2] px-4 py-3 text-sm leading-7 text-stone-700 outline-none focus:border-amber-300"
                        />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">全局边界</p>
                        <textarea
                          value={soulCore.boundaries}
                          onChange={(e) => setSoulCore((prev) => ({ ...prev, boundaries: e.target.value }))}
                          className="mt-2 min-h-[72px] w-full rounded-[18px] border border-amber-100 bg-[#fffaf2] px-4 py-3 text-sm leading-7 text-stone-700 outline-none focus:border-amber-300"
                        />
                      </div>

                      <div className="rounded-[18px] border border-dashed border-amber-200 bg-[#fbf3e4] p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">内核摘要</p>
                        <p className="mt-2 text-sm leading-7 text-stone-700">{soulCore.summary}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Persona 列表</p>
                        <p className="mt-1 text-sm text-stone-500">用户可以不断新增新的面具</p>
                      </div>
                      <button
                        onClick={addPersonaMask}
                        className="rounded-full bg-amber-900 px-3 py-1.5 text-[11px] font-bold text-white"
                      >
                        + 新增面具
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {personaMasks.map((mask) => (
                        <button
                          key={mask.id}
                          onClick={() => setSelectedPersonaId(mask.id)}
                          className={`w-full rounded-[20px] border p-4 text-left ${selectedPersonaId === mask.id ? 'border-amber-300 bg-[#fff8ef]' : 'border-amber-100 bg-white'}`}
                        >
                          <p className="text-sm font-extrabold text-amber-950">{mask.name}</p>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">{mask.scene}</p>
                          <p className="mt-2 text-xs leading-6 text-stone-500">已关联 {mask.memoryModuleIds.length} 个记忆模块</p>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 rounded-[18px] border border-dashed border-amber-200 bg-[#fbf3e4] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">统一性</p>
                      <p className="mt-2 text-sm leading-7 text-stone-700">
                        这里管理的面具，会直接进入 Ghost In The Shell。Ghost 不再维护另一套人格面具。
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(255,241,214,0.92))] p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">当前面具编辑器</p>
                        <p className="mt-1 text-sm text-stone-500">{activePersona.name} · 继承同一个 Soul Core</p>
                      </div>
                      <div className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">可编辑</div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">面具名称</p>
                          <input
                            value={activePersona.name}
                            onChange={(e) => updateActivePersona('name', e.target.value)}
                            className="mt-2 w-full rounded-[16px] border border-amber-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none focus:border-amber-300"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">场景用途</p>
                          <input
                            value={activePersona.scene}
                            onChange={(e) => updateActivePersona('scene', e.target.value)}
                            className="mt-2 w-full rounded-[16px] border border-amber-100 bg-white px-4 py-3 text-sm text-stone-700 outline-none focus:border-amber-300"
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">语气与态度</p>
                        <textarea
                          value={activePersona.tone}
                          onChange={(e) => updateActivePersona('tone', e.target.value)}
                          className="mt-2 min-h-[82px] w-full rounded-[18px] border border-amber-100 bg-white px-4 py-3 text-sm leading-7 text-stone-700 outline-none focus:border-amber-300"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">边界设置</p>
                          <textarea
                            value={activePersona.boundaries}
                            onChange={(e) => updateActivePersona('boundaries', e.target.value)}
                            className="mt-2 min-h-[82px] w-full rounded-[18px] border border-amber-100 bg-white px-4 py-3 text-sm leading-7 text-stone-700 outline-none focus:border-amber-300"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">执行目标</p>
                          <textarea
                            value={activePersona.goal}
                            onChange={(e) => updateActivePersona('goal', e.target.value)}
                            className="mt-2 min-h-[82px] w-full rounded-[18px] border border-amber-100 bg-white px-4 py-3 text-sm leading-7 text-stone-700 outline-none focus:border-amber-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[22px] border border-amber-200 bg-white/84 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">记忆模块选择</p>
                      <p className="mt-2 text-sm leading-7 text-stone-600">这里不再手写记忆，而是直接选择前置层 / 灵魂孕育阶段产出的模块。</p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {generatedMemoryModules.map((module) => {
                          const checked = activePersona.memoryModuleIds.includes(module.id);
                          return (
                            <button
                              key={module.id}
                              onClick={() => togglePersonaMemoryModule(module.id)}
                              className={`rounded-[18px] border p-4 text-left ${checked ? 'border-amber-300 bg-[#fff8ef]' : 'border-amber-100 bg-[#fffaf2]'}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-extrabold text-amber-950">{module.label}</p>
                                <div className={`h-5 w-9 rounded-full p-0.5 ${checked ? 'bg-amber-900' : 'bg-stone-300'}`}>
                                  <div className={`h-4 w-4 rounded-full bg-white transition ${checked ? 'ml-auto' : ''}`} />
                                </div>
                              </div>
                              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">{module.source}</p>
                              <p className="mt-2 text-xs leading-6 text-stone-500">{module.summary}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[22px] border border-amber-200 bg-white/84 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">预览与下发</p>
                      <div className="mt-3 rounded-[18px] bg-[#fbf3e4] px-4 py-4 text-sm leading-7 text-stone-700">
                        <p className="font-extrabold text-amber-950">{activePersona.name} 预览</p>
                        <p className="mt-2">基于 {soulCore.name} 的全局内核，这个面具会在「{activePersona.scene}」场景下以「{activePersona.tone}」的方式工作。</p>
                        <p className="mt-2">它会调用 {activePersona.memoryModuleIds.length} 个记忆模块，并遵守「{activePersona.boundaries}」。</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setWorkspaceTab('ghost')}
                      className="mt-4 w-full rounded-full bg-amber-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
                    >
                      带着这个面具进入 Ghost In The Shell
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {workspaceTab === 'ghost' && (
          <div className="flex h-full overflow-hidden">
            <Sidebar files={files} activeId={activeFile?.id || null} onSelect={setActiveFile} />

            <main className="flex-1 flex flex-col">
              <div className="border-b border-amber-100 bg-white/80 px-6 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">Ghost In The Shell</p>
                <h3 className="mt-1 font-headline text-2xl font-extrabold text-amber-950">查看、编辑、注入</h3>
              </div>

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
              <GhostBuilder
                activeFile={activeFile}
                files={files}
                masks={personaMasks}
                selectedMaskId={selectedPersonaId}
                soulCore={soulCore}
                memoryModules={generatedMemoryModules}
                onSelectMask={setSelectedPersonaId}
                onInjected={() => setRefreshKey((k) => k + 1)}
              />
            </aside>
          </div>
        )}

          {workspaceTab === 'pet' && (
            <div className="h-full overflow-y-auto px-8 py-10">
            <div className="max-w-6xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">伙伴终端</p>
              <h3 className="mt-3 font-headline text-4xl font-extrabold text-amber-950">宠物对话示例界面</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
                这一页不是 Pitch 文案，而是产品里的测试终端。用户可以在这里接入部分记忆，与伙伴对话，检查当前灵魂配置是否符合预期。
              </p>

              <div className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[28px] border border-amber-100 bg-white/88 p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">用途</p>
                  <div className="mt-4 space-y-3">
                    {[
                      '作为灵魂配置后的测试界面',
                      '按需接入记忆源，验证不同回答风格',
                      '让用户看到“如影随形的伙伴”不是抽象概念',
                      '后续可接 API，成为真正的陪伴式对话入口',
                    ].map((item) => (
                      <div key={item} className="rounded-2xl bg-[#fbf3e4] px-4 py-4 text-sm font-bold text-stone-700">{item}</div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-amber-100 bg-[#f5edde] p-4 shadow-sm">
                  <div className="h-[620px]">
                    <PetCompanion files={files} usePersistedState={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
}


