'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  FilePenLine,
  GitBranch,
  Layers3,
  LockKeyhole,
  Orbit,
  ScanSearch,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';

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

const thesis = [
  '我们的判断是，AI 时代真正稳定的产品结构会分成三层：记忆层、人格层、执行层。',
  '记忆层负责沉淀你是谁，人格层负责组织这些记忆如何被表达，执行层负责在具体工具里替你行动。',
  'SoulShell 插入的正是中间这一层：它不是记忆系统，也不是执行 Agent，而是一个跨记忆系统、跨执行 Agent 的人格终端。',
];

const threeLayers = [
  {
    name: '记忆层',
    tag: 'Memory Layer',
    body: '负责沉淀你是谁、你经历过什么、你长期在意什么，是灵魂形成前的原料层。',
    products: ['mem0', 'mem9', 'Second Me'],
    accent: 'soft',
  },
  {
    name: '人格层',
    tag: 'Persona Layer',
    body: '负责把分散记忆组织成一个可被理解、可被管理、可按场景暴露的人格终端。SoulShell 插入的就是这一层。',
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
    body: 'mem0、mem9、Second Me，以及用户自己的社交媒体、知识库、项目资料。',
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
    body: '编程开发、陪伴对话、自媒体创作，可以暴露不同人格面，但共享同一个灵魂内核。',
    icon: Orbit,
  },
  {
    title: 'Ghost In The Shell',
    subtitle: '查看 / 编辑 / 注入',
    body: '这次黑客松重点验证的一刀：把隐蔽的人格与记忆结构变成用户能主动编辑的终端。',
    icon: FilePenLine,
  },
  {
    title: '执行层',
    subtitle: '日常 Agent',
    body: 'Claude Code、OpenClaw、Codex 等用户每天真正在用的工具，成为灵魂落地的壳。',
    icon: TerminalSquare,
  },
];

const currentState = [
  '已把 Claude Code 的人格、规则、记忆文件结构做成可视化终端原型。',
  '已验证本地文件读取、编辑、保存前备份、人格注入这条链路可以跑通。',
  '已做出独立的伙伴终端与 Ghost Builder，让“灵魂”不只是文本，而是可被展示和测试的对象。',
  '这次没有把完整前置层与灵魂孕育做完，但已经把最终产品结构讲清，并给未来模块留出了位置。',
];

