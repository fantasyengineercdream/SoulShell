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
  path: string;
  isReadonly: boolean;
  warning?: string;
  injectable: boolean;
}

async function tryAdd(
  files: DiscoveredFile[],
  filePath: string,
  meta: Omit<DiscoveredFile, 'id' | 'path'>
) {
  try {
    await fs.access(filePath);
    files.push({ ...meta, path: filePath, id: Buffer.from(filePath).toString('base64') });
  } catch {
    // File doesn't exist, skip
  }
}

async function scanDir(
  files: DiscoveredFile[],
  dirPath: string,
  pattern: string,
  meta: Omit<DiscoveredFile, 'id' | 'path' | 'name' | 'displayName'>
) {
  try {
    const entries = await fs.readdir(dirPath);
    for (const entry of entries) {
      if (entry.endsWith(pattern)) {
        const fullPath = path.join(dirPath, entry);
        await tryAdd(files, fullPath, {
          ...meta,
          name: entry,
          displayName: entry,
        });
      }
    }
  } catch { /* dir doesn't exist */ }
}

export async function discoverFiles(): Promise<DiscoveredFile[]> {
  const home = os.homedir();
  const cwd = process.cwd();
  const files: DiscoveredFile[] = [];

  // ══════════════════════════════════════════════════════════
  // Claude Code — 人格/行为控制体系（6层，来自泄露源码分析）
  // ══════════════════════════════════════════════════════════

  // 第一层：全局人格指令
  await tryAdd(files, path.join(home, 'CLAUDE.md'), {
    platform: 'Claude Code', category: '人格指令', type: 'persona',
    name: 'CLAUDE.md', displayName: '全局 CLAUDE.md（人格核心）',
    isReadonly: false, injectable: true,
  });
  await tryAdd(files, path.join(home, '.claude', 'CLAUDE.md'), {
    platform: 'Claude Code', category: '人格指令', type: 'persona',
    name: '.claude/CLAUDE.md', displayName: '.claude/CLAUDE.md',
    isReadonly: false, injectable: true,
  });

  // 第二层：项目级人格指令
  await tryAdd(files, path.join(cwd, 'CLAUDE.md'), {
    platform: 'Claude Code', category: '项目级指令', type: 'persona',
    name: 'CLAUDE.md', displayName: '项目 CLAUDE.md（当前目录）',
    isReadonly: false, injectable: true,
  });

  // 第三层：规则文件 .claude/rules/*.md
  await scanDir(files, path.join(cwd, '.claude', 'rules'), '.md', {
    platform: 'Claude Code', category: '规则文件', type: 'rules',
    isReadonly: false, injectable: false,
  });

  // 第四层：记忆系统 — MEMORY.md（autoDream 会整合重写）
  // 项目级记忆
  await tryAdd(files, path.join(cwd, '.claude', 'memory', 'MEMORY.md'), {
    platform: 'Claude Code', category: '记忆系统', type: 'memory',
    name: 'MEMORY.md', displayName: '项目 MEMORY.md',
    isReadonly: false, injectable: false,
    warning: '梦境素材：此内容可能被 autoDream 整合重写。你的编辑会成为梦境的原料。',
  });

  // 全局项目记忆 — 扫描 ~/.claude/projects/*/memory/MEMORY.md
  const projectsDir = path.join(home, '.claude', 'projects');
  try {
    const projects = await fs.readdir(projectsDir);
    for (const proj of projects) {
      const memIndex = path.join(projectsDir, proj, 'memory', 'MEMORY.md');
      await tryAdd(files, memIndex, {
        platform: 'Claude Code', category: '记忆系统', type: 'memory',
        name: `${proj}/MEMORY.md`,
        displayName: `${proj.substring(0, 20)}... MEMORY.md`,
        isReadonly: false, injectable: false,
        warning: '梦境素材：此内容可能被 autoDream 整合重写。你的编辑会成为梦境的原料。',
      });
    }
  } catch { /* projects dir doesn't exist */ }

  // 第五层：系统配置（只读）
  await tryAdd(files, path.join(home, '.claude', 'settings.json'), {
    platform: 'Claude Code', category: '系统配置', type: 'config',
    name: 'settings.json', displayName: 'settings.json（hooks/权限）',
    isReadonly: true, injectable: false,
  });

  // ══════════════════════════════════════════════════════════
  // OpenClaw — 7个 bootstrap 文件，每次会话全部注入
  // ══════════════════════════════════════════════════════════

  const ocBase = path.join(home, '.openclaw');

  await tryAdd(files, path.join(ocBase, 'SOUL.md'), {
    platform: 'OpenClaw', category: '人格核心', type: 'persona',
    name: 'SOUL.md', displayName: 'SOUL.md（人格核心 500-1500词）',
    isReadonly: false, injectable: true,
  });
  await tryAdd(files, path.join(ocBase, 'USER.md'), {
    platform: 'OpenClaw', category: '人格核心', type: 'persona',
    name: 'USER.md', displayName: 'USER.md（用户画像）',
    isReadonly: false, injectable: true,
  });
  await tryAdd(files, path.join(ocBase, 'AGENTS.md'), {
    platform: 'OpenClaw', category: '行为规则', type: 'rules',
    name: 'AGENTS.md', displayName: 'AGENTS.md（操作规则/路由）',
    isReadonly: false, injectable: false,
  });
  await tryAdd(files, path.join(ocBase, 'IDENTITY.md'), {
    platform: 'OpenClaw', category: '元数据', type: 'persona',
    name: 'IDENTITY.md', displayName: 'IDENTITY.md（名字/头像）',
    isReadonly: false, injectable: false,
  });
  await tryAdd(files, path.join(ocBase, 'TOOLS.md'), {
    platform: 'OpenClaw', category: '环境配置', type: 'config',
    name: 'TOOLS.md', displayName: 'TOOLS.md（API/SSH/设备）',
    isReadonly: false, injectable: false,
  });
  await tryAdd(files, path.join(ocBase, 'MEMORY.md'), {
    platform: 'OpenClaw', category: '学习记录', type: 'memory',
    name: 'MEMORY.md', displayName: 'MEMORY.md（学习到的模式）',
    isReadonly: false, injectable: false,
  });
  await tryAdd(files, path.join(ocBase, 'HEARTBEAT.md'), {
    platform: 'OpenClaw', category: '定时任务', type: 'config',
    name: 'HEARTBEAT.md', displayName: 'HEARTBEAT.md（定时任务清单）',
    isReadonly: false, injectable: false,
  });

  return files;
}
