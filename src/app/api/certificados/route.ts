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

// POST /api/certificados — log a certificate issuance (best-effort; does not block the PDF download)
export async function POST(req: NextRequest) {
  try {
    const { nombre, email, curso_id, codigo } = await req.json();
    if (!nombre || !email || !curso_id || !codigo) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    try {
      const checkParams = new URLSearchParams({
        filterByFormula: `AND({email}="${email}", {curso_id}="${curso_id}")`,
        maxRecords: '1',
      });
      const existing = await at(`/${encodeURIComponent('Certificados')}?${checkParams}`);
      if (existing.records?.length > 0) {
        return NextResponse.json({ ok: true, already: true });
      }
    } catch {
      // duplicate check failed — proceed to create rather than silently drop the record
    }

    await at(`/${encodeURIComponent('Certificados')}`, {
      method: 'POST',
      body: JSON.stringify({
        fields: { nombre, email, curso_id, codigo, fecha_emision: new Date().toISOString() },
        typecast: true,
      }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
