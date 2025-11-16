import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const BACKEND_URL = 'http://localhost:3000/api/resume-score';

function buildProxyHeaders(req: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const cookie = req.headers.get('cookie');
  if (cookie) headers['cookie'] = cookie;
  return headers;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:9002',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: buildProxyHeaders(req),
      body: JSON.stringify(body),
      // Forward cookies to backend
      credentials: 'include' as RequestCredentials,
    } as RequestInit);

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to save score' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: buildProxyHeaders(req),
      credentials: 'include' as RequestCredentials,
    } as RequestInit);
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to fetch scores' }, { status: 500 });
  }
}
