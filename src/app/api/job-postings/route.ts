import { NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

export async function GET() {
  const res = await fetch(`${BACKEND}/api/job-postings`, { next: { revalidate: 60 } });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
