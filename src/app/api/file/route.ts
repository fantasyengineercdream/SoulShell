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
  } catch { /* 新文件无需备份 */ }
}

async function getBackups(filePath: string): Promise<{ name: string; path: string; time: string }[]> {
  const dir = path.dirname(filePath);
  const backupDir = path.join(dir, '.soulshell-backup');
  const baseName = path.basename(filePath);
  const results: { name: string; path: string; time: string }[] = [];

  try {
    const entries = await fs.readdir(backupDir);
    for (const entry of entries) {
      if (entry.startsWith(baseName + '.') && entry.endsWith('.bak')) {
        const timeStr = entry.replace(baseName + '.', '').replace('.bak', '');
        results.push({
          name: entry,
          path: path.join(backupDir, entry),
          time: timeStr,
        });
      }
    }
    results.sort((a, b) => b.time.localeCompare(a.time)); // 最新在前
  } catch { /* no backup dir */ }

  return results;
}

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path');
  const action = req.nextUrl.searchParams.get('action');

  if (!filePath) return NextResponse.json({ error: '缺少 path 参数' }, { status: 400 });

  // 列出备份
  if (action === 'backups') {
    const backups = await getBackups(filePath);
    return NextResponse.json({ backups });
  }

  // 读取文件
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: '文件未找到' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path: filePath, content, action, backupPath } = body;

    // 回退到备份
    if (action === 'revert' && backupPath && filePath) {
      // 先备份当前版本
      await backupFile(filePath);
      // 读取备份内容
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      // 写回
      await fs.writeFile(filePath, backupContent, 'utf-8');
      return NextResponse.json({ success: true, content: backupContent });
    }

    // 普通保存
    if (!filePath || typeof content !== 'string') {
      return NextResponse.json({ error: '无效请求' }, { status: 400 });
    }
    await backupFile(filePath);
    await fs.writeFile(filePath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
