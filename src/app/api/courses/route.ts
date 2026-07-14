import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

export const dynamic = 'force-dynamic';

export async function GET() {
  const res = await fetch(`${BACKEND}/api/courses`, { cache: 'no-store' });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
