import { NextResponse } from 'next/server';

const KEY = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || '';
const BASE = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '';

export async function GET() {
  const info = {
    hasKey: !!KEY,
    keyPrefix: KEY ? KEY.slice(0, 6) : 'MISSING',
    hasBase: !!BASE,
    basePrefix: BASE ? BASE.slice(0, 6) : 'MISSING',
  };

  try {
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/Users?maxRecords=1`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    const text = await res.text();
    return NextResponse.json({ ...info, airtableStatus: res.status, airtableResponse: text.slice(0, 300) });
  } catch (err) {
    return NextResponse.json({ ...info, error: String(err) });
  }
}
