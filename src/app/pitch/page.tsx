'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Brain,
  FilePenLine,
  GitBranch,
  Layers3,
  Orbit,
  ScanSearch,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';

type MockTab = 'memory-connect' | 'incubator' | 'persona' | 'safety';

const ecosystem = [
  {
    name: 'Claude Code',
    role: '高频执行层',
    body: '用户每天真实在用的 Agent 工作流入口，已经形成了自己的人格、规则与记忆体系。',
  },
  {
    name: 'OpenClaw',
    role: '本地陪伴层',
    body: '证明了本地长期陪伴式 Agent 的存在方式，也证明“人格文件”可以成为真实产品结构。',
  },
  {
    name: 'Codex',
    role: '开发执行层',
    body: '代表另一类高频 coding agent 入口，说明人格与工作流绑定不会只发生在单一工具里。',
  },
  {
    name: 'mem0 / mem9',
    role: '记忆层',
    body: '更强的记忆系统已经在成熟，但还没有真正进入大多数用户每天都在用的 agent 工作流。',
  },
  {
    name: 'Second Me',
    role: '人格素材层',
    body: '用户数字分身与长期画像的代表，说明“灵魂原料”可以被持续积累，但缺少统一出口。',
  },
];

const painPoints = [
  '每换一个 AI、每开一个新项目、每开一个新对话，用户都要重新介绍自己。',
  'Agent 已经在形成对用户的认知，但这些人格、规则、记忆散落在本地文件和系统结构里。',
  '用户看不见 AI 怎么认识自己，也改不了、迁不走、撤不回。',
  '更强的记忆层存在，但没有进入用户真正高频使用的日常工具。',
];

const threeLayers = [
  {
    name: '记忆层',
    tag: 'Memory Layer',
    body: '负责沉淀你是谁、你经历过什么、你长期在意什么，是灵魂形成前的原料层。',
    products: ['mem0', 'mem9', 'Second Me', 'Karpathy Obsidian'],
    accent: 'soft',
  },
  {
    name: '人格层',
    tag: 'Persona Layer',
    body: '负责把分散记忆组织成一个可被理解、可被管理、可按场景暴露的人格终端。它既保留一个全局灵魂内核，也允许用户为不同场景编辑不同的人格面具。SoulShell 插入的就是这一层。',
    products: ['SoulShell'],
    accent: 'strong',
  },
  {
    name: '执行层',
    tag: 'Execution Layer',
    body: '负责在真实高频场景里替你行动：编码、陪伴、交互、执行任务，是用户每天真正接触的 Agent 外壳。',
    products: ['Claude Code', 'OpenClaw', 'Codex'],
    accent: 'soft',
  },
];

const stackFlow = [
  {
    title: '前置层',
    subtitle: '灵魂原料',
    body: 'mem0、mem9、Second Me，以及用户自己的社交媒体、知识库、项目资料，比如 Karpathy 的个人 Obsidian 知识库。',
    icon: Layers3,
  },
  {
    title: '灵魂孕育',
    subtitle: '整合与编排',
    body: '按场景、目标和边界，整理哪些记忆该暴露、哪些该隐藏，形成可管理的人格素材。',
    icon: Brain,
  },
  {
    title: 'Persona 面具',
    subtitle: '场景化人格',
    body: '参考荣格的人格面具概念。编程开发、陪伴对话、自媒体创作这些不同场景，本来就会调动人不同的一面、不同记忆和不同知识库；SoulShell 允许用户自己编辑这些面具，但它们共享同一个全局灵魂内核。',
    icon: Orbit,
  },
  {
    title: 'Ghost In The Shell',
    subtitle: '查看 / 编辑 / 注入',
    body: '把隐藏的人格与记忆结构变成可查看、可编辑、可注入的统一界面，是当前原型最直接可见的核心模块。',
    icon: FilePenLine,
  },
  {
    title: '执行层',
    subtitle: '日常 Agent',
    body: 'Claude Code、OpenClaw、Codex 等用户每天真正在用的工具，成为灵魂落地的壳。',
    icon: TerminalSquare,
  },
];

