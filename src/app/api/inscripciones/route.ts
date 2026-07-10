import { NextRequest, NextResponse } from 'next/server';

const AT_KEY = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || '';
const AT_BASE = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '';

function atHeaders() {
  return { Authorization: `Bearer ${AT_KEY}`, 'Content-Type': 'application/json' };
}

async function at(path: string, options: RequestInit = {}) {
  const r = await fetch(`https://api.airtable.com/v0/${AT_BASE}${path}`, {
    ...options,
    headers: { ...atHeaders(), ...(options.headers as Record<string, string> || {}) },
  });
  if (!r.ok) throw new Error(`Airtable ${r.status}`);
  return r.json();
}

// GET /api/inscripciones?email=&curso_id= — is this person enrolled in this course?
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    const cursoId = req.nextUrl.searchParams.get('curso_id');
    if (!email || !cursoId) return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });

    const params = new URLSearchParams({
      filterByFormula: `AND({email}="${email}", {curso_id}="${cursoId}")`,
      maxRecords: '1',
    });
    const d = await at(`/${encodeURIComponent('Inscripciones')}?${params}`);
    return NextResponse.json({ inscripto: (d.records || []).length > 0 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST /api/inscripciones — enroll a person in a course
export async function POST(req: NextRequest) {
  try {
    const { nombre, email, curso_id } = await req.json();
    if (!nombre || !email || !curso_id) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const checkParams = new URLSearchParams({
      filterByFormula: `AND({email}="${email}", {curso_id}="${curso_id}")`,
      maxRecords: '1',
    });
    const existing = await at(`/${encodeURIComponent('Inscripciones')}?${checkParams}`);
    if (existing.records?.length > 0) {
      return NextResponse.json({ ok: true, already: true });
    }

    await at(`/${encodeURIComponent('Inscripciones')}`, {
      method: 'POST',
      body: JSON.stringify({
        fields: { nombre, email, curso_id, fecha_inscripcion: new Date().toISOString() },
      }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
