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
async function fileExists(p: string): Promise<boolean> { try { await fs.access(p); return true; } catch { return false; } }

/**
 * 将 CWD 转换为 Claude Code 项目目录的编码名
 * C:\Users\raine\code → C--Users-raine-code
 * M:\code → M--code
 */
function encodeCwdToProjectSlug(cwd: string): string {
  // 统一用正斜杠
  let p = cwd.replace(/\\/g, '/');
  // 去掉尾部斜杠
  p = p.replace(/\/+$/, '');
  // 盘符: "M:/code" → "M--code"（Claude Code 用双横杠分隔盘符）
  p = p.replace(/^([A-Za-z]):\//, (_, d) => d.toUpperCase() + '--');
  // 剩余 / 替换为 -
  p = p.replace(/\//g, '-');
  return p;
}

export async function discoverFiles(): Promise<DiscoveredFile[]> {
  const home = os.homedir();
  const cwd = process.cwd();
  const files: DiscoveredFile[] = [];

  const claudeDir = path.join(home, '.claude');

  // 查找当前项目对应的记忆目录
  // Claude Code 用编码后的路径做目录名，需要逐级向上查找匹配
  const findProjectMemDir = async (): Promise<{ dir: string; slug: string } | null> => {
    let checkPath = cwd;
    for (let i = 0; i < 5; i++) { // 最多向上找 5 级
      const slug = encodeCwdToProjectSlug(checkPath);
      const memDir = path.join(claudeDir, 'projects', slug, 'memory');
      if (await fileExists(memDir)) {
        return { dir: memDir, slug };
      }
      const parent = path.dirname(checkPath);
      if (parent === checkPath) break; // 到根了
      checkPath = parent;
    }
    return null;
  };

  const projectMem = await findProjectMemDir();
  const projectMemDir = projectMem?.dir || path.join(claudeDir, 'projects', encodeCwdToProjectSlug(cwd), 'memory');

  // ══════════════════════════════════════════════════════════
  //  Claude Code
  // ══════════════════════════════════════════════════════════

  // ── 它是谁（人格）──
  // 全局 CLAUDE.md（~/.claude/CLAUDE.md）
  const globalClaude = path.join(claudeDir, 'CLAUDE.md');
  files.push({
    platform: 'Claude Code', category: '它是谁', categoryIcon: '🪪', type: 'persona',
    name: 'CLAUDE.md', displayName: '全局 CLAUDE.md',
    description: '跨所有项目生效的全局人格指令。每轮对话注入，40k 字符上限。',
    path: globalClaude, id: makeId(globalClaude),
    exists: await fileExists(globalClaude), isReadonly: false, injectable: true,
  });

  // 项目级 CLAUDE.md（当前目录下）
  const projectClaude = path.join(cwd, 'CLAUDE.md');
  files.push({
    platform: 'Claude Code', category: '它是谁', categoryIcon: '🪪', type: 'persona',
    name: 'CLAUDE.md', displayName: '项目 CLAUDE.md',
    description: '仅在当前项目生效。可以让不同项目有不同的人格。',
    path: projectClaude, id: makeId(projectClaude),
    exists: await fileExists(projectClaude), isReadonly: false, injectable: true,
  });

  // ── 它怎么看你（认知/记忆）──
  // 记忆文件在 ~/.claude/projects/<slug>/memory/ 下
  const memIndex = path.join(projectMemDir, 'MEMORY.md');
  files.push({
    platform: 'Claude Code', category: '它怎么看你', categoryIcon: '🧠', type: 'memory',
    name: 'MEMORY.md', displayName: 'MEMORY.md（记忆索引）',
    description: '前 200 行注入系统提示。索引指向下方的 topic 文件。四类记忆：user/feedback/project/reference。',
    path: memIndex, id: makeId(memIndex),
    exists: await fileExists(memIndex), isReadonly: false, injectable: false,
    warning: '梦境素材：autoDream 会整合重写。你的编辑会参与记忆整合，但不保证原样保留。',
  });

  // topic 文件——Claude Code 对你各方面的认知
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
  } catch { /* 还没有记忆目录 */ }

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
  const settingsPath = path.join(claudeDir, 'settings.json');
  files.push({
    platform: 'Claude Code', category: '配置', categoryIcon: '⚙️', type: 'config',
    name: 'settings.json', displayName: 'settings.json',
    description: 'hooks、权限白名单、MCP 服务器。只读，了解系统如何配置。',
    path: settingsPath, id: makeId(settingsPath),
    exists: await fileExists(settingsPath), isReadonly: true, injectable: false,
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
    exists: await fileExists(soulPath), isReadonly: false, injectable: true,
  });

  const idPath = path.join(ocW, 'IDENTITY.md');
  files.push({
    platform: 'OpenClaw', category: '它是谁', categoryIcon: '🪪', type: 'persona',
    name: 'IDENTITY.md', displayName: 'IDENTITY.md（身份卡）',
    description: 'agent 的名字、物种、emoji、头像。它的自我认同。',
    path: idPath, id: makeId(idPath),
    exists: await fileExists(idPath), isReadonly: false, injectable: false,
  });

  // ── 它怎么看你（认知）──
  const userPath = path.join(ocW, 'USER.md');
  files.push({
    platform: 'OpenClaw', category: '它怎么看你', categoryIcon: '🧠', type: 'persona',
    name: 'USER.md', displayName: 'USER.md（用户画像）',
    description: 'OpenClaw 对你的了解：姓名、偏好、项目。可以直接编辑。',
    path: userPath, id: makeId(userPath),
    exists: await fileExists(userPath), isReadonly: false, injectable: true,
  });

  const ocMemDir = path.join(ocW, 'memory');
  try {
    const memEntries = await fs.readdir(ocMemDir);
    for (const entry of memEntries) {
      if (!entry.endsWith('.md')) continue;
      const fp = path.join(ocMemDir, entry);
      files.push({
        platform: 'OpenClaw', category: '它怎么看你', categoryIcon: '🧠', type: 'memory',
        name: entry, displayName: entry.replace('.md', ''),
        description: '每日记忆日志，记录当天发生的事件和决策。',
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
    description: '每次会话的标准流程：先读灵魂 → 用户画像 → 记忆。定义安全边界。',
    path: agentsPath, id: makeId(agentsPath),
    exists: await fileExists(agentsPath), isReadonly: false, injectable: false,
  });

  const bootPath = path.join(ocW, 'BOOTSTRAP.md');
  files.push({
    platform: 'OpenClaw', category: '它怎么工作', categoryIcon: '📋', type: 'rules',
    name: 'BOOTSTRAP.md', displayName: 'BOOTSTRAP.md（初始化）',
    description: '首次运行时的引导流程。agent 完成自我认知后会自行删除。',
    path: bootPath, id: makeId(bootPath),
    exists: await fileExists(bootPath), isReadonly: false, injectable: false,
  });

  // ── 配置 ──
  const toolsPath = path.join(ocW, 'TOOLS.md');
  files.push({
    platform: 'OpenClaw', category: '配置', categoryIcon: '⚙️', type: 'config',
    name: 'TOOLS.md', displayName: 'TOOLS.md（环境工具）',
    description: 'API 端点、认证方式、SSH 别名。',
    path: toolsPath, id: makeId(toolsPath),
    exists: await fileExists(toolsPath), isReadonly: false, injectable: false,
  });

  const hbPath = path.join(ocW, 'HEARTBEAT.md');
  files.push({
    platform: 'OpenClaw', category: '配置', categoryIcon: '⚙️', type: 'config',
    name: 'HEARTBEAT.md', displayName: 'HEARTBEAT.md（定时任务）',
    description: '周期性任务清单。',
    path: hbPath, id: makeId(hbPath),
    exists: await fileExists(hbPath), isReadonly: false, injectable: false,
  });

  const ocConfig = path.join(home, '.openclaw', 'openclaw.json');
  files.push({
    platform: 'OpenClaw', category: '配置', categoryIcon: '⚙️', type: 'config',
    name: 'openclaw.json', displayName: 'openclaw.json（主配置）',
    description: 'OpenClaw 全局配置。只读。',
    path: ocConfig, id: makeId(ocConfig),
    exists: await fileExists(ocConfig), isReadonly: true, injectable: false,
  });

  return files;
}
