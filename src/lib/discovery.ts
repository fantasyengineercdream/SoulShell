import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface DiscoveredFile {
  id: string;
  platform: 'Claude Code' | 'OpenClaw' | 'Codex';
  type: 'persona' | 'memory' | 'rules' | 'config';
  name: string;
  path: string;
  isReadonly: boolean;
  warning?: string;
  scope: 'global' | 'project';
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

async function scanRulesDir(files: DiscoveredFile[], rulesDir: string) {
  try {
    const entries = await fs.readdir(rulesDir);
    for (const entry of entries) {
      if (entry.endsWith('.md')) {
        const fullPath = path.join(rulesDir, entry);
        await tryAdd(files, fullPath, {
          platform: 'Claude Code', type: 'rules', name: `rules/${entry}`,
          isReadonly: false, scope: 'project'
        });
      }
    }
  } catch {
    // Directory doesn't exist
  }
}

async function scanMemoryProjects(files: DiscoveredFile[], projectsDir: string) {
  try {
    const projects = await fs.readdir(projectsDir);
    for (const proj of projects) {
      const memoryPath = path.join(projectsDir, proj, 'memory', 'MEMORY.md');
      await tryAdd(files, memoryPath, {
        platform: 'Claude Code', type: 'memory', name: `${proj}/MEMORY.md`,
        isReadonly: false, scope: 'project',
        warning: '梦境素材：此内容可能被 autoDream 整合重写。你的编辑会成为梦境的原料。'
      });
    }
  } catch {
    // Directory doesn't exist
  }
}

export async function discoverFiles(): Promise<DiscoveredFile[]> {
  const home = os.homedir();
  const cwd = process.cwd();
  const files: DiscoveredFile[] = [];

  // ── Claude Code ──────────────────────────────────────────
  // Global CLAUDE.md
  await tryAdd(files, path.join(home, 'CLAUDE.md'), {
    platform: 'Claude Code', type: 'persona', name: 'Global CLAUDE.md',
    isReadonly: false, scope: 'global'
  });

  // Global settings (readonly)
  await tryAdd(files, path.join(home, '.claude', 'settings.json'), {
    platform: 'Claude Code', type: 'config', name: 'settings.json',
    isReadonly: true, scope: 'global'
  });

  // Global CLAUDE.md inside .claude
  await tryAdd(files, path.join(home, '.claude', 'CLAUDE.md'), {
    platform: 'Claude Code', type: 'persona', name: '.claude/CLAUDE.md',
    isReadonly: false, scope: 'global'
  });

  // Project-level CLAUDE.md (current working directory)
  await tryAdd(files, path.join(cwd, 'CLAUDE.md'), {
    platform: 'Claude Code', type: 'persona', name: 'Project CLAUDE.md',
    isReadonly: false, scope: 'project'
  });

  // Project rules: .claude/rules/*.md
  await scanRulesDir(files, path.join(cwd, '.claude', 'rules'));

  // Project memory
  await tryAdd(files, path.join(cwd, '.claude', 'memory', 'MEMORY.md'), {
    platform: 'Claude Code', type: 'memory', name: 'Project MEMORY.md',
    isReadonly: false, scope: 'project',
    warning: 'Dream Material: Content may be rewritten by autoDream consolidation. Edits here become dream素材.'
  });

  // All project memories under ~/.claude/projects/*/memory/MEMORY.md
  await scanMemoryProjects(files, path.join(home, '.claude', 'projects'));

  // ── OpenClaw ─────────────────────────────────────────────
  const ocBase = path.join(home, '.openclaw');
  await tryAdd(files, path.join(ocBase, 'SOUL.md'), { platform: 'OpenClaw', type: 'persona', name: 'SOUL.md', isReadonly: false, scope: 'global' });
  await tryAdd(files, path.join(ocBase, 'USER.md'), { platform: 'OpenClaw', type: 'persona', name: 'USER.md', isReadonly: false, scope: 'global' });
  await tryAdd(files, path.join(ocBase, 'AGENTS.md'), { platform: 'OpenClaw', type: 'rules', name: 'AGENTS.md', isReadonly: false, scope: 'global' });
  await tryAdd(files, path.join(ocBase, 'IDENTITY.md'), { platform: 'OpenClaw', type: 'persona', name: 'IDENTITY.md', isReadonly: false, scope: 'global' });
  await tryAdd(files, path.join(ocBase, 'TOOLS.md'), { platform: 'OpenClaw', type: 'config', name: 'TOOLS.md', isReadonly: false, scope: 'global' });
  await tryAdd(files, path.join(ocBase, 'MEMORY.md'), { platform: 'OpenClaw', type: 'memory', name: 'MEMORY.md', isReadonly: false, scope: 'global' });
  await tryAdd(files, path.join(ocBase, 'HEARTBEAT.md'), { platform: 'OpenClaw', type: 'config', name: 'HEARTBEAT.md', isReadonly: false, scope: 'global' });

  // ── Codex ────────────────────────────────────────────────
  await tryAdd(files, path.join(home, '.codex', 'config.toml'), { platform: 'Codex', type: 'config', name: 'config.toml', isReadonly: false, scope: 'global' });
  await tryAdd(files, path.join(cwd, '.codex', 'config.toml'), { platform: 'Codex', type: 'config', name: 'Project config.toml', isReadonly: false, scope: 'project' });
  await tryAdd(files, path.join(cwd, 'AGENTS.md'), { platform: 'Codex', type: 'persona', name: 'AGENTS.md', isReadonly: false, scope: 'project' });

  return files;
}
