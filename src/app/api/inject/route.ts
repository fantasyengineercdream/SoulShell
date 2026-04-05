import { NextRequest, NextResponse } from 'next/server';
import { injectClaudeCode, injectOpenClaw, injectCodex } from '@/lib/injection';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { platform, targetPath, persona } = await req.json();

    if (!targetPath || !persona) {
      return NextResponse.json({ error: 'Missing targetPath or persona' }, { status: 400 });
    }

    if (platform === 'Claude Code') {
      await injectClaudeCode(targetPath, persona);
    } else if (platform === 'OpenClaw') {
      const dir = path.dirname(targetPath);
      await injectOpenClaw(dir, persona);
    } else if (platform === 'Codex') {
      await injectCodex(targetPath, persona);
    } else {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Injection failed: ${msg}` }, { status: 500 });
  }
}
