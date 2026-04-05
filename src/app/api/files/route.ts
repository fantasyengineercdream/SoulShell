import { NextResponse } from 'next/server';
import { discoverFiles } from '@/lib/discovery';

export async function GET() {
  try {
    const files = await discoverFiles();
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: 'Discovery failed' }, { status: 500 });
  }
}
