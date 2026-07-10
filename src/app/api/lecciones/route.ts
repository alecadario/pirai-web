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

// GET /api/lecciones?curso_id=recXXX — lessons of a course, in order
export async function GET(req: NextRequest) {
  try {
    const cursoId = req.nextUrl.searchParams.get('curso_id');
    if (!cursoId) return NextResponse.json({ error: 'Falta curso_id' }, { status: 400 });

    const params = new URLSearchParams({
      filterByFormula: `{curso_id}="${cursoId}"`,
      sort: JSON.stringify([{ field: 'orden', direction: 'asc' }]),
    });
    const d = await at(`/${encodeURIComponent('Lecciones')}?${params}`);
    const lecciones = (d.records || []).map((r: { id: string; fields: Record<string, unknown> }) => ({
      id: r.id,
      titulo: r.fields.titulo || '',
      video_url: r.fields.video_url || '',
      descripcion: r.fields.descripcion || '',
      orden: r.fields.orden || 0,
    }));
    return NextResponse.json({ lecciones });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
