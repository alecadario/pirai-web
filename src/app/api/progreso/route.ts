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

// GET /api/progreso?email=&curso_id= — lesson ids fully watched by this person in this course
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    const cursoId = req.nextUrl.searchParams.get('curso_id');
    if (!email || !cursoId) return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });

    const params = new URLSearchParams({
      filterByFormula: `AND({email}="${email}", {curso_id}="${cursoId}", {visto_completo}=1)`,
    });
    const d = await at(`/${encodeURIComponent('Progreso')}?${params}`);
    const leccionesVistas = (d.records || []).map((r: { fields: Record<string, unknown> }) => r.fields.leccion_id);
    return NextResponse.json({ leccionesVistas });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST /api/progreso — mark a lesson as watched to the end
export async function POST(req: NextRequest) {
  try {
    const { email, curso_id, leccion_id } = await req.json();
    if (!email || !curso_id || !leccion_id) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const checkParams = new URLSearchParams({
      filterByFormula: `AND({email}="${email}", {leccion_id}="${leccion_id}")`,
      maxRecords: '1',
    });
    const existing = await at(`/${encodeURIComponent('Progreso')}?${checkParams}`);
    if (existing.records?.length > 0) {
      return NextResponse.json({ ok: true, already: true });
    }

    await at(`/${encodeURIComponent('Progreso')}`, {
      method: 'POST',
      body: JSON.stringify({
        fields: { email, curso_id, leccion_id, visto_completo: true, fecha: new Date().toISOString() },
      }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
