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
  if (!r.ok) throw new Error(`Airtable ${r.status}: ${await r.text()}`);
  return r.json();
}

// GET /api/cursos — list active courses, or a single course with ?id=recXXX
export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    if (id) {
      const r = await at(`/${encodeURIComponent('Cursos')}/${id}`);
      return NextResponse.json({
        curso: {
          id: r.id,
          titulo: r.fields.titulo || '',
          descripcion: r.fields.descripcion || '',
          portada_url: r.fields.portada_url || '',
        },
      });
    }

    const params = new URLSearchParams({ filterByFormula: `{activo}=1` });
    params.set('sort[0][field]', 'orden');
    params.set('sort[0][direction]', 'asc');
    const d = await at(`/${encodeURIComponent('Cursos')}?${params}`);
    const cursos = (d.records || []).map((r: { id: string; fields: Record<string, unknown> }) => ({
      id: r.id,
      titulo: r.fields.titulo || '',
      descripcion: r.fields.descripcion || '',
      portada_url: r.fields.portada_url || '',
      orden: r.fields.orden || 0,
    }));
    return NextResponse.json({ cursos });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
