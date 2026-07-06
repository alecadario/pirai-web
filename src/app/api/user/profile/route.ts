import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const res = await fetch(`${BACKEND}/api/user-record?userId=${userId}`);
  const data = await res.json();
  console.log('[user/profile GET] raw data:', JSON.stringify(data).slice(0, 500));
  const f = data.record?.fields || {};
  const answers = f.onboarding_answers ? JSON.parse(f.onboarding_answers) : {};
  console.log('[user/profile GET] fields keys:', Object.keys(f));
  console.log('[user/profile GET] answers keys:', Object.keys(answers));

  return NextResponse.json({
    stage: f.stage || answers.stage || null,
    age_range: f.age_range || answers.age_range || null,
    passion: f.passion || answers.passion || '',
    impact: f.impact || answers.impact || '',
    ideal_day: f.ideal_day || answers.ideal_day || '',
    services_description: f.services_description || answers.services_description || '',
    fullName: f.name || f.fullName || answers.fullName || '',
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BACKEND}/api/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
