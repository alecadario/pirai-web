import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/api/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: res.status });
    } catch {
      console.error('profile proxy: piraiapp returned non-JSON', res.status, text.slice(0, 500));
      return NextResponse.json({ error: `Backend error ${res.status}: ${text.slice(0, 200)}` }, { status: 500 });
    }
  } catch (err) {
    console.error('profile proxy fetch error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
