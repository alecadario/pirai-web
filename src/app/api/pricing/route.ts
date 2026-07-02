import { NextRequest, NextResponse } from 'next/server';
const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';
export async function GET(req: NextRequest) {
  const currency = req.nextUrl.searchParams.get('currency') || 'USD';
  const res = await fetch(`${BACKEND}/api/pricing?currency=${currency}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
