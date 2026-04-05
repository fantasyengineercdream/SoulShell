import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function backupFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const dir = path.dirname(filePath);
    const backupDir = path.join(dir, '.soulshell-backup');
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = path.basename(filePath);
    const backupPath = path.join(backupDir, `${baseName}.${timestamp}.bak`);
    await fs.writeFile(backupPath, content, 'utf-8');
  } catch {
    // 文件不存在，无需备份（新文件）
  }
}

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path');
  if (!filePath) return NextResponse.json({ error: '缺少 path 参数' }, { status: 400 });

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: '文件未找到或不可读' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { path: filePath, content } = await req.json();
    if (!filePath || typeof content !== 'string') {
      return NextResponse.json({ error: '无效请求' }, { status: 400 });
    }

    // 保存前自动备份
    await backupFile(filePath);

    await fs.writeFile(filePath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '写入失败' }, { status: 500 });
  }
}
