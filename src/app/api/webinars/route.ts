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

// GET /api/webinars — list upcoming webinars
export async function GET() {
  try {
    const params = new URLSearchParams({ filterByFormula: `{activo}=1` });
    params.set('sort[0][field]', 'fecha');
    params.set('sort[0][direction]', 'asc');
    const d = await at(`/${encodeURIComponent('Webinars')}?${params}`);
    const webinars = (d.records || []).map((r: { id: string; fields: Record<string, unknown> }) => ({
      id: r.id,
      titulo: r.fields.titulo || '',
      descripcion: r.fields.descripcion || '',
      fecha: r.fields.fecha || '',
      hora: r.fields.hora || '',
      speaker: r.fields.speaker || '',
      speaker_bio: r.fields.speaker_bio || '',
      link_zoom: r.fields.link_zoom || '',
      grabacion_url: r.fields.grabacion_url || '',
      tags: r.fields.tags || '',
    }));
    return NextResponse.json({ webinars });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST /api/webinars — register for a webinar
export async function POST(req: NextRequest) {
  try {
    const { nombre, email, webinar_id, webinar_titulo } = await req.json();
    if (!nombre || !email || !webinar_id) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    // Check if already registered
    const checkParams = new URLSearchParams({
      filterByFormula: `AND({email}="${email}", {webinar_id}="${webinar_id}")`,
      maxRecords: '1',
    });
    const existing = await at(`/${encodeURIComponent('WebinarRegistrations')}?${checkParams}`);
    if (existing.records?.length > 0) {
      return NextResponse.json({ ok: true, already: true });
    }

    await at(`/${encodeURIComponent('WebinarRegistrations')}`, {
      method: 'POST',
      body: JSON.stringify({
        fields: {
          nombre,
          email,
          webinar_id,
          webinar_titulo,
          fecha_registro: new Date().toISOString(),
        },
      }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