const prototypeModules = [
  '文件发现：自动读取 Agent 的人格、记忆、规则文件，并统一归类展示。',
  '编辑终端：在一个界面里查看与修改本地人格文件，不再手动翻目录。',
  'Ghost Builder：把 Persona 组织成可注入结构，直接回写到日常 Agent。',
  '伙伴终端：把灵魂以一个可见、可测的陪伴壳展示出来，而不只是文本片段。',
  '安全底座：保存前备份已经接入，完整的历史记录、版本回退与撤销能力是明确保留的产品要求。',
];

const pageSplit = [
  {
    name: '展示页面',
    path: '/pitch',
    body: '用来讲清问题、三层机制、产品定位，以及 SoulShell 在整个生态里的位置。',
    cta: '当前所在页面',
    muted: true,
  },
  {
    name: 'Demo 网站',
    path: '/',
    body: '用来直接看文件发现、人格编辑、Ghost Builder 与伙伴终端这些真实界面。',
    cta: '打开 Demo',
    muted: false,
  },
];

const safetyFlow = [
  {
    title: '先发现，再操作',
    body: '先识别 Claude Code、OpenClaw 和用户本地资料的真实文件结构，再进入编辑与注入，不做黑箱覆盖。',
  },
  {
    title: '每次修改先存档',
    body: '任何改动都应该先生成备份和历史快照。重点不是“能改”，而是改坏了也能回去。',
  },
  {
    title: '版本可追溯、可撤回',
    body: '像 Git 一样管理人格文件和注入记录，用户随时都能看到改动、比较版本、撤销上一步。',
  },
  {
    title: '不把本地环境搞乱',
    body: 'SoulShell 的角色不是闯进用户文件系统乱改，而是作为一个专业管理器，把边界、作用域和回退路径讲清楚。',
  },
];

const prototypePanels = [
  {
    title: '记忆源接入',
    eyebrow: 'Mock Surface',
    body: '按需连接已有资料，而不是强迫用户从零重新配置。可以只读本地 Agent，也可以逐步接入 mem0、mem9、Second Me、Twitter、小红书、Obsidian，以及像 Karpathy 个人 Obsidian 知识库这样的长期知识源。',
    chips: ['mem0', 'mem9', 'Second Me', 'Twitter', '小红书', 'Karpathy Obsidian'],
  },
  {
    title: '灵魂孕育',
    eyebrow: 'Mock Surface',
    body: '把分散的记忆、规则和资料整理成可迁移的灵魂 core。这里展示的是“灵魂如何被整理出来”，不是写一段 prompt 就结束。',
    chips: ['提取有效记忆', '整理人格边界', '形成灵魂 core', '准备下发 Persona'],
  },
  {
    title: 'Persona 面具',
    eyebrow: 'Mock Surface',
    body: '开发、陪伴、创作这些不同场景，会调用不同的人格面、不同记忆和不同知识库，但它们共享同一个全局灵魂内核。',
    chips: ['开发人格', '陪伴人格', '创作人格', '可编辑'],
  },
  {
    title: '安全回退',
    eyebrow: 'Mock Surface',
    body: '保存前备份、注入前快照、按平台记录变更历史、随时回退上一个版本。这些未完成模块在产品里会以管理界面的形式出现，而不是靠口播解释。',
    chips: ['自动备份', '历史记录', '版本对比', '一键回退'],
  },
];

const founderIntro = [
  'CrabPot。连载过小说，做过独立游戏，也做过独立全栈产品。',
  '长期关注人格化 AI、AI Native Game、AI 跑团，以及 AI for ADHD。',

];

function SectionTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-amber-700">{eyebrow}</p>
      <h2 className="font-headline text-3xl font-extrabold tracking-tight text-amber-950 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-stone-600 sm:text-lg">{body}</p>
    </div>
  );
}

