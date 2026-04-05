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
 * Claude Code 注入：追加或替换 CLAUDE.md 底部的 `## SoulShell Persona` 块。
 * 非破坏性——用户原有内容完整保留。
 */
export async function injectClaudeCode(filePath: string, data: PersonaData): Promise<void> {
  let content = '';
  try { content = await fs.readFile(filePath, 'utf-8'); } catch { /* new file */ }

  const block = `## SoulShell Persona

<!-- SoulShell:start -->

### 身份
${data.identity}

### 沟通风格
${data.communication}

### 工作模式
${data.workMode}

### 禁令
${data.forbidden}

### 专长与上下文
${data.expertise}

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
 * OpenClaw 注入：覆写 SOUL.md 和 USER.md。
 * 注入前自动创建 .bak 备份。
 */
export async function injectOpenClaw(baseDir: string, data: PersonaData): Promise<void> {
  const soulPath = path.join(baseDir, 'SOUL.md');
  const userPath = path.join(baseDir, 'USER.md');

  // 备份已有文件
  for (const fp of [soulPath, userPath]) {
    try {
      const cur = await fs.readFile(fp, 'utf-8');
      await fs.writeFile(`${fp}.bak`, cur, 'utf-8');
    } catch { /* 无已有文件，跳过 */ }
  }

  const soulContent = `# Identity
${data.identity}

# Personality & Communication
${data.communication}

# Forbidden
${data.forbidden}
`;

  const userContent = `# User Profile & Expertise
${data.expertise}

# Work Mode Preferences
${data.workMode}
`;

  await fs.mkdir(baseDir, { recursive: true });
  await fs.writeFile(soulPath, soulContent, 'utf-8');
  await fs.writeFile(userPath, userContent, 'utf-8');
}
