import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const res = await fetch(`${API}/api/gmail-messages?userId=${encodeURIComponent(userId ?? '')}&maxResults=1`);
  const data = await res.json();
  const connected = !data.error && !data.authRequired;
  return NextResponse.json({ connected });
}
