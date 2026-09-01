import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

async function forward(req: Request) {
  try {
    const url = new URL(req.url);

    // remove the prefix /api/proxy/admin/messages
    const prefix = '/api/proxy/admin/messages';
    let forwardPath = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : '';
    if (forwardPath.startsWith('/')) forwardPath = forwardPath.slice(1);

    const targetBase = `${BACKEND_URL}/api/admin/messages`;
    const targetUrl = forwardPath ? `${targetBase}/${forwardPath}${url.search}` : `${targetBase}${url.search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((v, k) => {
      if (k.toLowerCase() === 'host') return;
      headers[k] = v as string;
    });

    if (!headers.authorization && !headers.Authorization) {
      const authHeader = req.headers.get('authorization');
      if (authHeader) headers.authorization = authHeader;
    }

    const init: RequestInit = {
      method: req.method,
      headers,
      cache: 'no-store',
      body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : await req.arrayBuffer(),
    };

    const res = await fetch(targetUrl, init);
    const resBuffer = await res.arrayBuffer();

    const resHeaders: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      const lower = k.toLowerCase();
      if (lower === 'content-encoding' || lower === 'content-length' || lower === 'transfer-encoding') return;
      resHeaders[k] = v ?? '';
    });

    const origin = req.headers.get('origin') ?? '*';
    resHeaders['Access-Control-Allow-Origin'] = origin;
    resHeaders['Access-Control-Allow-Credentials'] = 'true';
    resHeaders['Access-Control-Expose-Headers'] = res.headers.get('access-control-expose-headers') ?? 'Content-Length,Content-Type';

    return new NextResponse(resBuffer, { status: res.status, headers: resHeaders });
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

export async function OPTIONS(req: Request) {
  const headers = new Headers();
  const origin = req.headers.get('origin') ?? '*';
  const reqHeaders = req.headers.get('access-control-request-headers') ?? 'Content-Type, Authorization';

  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', reqHeaders);
  headers.set('Access-Control-Allow-Credentials', 'true');
  return new NextResponse(null, { status: 204, headers });
}
