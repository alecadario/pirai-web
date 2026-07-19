import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

function atHeaders() {
  return { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json' };
}

async function findUser(userId: string) {
  const params = new URLSearchParams({ filterByFormula: `{user_id} = "${userId}"`, maxRecords: '1' });
  const r = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users?${params}`, { headers: atHeaders() });
  if (!r.ok) throw new Error(`Airtable error: ${r.status}`);
  const data = await r.json();
  return data.records?.[0] || null;
}

async function patchUser(recordId: string, fields: Record<string, unknown>) {
  const r = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Users/${recordId}`, {
    method: 'PATCH',
    headers: atHeaders(),
    body: JSON.stringify({ fields }),
  });
  if (!r.ok) throw new Error(`Airtable patch error: ${r.status}`);
  return r.json();
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, stage, age_range, passion, impact, services_description, cv_text, profile_photo, certifications, ideal_day, genero } = body;
    if (!userId) return NextResponse.json({ error: 'Falta userId' }, { status: 400 });

    const user = await findUser(userId);
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const fields: Record<string, unknown> = {};
    if (stage !== undefined) fields.stage = stage;
    if (age_range !== undefined) fields.age_range = age_range;
    if (passion !== undefined) fields.passion = passion;
    if (impact !== undefined) fields.impact = impact;
    if (services_description !== undefined) fields.services_description = services_description;
    if (cv_text !== undefined) fields.cv_text = cv_text;
    if (profile_photo !== undefined) fields.profile_photo = profile_photo;
    if (certifications !== undefined) fields.certifications = certifications;
    if (ideal_day !== undefined) fields.ideal_day = ideal_day;
    if (genero !== undefined) fields.genero = genero;

    const existing = user.fields.onboarding_answers ? JSON.parse(user.fields.onboarding_answers) : {};
    fields.onboarding_answers = JSON.stringify({ ...existing, ...fields });

    await patchUser(user.id, fields);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('profile PATCH error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