const demoScript = [
  '先讲问题：用户在不同 Agent 中不断被重新认识，却没有人格主权。',
  '再讲洞察：Claude Code 让我们看见，AI 的人格不是玄学，而是可以被拆解、管理、迁移的系统。',
  '再展示 SoulShell：统一终端里查看 AI 怎么认识你，编辑后反向注入。',
  '最后升维：未来可把 mem0、mem9、Second Me 这些更强的记忆能力，反向接入日常 Agent。',
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
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,226,168,0.35),transparent_28%),linear-gradient(180deg,#fff8ef_0%,#fbf3e4_52%,#f5edde_100%)] text-stone-800">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),transparent_60%)] pointer-events-none" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-8 sm:px-10 lg:px-12">
        <section className="glass-panel overflow-hidden rounded-[36px] border border-white/70 shadow-[0_24px_80px_rgba(120,53,15,0.08)]">
          <div className="grid gap-10 px-7 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.25fr_0.9fr] lg:px-12 lg:py-12">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
                <Sparkles size={14} />
                SoulShell
              </div>

              <h1 className="max-w-4xl font-headline text-5xl font-black tracking-[-0.04em] text-amber-950 sm:text-6xl lg:text-7xl">
                你的 AI 灵魂管理终端
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600 sm:text-xl">
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
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  ['发现', '看见 AI 怎么认识你'],
                  ['编辑', '主动改写人格与认知'],
                  ['注入', '把灵魂带回日常 Agent'],
                ].map(([head, text]) => (
                  <div key={head} className="rounded-3xl border border-amber-100 bg-white/80 p-5 shadow-sm">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">{head}</p>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-[32px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(245,237,222,0.98))] p-6 shadow-[0_14px_40px_rgba(120,53,15,0.10)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">Current Demo</p>
                    <h3 className="mt-2 font-headline text-2xl font-extrabold text-amber-950">SoulShell Terminal</h3>
                  </div>
                  <div className="soul-glow flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-100 text-3xl">
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
                    <div key={item} className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
                      <span className="text-sm font-semibold text-stone-700">{item}</span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">已验证</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-amber-100 bg-white/75 p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">Thesis</p>
                <p className="mt-4 text-base leading-8 text-stone-700">
                  行业里不缺 Agent，不缺记忆，不缺人格文件。
                  <span className="font-bold text-amber-950">真正缺的是把它们连接起来，并把控制权交还给用户的终端。</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionTitle
            eyebrow="Problem"
            title="用户每天都在被不同 AI 重新认识"
            body="今天最真实的问题，不是没有记忆，也不是没有 Agent，而是用户对 AI 如何认识自己没有主权。人格、规则、记忆已经存在，但它们散落在系统内部，既不可见，也不可控。"
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {painPoints.map((point, index) => (
              <div key={point} className="rounded-[28px] border border-amber-100 bg-white/80 p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">0{index + 1}</p>
                <p className="mt-3 text-base leading-8 text-stone-700">{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <SectionTitle
            eyebrow="Why Now"
            title="大咖都在证明这件事，但还没有人把控制权交给用户"
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

        <section className="mt-24 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-amber-100 bg-white/80 p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <LockKeyhole className="text-amber-700" size={20} />
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">Core Thesis</p>
            </div>
            <div className="mt-6 space-y-4">
              {thesis.map((line) => (
                <p key={line} className="text-base leading-8 text-stone-700">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(251,243,228,0.92))] p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <GitBranch className="text-amber-700" size={20} />
              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">SoulShell Position</p>
            </div>
            <div className="mt-6 space-y-4">
              {stackFlow.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 rounded-[24px] bg-white/80 p-4">
                    <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
                        0{index + 1} · {item.title}
                      </p>
                      <h3 className="mt-1 font-headline text-xl font-extrabold text-amber-950">{item.subtitle}</h3>
                      <p className="mt-2 text-sm leading-7 text-stone-600">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="rounded-[36px] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,237,222,0.92))] p-7 shadow-[0_18px_56px_rgba(120,53,15,0.08)] sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">Three Layers</p>
              <h3 className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-amber-950 sm:text-4xl">
                这件事要分三层看，SoulShell 卡在中间
              </h3>
              <p className="mt-4 text-base leading-8 text-stone-600 sm:text-lg">
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
                      className={`grid gap-6 rounded-[32px] border p-6 shadow-sm transition sm:p-7 lg:grid-cols-[0.9fr_1.1fr] ${
                        isCenter
                          ? 'border-amber-300 bg-[linear-gradient(135deg,rgba(255,243,214,0.98),rgba(255,232,163,0.70))] shadow-[0_18px_60px_rgba(255,215,0,0.16)]'
                          : 'border-amber-100 bg-white/82'
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-black uppercase tracking-[0.24em] ${isCenter ? 'text-amber-800' : 'text-amber-700'}`}>
                          {layer.tag}
                        </p>
                        <h4 className="mt-3 font-headline text-3xl font-extrabold text-amber-950 sm:text-[2.15rem]">
                          {layer.name}
                        </h4>
                        <p className="mt-4 text-base leading-8 text-stone-700">{layer.body}</p>
                      </div>

                      <div className={`rounded-[28px] p-5 ${isCenter ? 'bg-white/72' : 'bg-[#fbf3e4]'}`}>
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
                          <p className="mt-5 text-sm leading-7 text-stone-700">
                            <span className="font-bold text-amber-950">SoulShell 的角色不是替代这些产品，</span>
                            而是把上游的记忆原料，整理成下游执行 Agent 能稳定使用的人格终端。
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-24">
          <SectionTitle
            eyebrow="This Hackathon"
            title="这次我没有试图做完整未来，而是先验证最核心的环节"
            body="完整 SoulShell 会包含前置层、灵魂孕育、Persona 面具与多平台回注。但这次黑客松，我先专注于 Claude Code：把它隐蔽的人格与记忆结构变成一个用户看得见、改得动、能注回去的终端。"
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_0.86fr]">
            <div className="rounded-[32px] border border-amber-100 bg-white/80 p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <ScanSearch className="text-amber-700" size={20} />
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">Current Validation</p>
              </div>
              <div className="mt-6 grid gap-3">
                {currentState.map((item) => (
                  <div key={item} className="rounded-[22px] bg-[#fbf3e4] px-4 py-4 text-sm leading-7 text-stone-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-amber-100 bg-[linear-gradient(180deg,rgba(245,237,222,0.9),rgba(255,255,255,0.92))] p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <ArrowRight className="text-amber-700" size={20} />
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-700">Live Demo Script</p>
              </div>
              <div className="mt-6 space-y-4">
                {demoScript.map((step, index) => (
                  <div key={step} className="rounded-[22px] bg-white/80 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Step 0{index + 1}</p>
                    <p className="mt-2 text-sm leading-7 text-stone-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24">
          <SectionTitle
            eyebrow="Closing"
            title="我们不是在造另一个 AI，我们是在帮助用户主动管理 AI 的灵魂"
            body="评委今天看到的不是一个完成态大产品，而是一个方向非常明确的系统入口：把分散在 Claude Code、OpenClaw、Codex 与未来记忆层之间的人格主权，真正交还给用户。"
          />

          <div className="mt-10 rounded-[36px] border border-amber-100 bg-white/80 p-8 shadow-[0_20px_60px_rgba(120,53,15,0.08)]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-700">Final Line</p>
                <p className="mt-4 font-headline text-4xl font-extrabold leading-tight tracking-[-0.03em] text-amber-950 sm:text-5xl">
                  用户不该被动适应每一个 Agent。
                  <br />
                  用户应该主动管理自己的灵魂。
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
