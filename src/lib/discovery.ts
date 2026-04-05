import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface DiscoveredFile {
  id: string;
  platform: 'Claude Code' | 'OpenClaw';
  category: string;
  categoryIcon: string;
  type: 'persona' | 'memory' | 'rules' | 'config';
  name: string;
  displayName: string;
  description: string;
  path: string;
  exists: boolean;
  isReadonly: boolean;
  warning?: string;
  injectable: boolean;
}

function makeId(p: string): string { return Buffer.from(p).toString('base64'); }
async function exists(p: string): Promise<boolean> { try { await fs.access(p); return true; } catch { return false; } }

export async function discoverFiles(): Promise<DiscoveredFile[]> {
  const home = os.homedir();
  const cwd = process.cwd();
  const files: DiscoveredFile[] = [];

  // ══════════════════════════════════════════════════════════
  //  Claude Code
  // ══════════════════════════════════════════════════════════

  // ── 它是谁（人格）──
  const globalClaude = path.join(home, 'CLAUDE.md');
  files.push({
    platform: 'Claude Code', category: '它是谁', categoryIcon: '🪪', type: 'persona',
    name: 'CLAUDE.md', displayName: '全局 CLAUDE.md',
    description: '定义 Claude Code 在所有项目中的行为方式。你可以在这里塑造它的人格。',
    path: globalClaude, id: makeId(globalClaude),
    exists: await exists(globalClaude), isReadonly: false, injectable: true,
  });

  const projectClaude = path.join(cwd, 'CLAUDE.md');
  files.push({
    platform: 'Claude Code', category: '它是谁', categoryIcon: '🪪', type: 'persona',
    name: 'CLAUDE.md', displayName: '项目 CLAUDE.md',
    description: '仅在当前项目生效，可以让 Claude Code 在不同项目中有不同的人格。',
    path: projectClaude, id: makeId(projectClaude),
    exists: await exists(projectClaude), isReadonly: false, injectable: true,
  });

  // ── 它怎么看你（认知）──
  const projectMemDir = path.join(cwd, '.claude', 'memory');
  const projectMemIndex = path.join(projectMemDir, 'MEMORY.md');
  files.push({
    platform: 'Claude Code', category: '它怎么看你', categoryIcon: '🧠', type: 'memory',
    name: 'MEMORY.md', displayName: 'MEMORY.md（记忆索引）',
    description: 'Claude Code 对你的了解：你的角色、偏好、过去的反馈。查看它记住了什么，纠正不准确的认知。',
    path: projectMemIndex, id: makeId(projectMemIndex),
    exists: await exists(projectMemIndex), isReadonly: false, injectable: false,
    warning: '梦境素材：autoDream 会整合重写。你的编辑会参与记忆整合，但不保证原样保留。',
  });

  // topic 文件——每个都是 Claude 对你某方面的认知
  try {
    const memEntries = await fs.readdir(projectMemDir);
    for (const f of memEntries) {
      if (f === 'MEMORY.md' || !f.endsWith('.md')) continue;
      const fp = path.join(projectMemDir, f);
      const label = f.replace('.md', '').replace(/_/g, ' ');
      files.push({
        platform: 'Claude Code', category: '它怎么看你', categoryIcon: '🧠', type: 'memory',
        name: f, displayName: label,
        description: `Claude Code 关于「${label}」的记忆。可以查看和修改它对你的认知。`,
        path: fp, id: makeId(fp),
        exists: true, isReadonly: false, injectable: false,
      });
    }
  } catch { /* no memory dir */ }

  // ── 它怎么工作（规则）──
  const rulesDir = path.join(cwd, '.claude', 'rules');
  try {
    const entries = await fs.readdir(rulesDir);
    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue;
      const fp = path.join(rulesDir, entry);
      files.push({
        platform: 'Claude Code', category: '它怎么工作', categoryIcon: '📋', type: 'rules',
        name: entry, displayName: entry,
        description: '上下文规则，决定 Claude Code 在特定情境下的行为。',
        path: fp, id: makeId(fp),
        exists: true, isReadonly: false, injectable: false,
      });
    }
  } catch { /* no rules dir */ }

  // ── 配置 ──
  const settingsPath = path.join(home, '.claude', 'settings.json');
  files.push({
    platform: 'Claude Code', category: '配置', categoryIcon: '⚙️', type: 'config',
    name: 'settings.json', displayName: 'settings.json',
    description: 'hooks、权限白名单、MCP 服务器。只读，了解系统如何配置。',
    path: settingsPath, id: makeId(settingsPath),
    exists: await exists(settingsPath), isReadonly: true, injectable: false,
  });

  // ══════════════════════════════════════════════════════════
  //  OpenClaw — 文件在 ~/.openclaw/workspace/
  // ══════════════════════════════════════════════════════════

  const ocW = path.join(home, '.openclaw', 'workspace');

  // ── 它是谁（灵魂）──
  const soulPath = path.join(ocW, 'SOUL.md');
  files.push({
    platform: 'OpenClaw', category: '它是谁', categoryIcon: '🪪', type: 'persona',
    name: 'SOUL.md', displayName: 'SOUL.md（灵魂核心）',
    description: 'OpenClaw 的核心人格：信念、边界、氛围。修改后下次对话立即生效。',
    path: soulPath, id: makeId(soulPath),
    exists: await exists(soulPath), isReadonly: false, injectable: true,
  });

  const idPath = path.join(ocW, 'IDENTITY.md');
  files.push({
    platform: 'OpenClaw', category: '它是谁', categoryIcon: '🪪', type: 'persona',
    name: 'IDENTITY.md', displayName: 'IDENTITY.md（身份卡）',
    description: 'agent 的名字、物种、emoji、头像。它的自我认同。',
    path: idPath, id: makeId(idPath),
    exists: await exists(idPath), isReadonly: false, injectable: false,
  });

  // ── 它怎么看你（认知）──
  const userPath = path.join(ocW, 'USER.md');
  files.push({
    platform: 'OpenClaw', category: '它怎么看你', categoryIcon: '🧠', type: 'persona',
    name: 'USER.md', displayName: 'USER.md（用户画像）',
    description: 'OpenClaw 对你的了解：姓名、偏好、项目。会随交互逐步补充，你也可以直接编辑。',
    path: userPath, id: makeId(userPath),
    exists: await exists(userPath), isReadonly: false, injectable: true,
  });

  // 每日记忆日志
  const ocMemDir = path.join(ocW, 'memory');
  try {
    const memEntries = await fs.readdir(ocMemDir);
    for (const entry of memEntries) {
      if (!entry.endsWith('.md')) continue;
      const fp = path.join(ocMemDir, entry);
      files.push({
        platform: 'OpenClaw', category: '它怎么看你', categoryIcon: '🧠', type: 'memory',
        name: entry, displayName: entry.replace('.md', ''),
        description: '每日记忆日志，记录当天发生的事件和决策。可查看 agent 记住了什么。',
        path: fp, id: makeId(fp),
        exists: true, isReadonly: false, injectable: false,
      });
    }
  } catch { /* no memory dir yet */ }

  // ── 它怎么工作（规则）──
  const agentsPath = path.join(ocW, 'AGENTS.md');
  files.push({
    platform: 'OpenClaw', category: '它怎么工作', categoryIcon: '📋', type: 'rules',
    name: 'AGENTS.md', displayName: 'AGENTS.md（工作流程）',
    description: '每次会话的标准流程：先读灵魂 → 用户画像 → 记忆。定义记忆策略和安全边界。',
    path: agentsPath, id: makeId(agentsPath),
    exists: await exists(agentsPath), isReadonly: false, injectable: false,
  });

  const bootPath = path.join(ocW, 'BOOTSTRAP.md');
  files.push({
    platform: 'OpenClaw', category: '它怎么工作', categoryIcon: '📋', type: 'rules',
    name: 'BOOTSTRAP.md', displayName: 'BOOTSTRAP.md（初始化）',
    description: '首次运行时的引导流程。agent 完成自我认知后会自行删除。',
    path: bootPath, id: makeId(bootPath),
    exists: await exists(bootPath), isReadonly: false, injectable: false,
  });

  // ── 配置 ──
  const toolsPath = path.join(ocW, 'TOOLS.md');
  files.push({
    platform: 'OpenClaw', category: '配置', categoryIcon: '⚙️', type: 'config',
    name: 'TOOLS.md', displayName: 'TOOLS.md（环境工具）',
    description: 'API 端点、认证方式、SSH 别名。',
    path: toolsPath, id: makeId(toolsPath),
    exists: await exists(toolsPath), isReadonly: false, injectable: false,
  });

  const hbPath = path.join(ocW, 'HEARTBEAT.md');
  files.push({
    platform: 'OpenClaw', category: '配置', categoryIcon: '⚙️', type: 'config',
    name: 'HEARTBEAT.md', displayName: 'HEARTBEAT.md（定时任务）',
    description: '周期性任务清单。',
    path: hbPath, id: makeId(hbPath),
    exists: await exists(hbPath), isReadonly: false, injectable: false,
  });

  const ocConfig = path.join(home, '.openclaw', 'openclaw.json');
  files.push({
    platform: 'OpenClaw', category: '配置', categoryIcon: '⚙️', type: 'config',
    name: 'openclaw.json', displayName: 'openclaw.json（主配置）',
    description: 'OpenClaw 全局配置。只读。',
    path: ocConfig, id: makeId(ocConfig),
    exists: await exists(ocConfig), isReadonly: true, injectable: false,
  });

  return files;
}
