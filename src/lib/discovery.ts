import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface DiscoveredFile {
  id: string;
  platform: 'Claude Code' | 'OpenClaw';
  layer: string;
  layerDescription: string;
  type: 'persona' | 'memory' | 'rules' | 'config';
  name: string;
  displayName: string;
  description: string;
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

/**
 * 把 Claude Code 的项目目录编码名还原成可读名称
 * 例如 "M--code-soulshell-app" → "M:/code/soulshell-app"
 */
function decodeProjectName(encoded: string): string {
  // 格式：盘符大写字母 + -- + 路径（分隔符变成 -）
  const match = encoded.match(/^([A-Z])--(.*)/);
  if (match) {
    const drive = match[1];
    const rest = match[2]
      .replace(/--------/g, '/[CJK]/')  // 中文字符编码
      .replace(/--/g, '/')
      .replace(/-/g, '/');
    return `${drive}:/${rest}`;
  }
  return encoded;
}

export async function discoverFiles(): Promise<DiscoveredFile[]> {
  const home = os.homedir();
  const cwd = process.cwd();
  const files: DiscoveredFile[] = [];

  // ══════════════════════════════════════════════════════════
  //  Claude Code — 人格/行为控制体系（基于泄露源码深度分析）
  //
  //  第一层：System Prompt 组合机制（不可编辑，内置）
  //  第二层：CLAUDE.md 人格指令（用户可控的核心）
  //  第三层：规则文件（上下文规则）
  //  第四层：记忆系统（user/feedback/project/reference 四类）
  //  第五层：系统配置（hooks、权限）
  //  第六层：Buddy Companion（展示参考）
  // ══════════════════════════════════════════════════════════

  // ── 第二层：CLAUDE.md 人格指令 ──
  // 这是用户能控制的人格核心，40k字符上限，每轮对话注入，compaction 后从磁盘重新读取
  await tryAdd(files, path.join(home, 'CLAUDE.md'), {
    platform: 'Claude Code',
    layer: '人格指令（第二层）',
    layerDescription: '用户可控的人格核心，每轮对话注入，40k字符上限',
    type: 'persona',
    name: 'CLAUDE.md',
    displayName: '全局人格指令',
    description: '跨所有项目生效的全局行为指令，compaction 后会从磁盘重新读取',
    isReadonly: false, injectable: true,
  });

  await tryAdd(files, path.join(home, '.claude', 'CLAUDE.md'), {
    platform: 'Claude Code',
    layer: '人格指令（第二层）',
    layerDescription: '用户可控的人格核心，每轮对话注入，40k字符上限',
    type: 'persona',
    name: '.claude/CLAUDE.md',
    displayName: '全局人格指令（.claude 目录）',
    description: '同上，另一个存放位置',
    isReadonly: false, injectable: true,
  });

  await tryAdd(files, path.join(cwd, 'CLAUDE.md'), {
    platform: 'Claude Code',
    layer: '人格指令（第二层）',
    layerDescription: '项目级覆盖，可以定义不同项目的不同人格',
    type: 'persona',
    name: 'CLAUDE.md',
    displayName: '项目级人格指令',
    description: '仅对当前项目生效，可覆盖全局设置',
    isReadonly: false, injectable: true,
  });

  // ── 第三层：规则文件 ──
  const rulesDir = path.join(cwd, '.claude', 'rules');
  try {
    const entries = await fs.readdir(rulesDir);
    for (const entry of entries) {
      if (entry.endsWith('.md')) {
        await tryAdd(files, path.join(rulesDir, entry), {
          platform: 'Claude Code',
          layer: '规则文件（第三层）',
          layerDescription: '上下文规则，按条件自动加载',
          type: 'rules',
          name: entry,
          displayName: entry,
          description: '上下文规则文件，由 Claude Code 按条件加载到对话中',
          isReadonly: false, injectable: false,
        });
      }
    }
  } catch { /* dir doesn't exist */ }

  // ── 第四层：记忆系统 ──
  // MEMORY.md 是轻量索引（前200行进系统提示），实际知识分布在 topic 文件中
  // autoDream 会在空闲时整合（Orient→Gather→Consolidate→Prune）
  // 记忆分4类：user（用户画像）、feedback（行为调参）、project（项目上下文）、reference（外部指针）

  // 当前项目记忆
  await tryAdd(files, path.join(cwd, '.claude', 'memory', 'MEMORY.md'), {
    platform: 'Claude Code',
    layer: '记忆系统（第四层）',
    layerDescription: '四类记忆：user/feedback/project/reference，autoDream 会整合重写',
    type: 'memory',
    name: 'MEMORY.md',
    displayName: '当前项目记忆索引',
    description: '前200行注入系统提示，autoDream 会定期整合重写。是人格个性化的关键基础。',
    isReadonly: false, injectable: false,
    warning: '梦境素材：autoDream 会整合重写此文件。你的编辑会成为记忆整合的原料，但不保证原样保留。',
  });

  // 扫描所有项目记忆
  const projectsDir = path.join(home, '.claude', 'projects');
  try {
    const projects = await fs.readdir(projectsDir);
    for (const proj of projects) {
      const memDir = path.join(projectsDir, proj, 'memory');
      const memIndex = path.join(memDir, 'MEMORY.md');

      try {
        await fs.access(memIndex);
      } catch {
        continue; // 这个项目没有 MEMORY.md，跳过
      }

      const readableName = decodeProjectName(proj);

      files.push({
        platform: 'Claude Code',
        layer: '记忆系统（第四层）',
        layerDescription: '四类记忆：user/feedback/project/reference，autoDream 会整合重写',
        type: 'memory',
        name: `${proj}/MEMORY.md`,
        displayName: `📁 ${readableName}`,
        description: 'user(用户画像) + feedback(行为调参) + project(项目上下文) + reference(外部指针)',
        path: memIndex,
        id: Buffer.from(memIndex).toString('base64'),
        isReadonly: false, injectable: false,
        warning: '梦境素材：autoDream 会整合重写此文件。你的编辑会成为记忆整合的原料，但不保证原样保留。',
      });

      // 扫描该项目下的 memory topic 文件
      try {
        const memEntries = await fs.readdir(memDir);
        for (const memFile of memEntries) {
          if (memFile === 'MEMORY.md') continue;
          if (memFile.endsWith('.md')) {
            files.push({
              platform: 'Claude Code',
              layer: '记忆系统（第四层）',
              layerDescription: '记忆 topic 文件，按需加载',
              type: 'memory',
              name: memFile,
              displayName: `  └ ${memFile}`,
              description: `项目 ${readableName} 的记忆详情文件`,
              path: path.join(memDir, memFile),
              id: Buffer.from(path.join(memDir, memFile)).toString('base64'),
              isReadonly: false, injectable: false,
            });
          }
        }
      } catch { /* no topic files */ }
    }
  } catch { /* projects dir doesn't exist */ }

  // ── 第五层：系统配置 ──
  await tryAdd(files, path.join(home, '.claude', 'settings.json'), {
    platform: 'Claude Code',
    layer: '系统配置（第五层）',
    layerDescription: 'hooks、权限、MCP 服务器配置',
    type: 'config',
    name: 'settings.json',
    displayName: 'settings.json',
    description: 'hooks 配置、权限设置、MCP 服务器列表。修改需谨慎。',
    isReadonly: true, injectable: false,
  });

  // ══════════════════════════════════════════════════════════
  //  OpenClaw — 7个 bootstrap 文件
  //  每次会话启动时全部注入到 system prompt
  //  各文件职责分离：人格和操作规则不混淆，防止更新冲突
  // ══════════════════════════════════════════════════════════

  const ocBase = path.join(home, '.openclaw');

  await tryAdd(files, path.join(ocBase, 'SOUL.md'), {
    platform: 'OpenClaw',
    layer: '人格核心',
    layerDescription: '定义 agent 的身份、价值观、沟通风格，500-1500 词最佳',
    type: 'persona',
    name: 'SOUL.md',
    displayName: 'SOUL.md — 人格核心',
    description: '定义 agent 是谁、怎么说话、在乎什么。每次会话首先读取此文件。修改后立即生效。',
    isReadonly: false, injectable: true,
  });

  await tryAdd(files, path.join(ocBase, 'USER.md'), {
    platform: 'OpenClaw',
    layer: '用户画像',
    layerDescription: '关于用户的信息：姓名、时区、偏好、背景',
    type: 'persona',
    name: 'USER.md',
    displayName: 'USER.md — 用户画像',
    description: '让 agent 了解你是谁。与 SOUL.md 分离，避免用户信息和人格定义混淆。',
    isReadonly: false, injectable: true,
  });

  await tryAdd(files, path.join(ocBase, 'AGENTS.md'), {
    platform: 'OpenClaw',
    layer: '行为规则',
    layerDescription: '操作规则、路由策略、安全约束、范围边界',
    type: 'rules',
    name: 'AGENTS.md',
    displayName: 'AGENTS.md — 操作规则',
    description: '标准操作流程。人格保持稳定（月级），操作规则频繁更新（周级）。',
    isReadonly: false, injectable: false,
  });

  await tryAdd(files, path.join(ocBase, 'IDENTITY.md'), {
    platform: 'OpenClaw',
    layer: '元数据',
    layerDescription: 'agent 的名字、头像路径、emoji',
    type: 'persona',
    name: 'IDENTITY.md',
    displayName: 'IDENTITY.md — 身份元数据',
    description: '3-5行，纯元数据：名字、头像、emoji。',
    isReadonly: false, injectable: false,
  });

  await tryAdd(files, path.join(ocBase, 'TOOLS.md'), {
    platform: 'OpenClaw',
    layer: '环境配置',
    layerDescription: 'API 端点、认证头、SSH 别名、设备名',
    type: 'config',
    name: 'TOOLS.md',
    displayName: 'TOOLS.md — 环境与工具',
    description: '环境特定的"小抄"：API 地址、认证方式、SSH 别名等。',
    isReadonly: false, injectable: false,
  });

  await tryAdd(files, path.join(ocBase, 'MEMORY.md'), {
    platform: 'OpenClaw',
    layer: '学习记录',
    layerDescription: '已学到的模式：用户偏好、项目发现',
    type: 'memory',
    name: 'MEMORY.md',
    displayName: 'MEMORY.md — 学习记录',
    description: '只存新发现的模式，不重复 AGENTS.md 里已有的规则。',
    isReadonly: false, injectable: false,
  });

  await tryAdd(files, path.join(ocBase, 'HEARTBEAT.md'), {
    platform: 'OpenClaw',
    layer: '定时任务',
    layerDescription: '周期性 cron 任务清单',
    type: 'config',
    name: 'HEARTBEAT.md',
    displayName: 'HEARTBEAT.md — 定时任务',
    description: '简单的任务清单，详细指令放在其他文件里。',
    isReadonly: false, injectable: false,
  });

  return files;
}
