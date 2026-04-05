import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface DiscoveredFile {
  id: string;
  platform: 'Claude Code' | 'OpenClaw';
  category: string;
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

function makeId(filePath: string): string {
  return Buffer.from(filePath).toString('base64');
}

async function fileExists(filePath: string): Promise<boolean> {
  try { await fs.access(filePath); return true; } catch { return false; }
}

export async function discoverFiles(): Promise<DiscoveredFile[]> {
  const home = os.homedir();
  const cwd = process.cwd();
  const files: DiscoveredFile[] = [];

  // ══════════════════════════════════════════════════════════
  //  Claude Code
  // ══════════════════════════════════════════════════════════

  // ── 人格指令 ──
  const globalClaude = path.join(home, 'CLAUDE.md');
  files.push({
    platform: 'Claude Code', category: '人格指令', type: 'persona',
    name: 'CLAUDE.md', displayName: '全局 CLAUDE.md',
    description: '跨所有项目生效。每轮对话注入，compaction 后从磁盘重读。40k 字符上限。',
    path: globalClaude, id: makeId(globalClaude),
    exists: await fileExists(globalClaude),
    isReadonly: false, injectable: true,
  });

  const projectClaude = path.join(cwd, 'CLAUDE.md');
  files.push({
    platform: 'Claude Code', category: '人格指令', type: 'persona',
    name: 'CLAUDE.md', displayName: '项目 CLAUDE.md',
    description: '仅对当前项目生效，可覆盖全局指令。',
    path: projectClaude, id: makeId(projectClaude),
    exists: await fileExists(projectClaude),
    isReadonly: false, injectable: true,
  });

  // ── 规则文件 ──
  const rulesDir = path.join(cwd, '.claude', 'rules');
  try {
    const entries = await fs.readdir(rulesDir);
    for (const entry of entries) {
      if (entry.endsWith('.md')) {
        const fp = path.join(rulesDir, entry);
        files.push({
          platform: 'Claude Code', category: '规则文件', type: 'rules',
          name: entry, displayName: entry,
          description: '上下文规则，由 Claude Code 按条件自动加载。',
          path: fp, id: makeId(fp),
          exists: true, isReadonly: false, injectable: false,
        });
      }
    }
  } catch { /* dir doesn't exist */ }

  // ── 当前项目记忆 ──
  // 只展示当前项目的记忆，不扫全局所有项目
  const projectMemDir = path.join(cwd, '.claude', 'memory');
  const projectMemIndex = path.join(projectMemDir, 'MEMORY.md');
  files.push({
    platform: 'Claude Code', category: '当前项目记忆', type: 'memory',
    name: 'MEMORY.md', displayName: 'MEMORY.md（记忆索引）',
    description: '前 200 行注入系统提示。索引指向下方的 topic 文件。autoDream 会定期整合重写。',
    path: projectMemIndex, id: makeId(projectMemIndex),
    exists: await fileExists(projectMemIndex),
    isReadonly: false, injectable: false,
    warning: '梦境素材：autoDream 会整合重写此文件。你的编辑会参与记忆整合，但不保证原样保留。',
  });

  // 当前项目的 topic 文件
  try {
    const memEntries = await fs.readdir(projectMemDir);
    for (const memFile of memEntries) {
      if (memFile === 'MEMORY.md') continue;
      if (memFile.endsWith('.md')) {
        const fp = path.join(projectMemDir, memFile);
        files.push({
          platform: 'Claude Code', category: '当前项目记忆', type: 'memory',
          name: memFile, displayName: memFile,
          description: '记忆 topic 文件，按需加载到对话中。记录 user/feedback/project/reference 四类记忆。',
          path: fp, id: makeId(fp),
          exists: true, isReadonly: false, injectable: false,
        });
      }
    }
  } catch { /* no memory dir */ }

  // ── 系统配置（只读）──
  const settingsPath = path.join(home, '.claude', 'settings.json');
  files.push({
    platform: 'Claude Code', category: '系统配置', type: 'config',
    name: 'settings.json', displayName: 'settings.json',
    description: 'hooks 配置、权限白名单、MCP 服务器。只读展示，修改需谨慎。',
    path: settingsPath, id: makeId(settingsPath),
    exists: await fileExists(settingsPath),
    isReadonly: true, injectable: false,
  });

  // ══════════════════════════════════════════════════════════
  //  OpenClaw — bootstrap 文件在 ~/.openclaw/workspace/ 下
  //  每次会话启动时按顺序读取：SOUL.md → USER.md → MEMORY.md
  //  即使未安装也显示，让用户知道我们支持
  // ══════════════════════════════════════════════════════════

  const ocWorkspace = path.join(home, '.openclaw', 'workspace');

  const openclawFiles: Array<{
    name: string; displayName: string; category: string;
    type: 'persona' | 'memory' | 'rules' | 'config';
    description: string; injectable: boolean; isReadonly: boolean;
  }> = [
    // ── 人格核心：每次会话首先读取 ──
    { name: 'SOUL.md', displayName: 'SOUL.md — 人格核心', category: '人格定义',
      type: 'persona',
      description: '定义 agent 是谁：核心信念、边界、氛围。每次会话首先读取。修改后立即生效。',
      injectable: true, isReadonly: false },
    { name: 'USER.md', displayName: 'USER.md — 用户画像', category: '人格定义',
      type: 'persona',
      description: '关于你的信息：姓名、时区、偏好、项目。会随交互逐步补充。',
      injectable: true, isReadonly: false },
    { name: 'IDENTITY.md', displayName: 'IDENTITY.md — 身份元数据', category: '人格定义',
      type: 'persona',
      description: 'agent 的名字、物种、氛围、emoji、头像。第一次对话时填写。',
      injectable: false, isReadonly: false },

    // ── 行为规则 ──
    { name: 'AGENTS.md', displayName: 'AGENTS.md — 工作流程', category: '行为规则',
      type: 'rules',
      description: '每次会话的标准流程：先读 SOUL → USER → 记忆。定义记忆策略和安全边界。',
      injectable: false, isReadonly: false },
    { name: 'BOOTSTRAP.md', displayName: 'BOOTSTRAP.md — 初始化指令', category: '行为规则',
      type: 'rules',
      description: '首次运行时的引导流程。agent 完成自我认知后会删除此文件。',
      injectable: false, isReadonly: false },

    // ── 记忆系统 ──
    { name: 'TOOLS.md', displayName: 'TOOLS.md — 环境工具', category: '环境与记忆',
      type: 'config',
      description: 'API 端点、认证方式、SSH 别名、设备信息。',
      injectable: false, isReadonly: false },
    { name: 'HEARTBEAT.md', displayName: 'HEARTBEAT.md — 定时任务', category: '环境与记忆',
      type: 'config',
      description: '周期性 cron 任务清单。',
      injectable: false, isReadonly: false },
  ];

  for (const oc of openclawFiles) {
    const fp = path.join(ocWorkspace, oc.name);
    files.push({
      platform: 'OpenClaw',
      category: oc.category,
      type: oc.type,
      name: oc.name,
      displayName: oc.displayName,
      description: oc.description,
      path: fp,
      id: makeId(fp),
      exists: await fileExists(fp),
      isReadonly: oc.isReadonly,
      injectable: oc.injectable,
    });
  }

  // OpenClaw 记忆日志：workspace/memory/*.md
  const ocMemDir = path.join(ocWorkspace, 'memory');
  try {
    const memEntries = await fs.readdir(ocMemDir);
    for (const entry of memEntries) {
      if (entry.endsWith('.md')) {
        const fp = path.join(ocMemDir, entry);
        files.push({
          platform: 'OpenClaw', category: '每日记忆', type: 'memory',
          name: entry, displayName: entry,
          description: '每日记忆日志，记录当天发生的事件和决策。',
          path: fp, id: makeId(fp),
          exists: true, isReadonly: false, injectable: false,
        });
      }
    }
  } catch { /* no memory dir yet */ }

  // OpenClaw 主配置文件
  const ocConfig = path.join(home, '.openclaw', 'openclaw.json');
  files.push({
    platform: 'OpenClaw', category: '系统配置', type: 'config',
    name: 'openclaw.json', displayName: 'openclaw.json — 主配置',
    description: 'OpenClaw 的全局配置文件。只读展示。',
    path: ocConfig, id: makeId(ocConfig),
    exists: await fileExists(ocConfig),
    isReadonly: true, injectable: false,
  });

  return files;
}
