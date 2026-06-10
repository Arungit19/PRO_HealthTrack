import { NextRequest, NextResponse } from 'next/server';

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  Vary: 'Origin',
});

export function proxy(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && configuredOrigins.includes(origin);

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: isAllowedOrigin ? corsHeaders(origin) : undefined,
    });
  }

  const response = NextResponse.next();

  if (isAllowedOrigin) {
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
