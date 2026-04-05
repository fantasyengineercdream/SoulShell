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
  //  OpenClaw — 7 个 bootstrap 文件
  //  即使未安装也显示，让用户知道我们支持
  // ══════════════════════════════════════════════════════════

  const ocBase = path.join(home, '.openclaw');

  const openclawFiles: Array<{
    name: string; displayName: string; category: string;
    type: 'persona' | 'memory' | 'rules' | 'config';
    description: string; injectable: boolean; isReadonly: boolean;
  }> = [
    { name: 'SOUL.md', displayName: 'SOUL.md', category: '人格核心',
      type: 'persona', description: '定义 agent 的身份、价值观、沟通风格。500-1500 词最佳。每次会话首先读取。',
      injectable: true, isReadonly: false },
    { name: 'USER.md', displayName: 'USER.md', category: '用户画像',
      type: 'persona', description: '关于你的信息：姓名、时区、沟通偏好、背景。与 SOUL.md 职责分离。',
      injectable: true, isReadonly: false },
    { name: 'AGENTS.md', displayName: 'AGENTS.md', category: '操作规则',
      type: 'rules', description: '路由策略、安全约束、范围边界。人格月级稳定，规则周级更新。',
      injectable: false, isReadonly: false },
    { name: 'IDENTITY.md', displayName: 'IDENTITY.md', category: '身份元数据',
      type: 'persona', description: '3-5 行：名字、头像路径、emoji。纯元数据。',
      injectable: false, isReadonly: false },
    { name: 'TOOLS.md', displayName: 'TOOLS.md', category: '环境工具',
      type: 'config', description: 'API 端点、认证头、SSH 别名、设备名。',
      injectable: false, isReadonly: false },
    { name: 'MEMORY.md', displayName: 'MEMORY.md', category: '学习记录',
      type: 'memory', description: '已学到的模式和偏好。不要重复 AGENTS.md 里已有的规则。',
      injectable: false, isReadonly: false },
    { name: 'HEARTBEAT.md', displayName: 'HEARTBEAT.md', category: '定时任务',
      type: 'config', description: '周期性 cron 任务清单。',
      injectable: false, isReadonly: false },
  ];

  for (const oc of openclawFiles) {
    const fp = path.join(ocBase, oc.name);
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

  return files;
}
