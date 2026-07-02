import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto');
  if (proto && proto !== 'https') {
    const url = req.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|api).*)',
};
