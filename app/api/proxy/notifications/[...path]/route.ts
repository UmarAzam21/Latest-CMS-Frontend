import { NextResponse } from 'next/server';

async function forward(req: Request) {
  try {
    const url = new URL(req.url);

    const prefix = '/api/proxy/notifications/';
    let forwardPath = '';
    if (url.pathname.startsWith(prefix)) {
      forwardPath = url.pathname.slice(prefix.length);
    }

    const backendBase = process.env.BACKEND_URL;
    if (!backendBase) {
      throw new Error('BACKEND_URL is not configured');
    }
    const targetBase = `${backendBase}/api/notifications`;
    const targetUrl = forwardPath ? `${targetBase}/${forwardPath}${url.search}` : `${targetBase}${url.search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'host') return;
      headers[key] = value as string;
    });
    headers['ngrok-skip-browser-warning'] = 'true';

    if (!headers.authorization && !headers.Authorization) {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        headers.authorization = authHeader;
      }
    }

    const init: RequestInit = {
      method: req.method,
      headers,
      body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : await req.text(),
    };

    const res = await fetch(targetUrl, init);
    const resText = await res.text();

    const resHeaders: Record<string, string> = {};
    const ct = res.headers.get('content-type');
    if (ct) resHeaders['content-type'] = ct;

    return new NextResponse(resText, { status: res.status, headers: resHeaders });
  } catch (err: any) {
    return new NextResponse(err?.message || 'Proxy error', { status: 500 });
  }
}

export async function GET(req: Request) {
  return forward(req);
}

export async function POST(req: Request) {
  return forward(req);
}

export async function PUT(req: Request) {
  return forward(req);
}

export async function PATCH(req: Request) {
  return forward(req);
}

export async function DELETE(req: Request) {
  return forward(req);
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new NextResponse(null, { status: 204, headers });
}
