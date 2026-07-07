import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const res = await fetch(`${BACKEND}/api/suggested-companies?${params}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
