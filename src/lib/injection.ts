import fs from 'fs/promises';
import path from 'path';

export interface PersonaData {
  identity: string;
  communication: string;
  workMode: string;
  forbidden: string;
  expertise: string;
}

/**
 * Claude Code injection: append or replace `## SoulShell Persona` block at end of CLAUDE.md.
 * Non-destructive — user's existing content is preserved.
 */
export async function injectClaudeCode(filePath: string, data: PersonaData): Promise<void> {
  let content = '';
  try { content = await fs.readFile(filePath, 'utf-8'); } catch { /* new file */ }

  const block = `## SoulShell Persona
<!-- SoulShell:start -->
**Identity:** ${data.identity}

**Communication:** ${data.communication}

**Work Mode:** ${data.workMode}

**Forbidden:** ${data.forbidden}

**Expertise:** ${data.expertise}
<!-- SoulShell:end -->`;

  const regex = /## SoulShell Persona[\s\S]*?<!-- SoulShell:end -->/g;
  let newContent: string;

  if (regex.test(content)) {
    newContent = content.replace(regex, block);
  } else {
    const sep = content.length === 0 ? '' : content.endsWith('\n\n') ? '' : '\n\n';
    newContent = content + sep + block + '\n';
  }

  await fs.writeFile(filePath, newContent, 'utf-8');
}

/**
 * OpenClaw injection: overwrite SOUL.md and USER.md in target directory.
 * Creates .bak backup of existing files before overwriting.
 */
export async function injectOpenClaw(baseDir: string, data: PersonaData): Promise<void> {
  const soulPath = path.join(baseDir, 'SOUL.md');
  const userPath = path.join(baseDir, 'USER.md');

  // Backup existing files
  for (const fp of [soulPath, userPath]) {
    try {
      const cur = await fs.readFile(fp, 'utf-8');
      await fs.writeFile(`${fp}.bak`, cur, 'utf-8');
    } catch { /* no existing file to backup */ }
  }

  const soulContent = `# Identity
${data.identity}

# Style & Communication
${data.communication}

# Forbidden
${data.forbidden}
`;

  const userContent = `# User Expertise
${data.expertise}

# Work Mode Preferences
${data.workMode}
`;

  await fs.mkdir(baseDir, { recursive: true });
  await fs.writeFile(soulPath, soulContent, 'utf-8');
  await fs.writeFile(userPath, userContent, 'utf-8');
}

/**
 * Codex injection: same append strategy as Claude Code, targeting AGENTS.md.
 */
export async function injectCodex(filePath: string, data: PersonaData): Promise<void> {
  await injectClaudeCode(filePath, data);
}
