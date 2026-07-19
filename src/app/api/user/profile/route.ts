import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '';

function atHeaders() {
  return { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' };
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const res = await fetch(`${BACKEND}/api/user-record?userId=${userId}`);
  const data = await res.json();
  const f = data.record?.fields || {};
  const answers = f.onboarding_answers ? JSON.parse(f.onboarding_answers) : {};

  return NextResponse.json({
    stage: f.stage || answers.stage || null,
    age_range: f.age_range || answers.age_range || null,
    genero: f.genero || answers.genero || 'femenino',
    passion: f.passion || answers.passion || '',
    impact: f.impact || answers.impact || '',
    ideal_day: f.ideal_day || answers.ideal_day || '',
    services_description: f.services_description || answers.services_description || '',
    fullName: f.name || f.fullName || answers.fullName || '',
    certifications: f.certifications || null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, stage, age_range, passion, impact, services_description, cv_text, profile_photo, certifications, ideal_day, genero } = body;
    if (!userId) return NextResponse.json({ error: 'Falta userId' }, { status: 400 });

    // Find user in Airtable
    const params = new URLSearchParams({ filterByFormula: `{user_id} = "${userId}"`, maxRecords: '1' });
    const findRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users?${params}`, { headers: atHeaders() });
    if (!findRes.ok) throw new Error(`Airtable find error: ${findRes.status}`);
    const findData = await findRes.json();
    const user = findData.records?.[0];
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const fields: Record<string, unknown> = {};
    if (stage !== undefined) fields.stage = stage;
    if (age_range !== undefined) fields.age_range = age_range;
    if (passion !== undefined) fields.passion = passion;
    if (impact !== undefined) fields.impact = impact;
    if (cv_text !== undefined) fields.cv_text = cv_text;
    if (profile_photo !== undefined) fields.profile_photo = profile_photo;
    if (certifications !== undefined) fields.certifications = certifications;
    if (ideal_day !== undefined) fields.ideal_day = ideal_day;
    if (genero !== undefined) fields.genero = genero;

    const existing = user.fields.onboarding_answers ? JSON.parse(user.fields.onboarding_answers) : {};
    const merged = { ...existing, ...fields };
    if (services_description !== undefined) merged.services_description = services_description;
    fields.onboarding_answers = JSON.stringify(merged);

    const patchRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users/${user.id}`, {
      method: 'PATCH',
      headers: atHeaders(),
      body: JSON.stringify({ fields }),
    });
    if (!patchRes.ok) throw new Error(`Airtable patch error: ${patchRes.status}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('user/profile POST error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
