import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

// Proxy to piraiapp.com/api/bootstrap — returns companies and contacts for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ companies: [], contacts: [] });
  try {
    const res = await fetch(`${BACKEND}/api/bootstrap?userId=${userId}`);
    const data = await res.json();
    return NextResponse.json({
      companies: data.companies || [],
      contacts: data.contacts || [],
    }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ companies: [], contacts: [], error: String(err) }, { status: 500 });
  }
}
