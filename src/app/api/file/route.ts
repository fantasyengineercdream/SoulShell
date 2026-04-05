import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path');
  if (!filePath) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: 'File not found or unreadable' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { path: filePath, content } = await req.json();
    if (!filePath || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await fs.writeFile(filePath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Write failed' }, { status: 500 });
  }
}