export default function PitchPage() {
  const [stableMockTab, setStableMockTab] = useState<MockTab>('memory-connect');
  const mockTabIds: MockTab[] = ['memory-connect', 'incubator', 'persona', 'safety'];
  const [mockTab, setMockTab] = useState<'记忆源接入' | '灵魂孕育' | 'Persona 面具' | '安全回退'>('记忆源接入');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,226,168,0.35),transparent_28%),linear-gradient(180deg,#fff8ef_0%,#fbf3e4_52%,#f5edde_100%)] text-stone-800">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_60%)] pointer-events-none" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-10 sm:pb-20 sm:pt-8 lg:px-12">
        <section className="glass-panel overflow-hidden rounded-[28px] border border-white/70 shadow-[0_24px_80px_rgba(120,53,15,0.08)] sm:rounded-[36px]">
          <div className="grid gap-8 px-5 py-6 sm:px-10 sm:py-10 lg:grid-cols-[1.25fr_0.9fr] lg:px-12 lg:py-12">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800 sm:text-xs">
                <Sparkles size={14} />
                SoulShell
              </div>

              <h1 className="max-w-4xl font-headline text-4xl font-black leading-none tracking-[-0.04em] text-amber-950 sm:text-6xl lg:text-7xl">
                你的 AI 灵魂管理终端
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 sm:text-xl sm:leading-8">
                发现、编辑、注入。让 <span className="font-bold text-amber-900">Claude Code</span>、
                <span className="font-bold text-amber-900"> OpenClaw</span>、
                <span className="font-bold text-amber-900"> Codex</span> 真正认识你。
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full bg-amber-900 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(120,53,15,0.18)]">
                  一个灵魂，如影随形。
                </div>
                <div className="rounded-full border border-amber-200 bg-white/75 px-5 py-3 text-sm font-semibold text-stone-600">
                  AI 灵魂管理界面原型
                </div>
                <Link
                  href="/"
                  className="rounded-full border border-amber-200 bg-white/75 px-5 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-50"
                >
                  进入 Demo
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-3">
                {[
                  ['发现', '看见 AI 怎么认识你'],
                  ['编辑', '主动改写人格与认知'],
                  ['注入', '把灵魂带回日常 Agent'],
                ].map(([head, text]) => (
                  <div key={head} className="rounded-3xl border border-amber-100 bg-white/80 p-4 shadow-sm sm:p-5">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">{head}</p>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,249,240,0.96),rgba(255,238,194,0.82))] p-5 shadow-sm sm:rounded-[28px] sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">核心主张</p>
                <p className="mt-3 font-headline text-2xl font-extrabold tracking-tight text-amber-950 sm:text-[2.35rem]">
                  主动管理，而不是不断抽卡“喂养”
                </p>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-700 sm:text-base">
                  用户不是每换一个 Agent 就重新养一只新东西，而是主动定义自己的灵魂内核，并把它带去不同工具与不同场景。
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(245,237,222,0.98))] p-5 shadow-[0_14px_40px_rgba(120,53,15,0.10)] sm:rounded-[32px] sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">Current Demo</p>
                    <h3 className="mt-2 font-headline text-2xl font-extrabold text-amber-950">SoulShell Terminal</h3>
                  </div>
                  <div className="soul-glow flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-100 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
                    🥚
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    'Claude Code 文件可视化',
                    '本地编辑与备份',
                    'Ghost Builder 人格注入',
                    '伙伴终端作为测试壳',
                  ].map((item) => (
                    <div key={item} className="flex flex-col gap-2 rounded-2xl bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-semibold text-stone-700">{item}</span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">已验证</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-amber-100 bg-white/75 p-5 shadow-sm sm:rounded-[32px] sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">Thesis</p>
                <p className="mt-4 text-base leading-8 text-stone-700">
                  行业里不缺 Agent，不缺记忆，不缺人格文件。
                  <span className="font-bold text-amber-950">真正缺的是把它们连接起来，并把控制权交还给用户的终端。</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 sm:mt-20">
          <SectionTitle
            eyebrow="Problem"
            title="用户每天都在被不同 AI 重新认识"
            body="今天最真实的问题，不是没有记忆，也不是没有 Agent，而是用户对 AI 如何认识自己没有主权。人格、规则、记忆已经存在，但它们散落在系统内部，既不可见，也不可控。"
          />

          <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2">
            {painPoints.map((point, index) => (
              <div key={point} className="rounded-[24px] border border-amber-100 bg-white/80 p-5 shadow-sm sm:rounded-[28px] sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">0{index + 1}</p>
                <p className="mt-3 text-base leading-7 text-stone-700 sm:leading-8">{point}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-amber-200 bg-[linear-gradient(135deg,rgba(255,249,240,0.96),rgba(255,238,194,0.78))] p-5 shadow-sm sm:rounded-[30px] sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">Key Insight</p>
            <p className="mt-3 font-headline text-xl font-extrabold leading-8 tracking-tight text-amber-950 sm:text-3xl sm:leading-10">
              表面上，是 Agent 换来换去；实质上，是记忆层和执行层之间，缺少一个简单而有机的连接。
            </p>
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <div className="rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,237,222,0.92))] p-5 shadow-[0_18px_56px_rgba(120,53,15,0.08)] sm:rounded-[36px] sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">Three Layers</p>
              <h3 className="mt-3 font-headline text-2xl font-extrabold tracking-tight text-amber-950 sm:text-4xl">
                这件事要分三层看，SoulShell 卡在中间
              </h3>
              <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-lg sm:leading-8">
                不是所有产品都在同一层竞争。记忆层沉淀原料，执行层承载日常 Agent，而 SoulShell 介入中间的人格层，
                负责把“记忆”整理成“可被表达、管理、注入的灵魂”。
              </p>
            </div>

            <div className="mt-10 space-y-5">
              {threeLayers.map((layer, index) => {
                const isCenter = layer.accent === 'strong';
                return (
                  <div key={layer.name} className="relative">
                    {index !== 0 && (
                      <div className="pointer-events-none absolute -top-5 left-1/2 hidden h-5 w-px -translate-x-1/2 bg-gradient-to-b from-amber-300 to-transparent lg:block" />
                    )}

                    <div
                      className={`grid gap-5 rounded-[24px] border p-5 shadow-sm transition sm:rounded-[32px] sm:p-7 lg:grid-cols-[0.9fr_1.1fr] ${
                        isCenter
                          ? 'border-amber-300 bg-[linear-gradient(135deg,rgba(255,243,214,0.98),rgba(255,232,163,0.70))] shadow-[0_18px_60px_rgba(255,215,0,0.16)]'
                          : 'border-amber-100 bg-white/82'
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-black uppercase tracking-[0.24em] ${isCenter ? 'text-amber-800' : 'text-amber-700'}`}>
                          {layer.tag}
                        </p>
                        <h4 className="mt-3 font-headline text-2xl font-extrabold text-amber-950 sm:text-[2.15rem]">
                          {layer.name}
                        </h4>
                        <p className="mt-4 text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">{layer.body}</p>
                      </div>

                      <div className={`rounded-[22px] p-4 sm:rounded-[28px] sm:p-5 ${isCenter ? 'bg-white/72' : 'bg-[#fbf3e4]'}`}>
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-700">
                          代表产品 / 当前位置
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {layer.products.map((product) => (
                            <div
                              key={product}
                              className={`rounded-full px-4 py-2.5 text-sm font-bold ${
                                product === 'SoulShell'
                                  ? 'bg-amber-900 text-white shadow-[0_10px_26px_rgba(120,53,15,0.18)]'
                                  : 'border border-amber-200 bg-white text-amber-900'
                              }`}
                            >
                              {product}
                            </div>
                          ))}
                        </div>

                        {isCenter && (
                          <div className="mt-5 space-y-3">
                            <p className="text-sm leading-7 text-stone-700">
                              <span className="font-bold text-amber-950">SoulShell 的角色不是替代这些产品，</span>
                              而是把上游的记忆原料，整理成下游执行 Agent 能稳定使用的人格终端。
                            </p>
                            <div className="rounded-[20px] border border-amber-200 bg-white px-4 py-3 text-sm leading-7 text-stone-700">
                              <span className="font-bold text-amber-950">SoulShell 作为人格层，</span>
                              向上解决的是<span className="font-bold text-amber-950">跨记忆系统</span>，
                              向下解决的是<span className="font-bold text-amber-950">跨 Agent</span>。
                            </div>
                            <div className="rounded-[20px] border border-amber-200 bg-white px-4 py-3 text-sm leading-7 text-stone-700">
                              <span className="font-bold text-amber-950">SoulShell 的标准是：</span>
                              要在合适的时候记得合适的事情，用合适的方式。
                            </div>
                            <div className="rounded-[20px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-7 text-stone-700">
                              这个人格核心可以是数码宝贝伙伴，也可以是黑暗物质的精灵。
                              <span className="font-bold text-amber-950">它强调的是一种精神需求：</span>
                              用户希望有一个如影随形、一直陪着自己的伙伴，而不是每到一个工具里都重新开始。
                            </div>
                            <div className="rounded-[20px] border border-amber-200 bg-white/82 px-4 py-3 text-sm leading-7 text-stone-700">
                              Persona 面具参考的是荣格的概念。现实中的人会在不同场景展现不同的一面，
                              也会调用不同的记忆、边界和知识库。
                              <span className="font-bold text-amber-950">SoulShell 允许用户自己编辑这些人格面具，而不是系统随机发一个设定。</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionTitle
            eyebrow="Research Basis"
            title="这不是凭空想象出来的灵魂系统"
            body="SoulShell 建立在对 Claude Code 与 OpenClaw 真实本地结构的拆解之上。我们不是先发明概念，再去找例子，而是先确认这些人格与记忆机制已经存在，只是它们分散、隐蔽，而且被锁在各自工具内部。"
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[28px] border border-amber-100 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Claude Code</p>
              <h3 className="mt-3 font-headline text-2xl font-extrabold text-amber-950">多层记忆已经存在</h3>
              <p className="mt-4 text-sm leading-7 text-stone-700">
                我们实际看到，Claude Code 并不是“没有人格系统”。它已经有规则层、项目级记忆层和索引层，例如
                <span className="font-bold text-amber-950"> `CLAUDE.md`、项目 memory 目录、`MEMORY.md` 索引</span>，
                甚至还有跨会话整理记忆的机制。
              </p>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                问题不在于没有记忆，而在于这些结构分散、隐蔽，而且主要服务 Claude Code 自己。
              </p>
            </div>

            <div className="rounded-[28px] border border-amber-100 bg-white/80 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">OpenClaw</p>
              <h3 className="mt-3 font-headline text-2xl font-extrabold text-amber-950">本地人格文件已经存在</h3>
              <p className="mt-4 text-sm leading-7 text-stone-700">
                OpenClaw 也不是抽象概念。它已经把陪伴式 Agent 的人格、用户认知和本地关系做成了真实文件结构，例如
                <span className="font-bold text-amber-950"> `SOUL`、`USER` </span>
                这一类本地配置入口。
              </p>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                这证明了“人格文件”本身就是产品结构，只是现在仍然缺少统一、可管理、可迁移的界面。
              </p>
            </div>

            <div className="rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(255,241,214,0.92))] p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Our Judgment</p>
              <h3 className="mt-3 font-headline text-2xl font-extrabold text-amber-950">人格层已经存在，但没有主权</h3>
              <p className="mt-4 text-sm leading-7 text-stone-700">
                这也是 SoulShell 成立的基础：我们不是重新发明一套灵魂系统，而是把已经存在、但分散在工具内部的人格与记忆结构，
                变成用户可见、可编辑、可注入、可回退的终端。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionTitle
            eyebrow="Why Now"
            title="大家都在证明这件事，但还没有人把控制权交给用户"
            body="Claude Code、OpenClaw、Codex、mem0、mem9、Second Me 这些系统分别把三层结构的一部分做出来了，但还没有人把它们统一成一个用户可以主动理解、编辑、迁移的灵魂界面。"
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {ecosystem.map((item) => (
              <div key={item.name} className="rounded-[28px] border border-amber-100 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">{item.role}</p>
                <h3 className="mt-3 font-headline text-2xl font-extrabold text-amber-950">{item.name}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <div className="rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,237,222,0.94))] p-5 shadow-[0_18px_56px_rgba(120,53,15,0.08)] sm:rounded-[36px] sm:p-8">
            <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
              <div>
                <div className="flex items-center gap-3">
                  <GitBranch className="text-amber-700" size={20} />
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">SoulShell Position</p>
                </div>
                <h3 className="mt-4 font-headline text-2xl font-extrabold tracking-tight text-amber-950 sm:text-4xl">
                  左边讲结构，右边就是对应的产品界面
                </h3>
                <p className="mt-4 text-sm leading-7 text-stone-700 sm:text-lg sm:leading-8">
                  SoulShell 不是站在三层体系外面空讲概念，而是直接插在这条链路里。左边讲它在系统里的位置，右边展示这些模块实际会长成什么样。
                </p>

                <div className="mt-6 space-y-4">
                  {stackFlow.map((item, index) => {
                    const Icon = item.icon;
                    const target = mockTabIds[Math.min(index, mockTabIds.length - 1)];
                    return (
                      <button
                        key={item.title}
                        onClick={() => setStableMockTab(target)}
                        className="flex w-full gap-3 rounded-[20px] bg-white/82 p-4 text-left shadow-sm transition hover:bg-white sm:gap-4 sm:rounded-[24px]"
                      >
                        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
                            0{index + 1} · {item.title}
                          </p>
                          <h3 className="mt-1 font-headline text-lg font-extrabold text-amber-950 sm:text-xl">{item.subtitle}</h3>
                          <p className="mt-2 text-xs leading-6 text-stone-600 sm:text-sm sm:leading-7">{item.body}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(255,255,255,0.94))] p-4 shadow-sm sm:rounded-[32px] sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">Product Surface</p>
                <h4 className="mt-3 font-headline text-2xl font-extrabold text-amber-950 sm:text-3xl">对应的产品界面</h4>

                <div className="mt-6 -mx-1 overflow-x-auto pb-2 sm:mx-0 sm:overflow-visible sm:pb-0">
                  <div className="flex w-max gap-3 px-1 sm:w-auto sm:flex-wrap sm:px-0">
                    {prototypePanels.map((panel, index) => (
                      <button
                        key={panel.title}
                        onClick={() => setStableMockTab(mockTabIds[index])}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
                          stableMockTab === mockTabIds[index]
                            ? 'bg-amber-900 text-white'
                            : 'border border-amber-200 bg-white text-amber-900 hover:bg-amber-50'
                        }`}
                      >
                        {panel.title}
                      </button>
                    ))}
                  </div>
                </div>

                {stableMockTab === 'memory-connect' && (
                  <div className="mt-6 grid gap-4">
                    <div className="rounded-[24px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">记忆源接入</p>
                      <h5 className="mt-3 font-headline text-2xl font-extrabold text-amber-950">按需连接已有资料</h5>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {['mem0', 'mem9', 'Second Me', 'Twitter', '小红书', 'Obsidian'].map((item, index) => (
                          <div key={item} className="rounded-full border border-amber-200 bg-[#fbf3e4] px-3 py-2 text-xs font-bold text-amber-900">
                            {index < 3 ? '已接入 · ' : '待接入 · '}
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">接入策略</p>
                      <div className="mt-4 space-y-3">
                        {['只读取本地 Agent', '按资料源逐个授权', '标记可暴露与不可暴露信息'].map((item) => (
                          <div key={item} className="rounded-2xl bg-[#fbf3e4] px-4 py-4 text-sm font-bold text-stone-700">{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {stableMockTab === 'incubator' && (
                  <div className="mt-6 grid gap-4">
                    <div className="rounded-[24px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">灵魂孕育</p>
                      <div className="mt-4 space-y-3">
                        {['提取有效记忆', '整理人格边界', '合并成全局灵魂 core', '准备下发 Persona'].map((item, index) => (
                          <div key={item} className="flex gap-3 rounded-2xl bg-[#fbf3e4] p-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-900 text-xs font-black text-white">
                              {index + 1}
                            </div>
                            <p className="text-sm leading-7 text-stone-700">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,249,240,0.98),rgba(255,233,187,0.82))] p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">灵魂内核示意</p>
                      <p className="mt-3 text-2xl font-extrabold text-amber-950">如影随形的伙伴</p>
                      <p className="mt-3 text-sm leading-7 text-stone-700">
                        可以是数码宝贝伙伴，也可以是黑暗物质的精灵。这里展示的是灵魂 core 如何被整理出来，而不是写一段 prompt 就结束。
                      </p>
                    </div>
                  </div>
                )}

                {stableMockTab === 'persona' && (
                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {[
                      ['开发人格', '认真负责的 ISTJ', ['Claude Code', '项目规则', '代码库记忆']],
                      ['陪伴人格', '理解你的 ENFJ', ['长期对话记忆', '个人表达', '情绪边界']],
                      ['创作人格', '有边界感的内容搭档', ['社交媒体资料', '素材库', '写作偏好']],
                    ].map(([name, tone, sources]) => (
                      <div key={name as string} className="rounded-[24px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                        <p className="text-lg font-extrabold text-amber-950">{name as string}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">{tone as string}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(sources as string[]).map((source) => (
                            <div key={source} className="rounded-full border border-amber-200 bg-[#fbf3e4] px-3 py-1.5 text-[11px] font-bold text-stone-700">
                              {source}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-2xl bg-[#fbf3e4] px-4 py-3 text-sm leading-7 text-stone-700">
                          共享同一个灵魂 core，但在不同场景调用不同记忆和边界。
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {stableMockTab === 'safety' && (
                  <div className="mt-6 grid gap-4">
                    <div className="rounded-[24px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">安全可追溯</p>
                      <div className="mt-4 space-y-3">
                        {['保存前自动备份', '注入前生成快照', '按平台记录变更历史', '随时回退到上一个版本'].map((item) => (
                          <div key={item} className="rounded-2xl bg-[#fbf3e4] px-4 py-4 text-sm font-bold text-stone-700">{item}</div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">版本记录示意</p>
                      <div className="mt-4 space-y-3">
                        {[
                          ['v12', '更新开发人格提示词', 'Claude Code · 5 分钟前'],
                          ['v11', '撤回上次 OpenClaw 注入', 'OpenClaw · 11 分钟前'],
                          ['v10', '补充个人知识库边界', 'Knowledge Base · 18 分钟前'],
                        ].map(([ver, title, meta]) => (
                          <div key={ver as string} className="rounded-2xl border border-amber-100 bg-[#fff8ef] px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-extrabold text-amber-950">{ver as string}</p>
                              <button className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-bold text-amber-800">
                                回退
                              </button>
                            </div>
                            <p className="mt-2 text-sm font-bold text-stone-700">{title as string}</p>
                            <p className="mt-1 text-xs text-stone-500">{meta as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="mt-10 sm:mt-12">
          <div className="rounded-[28px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(248,239,223,0.96))] p-5 shadow-[0_18px_56px_rgba(120,53,15,0.08)] sm:rounded-[36px] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">Safety & Traceability</p>
                <h3 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-amber-950 sm:text-4xl">
                  安全可追溯
                </h3>
                <p className="mt-4 text-base leading-8 text-stone-700 sm:text-lg">
                  SoulShell 不是一个随便闯进用户本地文件系统乱改的黑客工具。
                  它应该像 Git 一样管理人格文件、注入记录和知识库接入，确保每次操作都清楚、可追踪、可回退。
                </p>

                <div className="mt-6 rounded-[28px] border border-amber-200 bg-white/82 p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">核心承诺</p>
                  <p className="mt-3 font-headline text-2xl font-extrabold tracking-tight text-amber-950 sm:text-3xl">
                    不让用户因为 SoulShell 把 Claude Code、OpenClaw 或个人知识库搞得乱七八糟
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {safetyFlow.map((item, index) => (
                  <div key={item.title} className="rounded-[28px] border border-amber-100 bg-white/88 p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">0{index + 1}</p>
                    <h4 className="mt-3 text-lg font-extrabold tracking-tight text-amber-950">{item.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-stone-700">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.86fr]">
            <div className="rounded-[24px] border border-amber-100 bg-white/80 p-5 shadow-sm sm:rounded-[32px] sm:p-7">
              <div className="flex items-center gap-3">
                <ScanSearch className="text-amber-700" size={20} />
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">当前 Demo 可见内容</p>
              </div>
              <div className="mt-6 grid gap-3">
                {prototypeModules.map((item) => (
                  <div key={item} className="rounded-[22px] bg-[#fbf3e4] px-4 py-4 text-sm leading-7 text-stone-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-amber-100 bg-[linear-gradient(180deg,rgba(245,237,222,0.9),rgba(255,255,255,0.92))] p-5 shadow-sm sm:rounded-[32px] sm:p-7">
              <div className="flex items-center gap-3">
                <ArrowRight className="text-amber-700" size={20} />
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">两个入口</p>
              </div>
              <div className="mt-6 space-y-4">
                {pageSplit.map((item) => (
                  <div key={item.name} className="rounded-[22px] bg-white/80 p-4">
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">{item.path}</p>
                        <p className="mt-1 text-lg font-extrabold text-amber-950">{item.name}</p>
                      </div>
                      {item.muted ? (
                        <div className="rounded-full bg-[#fbf3e4] px-3 py-1.5 text-xs font-bold text-amber-800">
                          {item.cta}
                        </div>
                      ) : (
                        <Link
                          href={item.path}
                          className="rounded-full bg-amber-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-800"
                        >
                          {item.cta}
                        </Link>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-700">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[24px] border border-amber-100 bg-white/80 p-5 shadow-sm sm:rounded-[32px] sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">项目发起人</p>
              <h3 className="mt-3 font-headline text-3xl font-extrabold text-amber-950">CrabPot</h3>
              <div className="mt-5 space-y-4">
                {founderIntro.map((line) => (
                  <p key={line} className="text-base leading-8 text-stone-700">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(251,243,228,0.92))] p-5 shadow-sm sm:rounded-[32px] sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">队伍信息</p>
              <div className="mt-5 grid gap-3">
                {[
                  ['队伍名称', 'SoulShell 灵魂诞壳'],
                  ['赛道', '个体'],
                  ['队长', 'CrabPot'],
                  ['选题', 'Agent 人格通用终端管理'],
                  ['Slogan', '灵魂的诞壳'],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col items-start gap-2 rounded-[20px] bg-white/82 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-bold text-stone-500">{label}</span>
                    <span className="text-sm font-bold text-amber-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <SectionTitle
            eyebrow="Closing"
            title="SoulShell 要做的，是把人格主权从工具里拿回来"
            body="它连接上游的记忆层与下游的执行 Agent，把原本散落在工具内部的人格、认知和边界，重新变成用户可以主动管理的界面。"
          />

          <div className="mt-10 rounded-[28px] border border-amber-100 bg-white/80 p-5 shadow-[0_20px_60px_rgba(120,53,15,0.08)] sm:rounded-[36px] sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-700">Final Line</p>
                <p className="mt-4 font-headline text-3xl font-extrabold leading-tight tracking-[-0.03em] text-amber-950 sm:text-5xl">
                  用户不该被动适应每一个 Agent。
                  <br />
                  用户应该主动管理自己 Agent 的人格与记忆。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-full border border-amber-200 bg-[#fbf3e4] px-5 py-3 text-sm font-bold text-amber-800 transition hover:bg-amber-50"
                >
                  返回产品原型
                </Link>
                <div className="rounded-full bg-amber-900 px-5 py-3 text-sm font-bold text-white">
                  SoulShell · 灵魂管理终端
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

