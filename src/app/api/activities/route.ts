import { NextRequest, NextResponse } from 'next/server';

const KEY = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || '';
const BASE = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '';

function atHeaders() {
  return { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
}

async function getRecord(table: string, id: string) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${table}/${id}`, { headers: atHeaders() });
  if (!r.ok) return null;
  return r.json();
}

async function patchRecord(table: string, id: string, fields: Record<string, unknown>) {
  const r = await fetch(`https://api.airtable.com/v0/${BASE}/${table}/${id}`, {
    method: 'PATCH',
    headers: atHeaders(),
    body: JSON.stringify({ fields }),
  });
  if (!r.ok) throw new Error(`Airtable patch error: ${r.status}`);
  return r.json();
}

export async function POST(req: NextRequest) {
  try {
    const { userId, tipo, contactoId, empresaId, fecha, notas, respuesta, interview_date, interview_time, proposal_amount, proposal_service } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Falta userId' }, { status: 400 });

    const fields: Record<string, unknown> = {
      type: tipo || 'linkedin',
      date: fecha || new Date().toISOString().split('T')[0],
      notes: notas || '',
      got_response: !!respuesta,
      user_id: userId,
    };
    if (empresaId) fields.company = [empresaId];
    if (contactoId) fields.contact = [contactoId];
    if (interview_date) fields.interview_date = interview_date;
    if (interview_time) fields.interview_time = interview_time;
    if (proposal_amount) fields.proposal_amount = Number(proposal_amount);
    if (proposal_service) fields.proposal_service = proposal_service;

    const r = await fetch(`https://api.airtable.com/v0/${BASE}/Activities`, {
      method: 'POST',
      headers: atHeaders(),
      body: JSON.stringify({ fields }),
    });
    if (!r.ok) throw new Error(`Airtable error: ${r.status}`);

    // Auto-advance stage sin_contactar → primer_contacto
    if (contactoId) {
      const contact = await getRecord('Contacts', contactoId);
      if (contact?.fields?.stage === 'sin_contactar') {
        await patchRecord('Contacts', contactoId, { stage: 'primer_contacto' });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('activities POST error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { activityId, ...fields } = await req.json();
    if (!activityId) return NextResponse.json({ error: 'Falta activityId' }, { status: 400 });
    await patchRecord('Activities', activityId, fields);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { activityId } = await req.json();
    if (!activityId) return NextResponse.json({ error: 'Falta activityId' }, { status: 400 });
    const r = await fetch(`https://api.airtable.com/v0/${BASE}/Activities/${activityId}`, {
      method: 'DELETE',
      headers: atHeaders(),
    });
    if (!r.ok) throw new Error(`Airtable delete error: ${r.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
