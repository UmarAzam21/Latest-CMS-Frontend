import { NextResponse } from 'next/server';

async function forward(req: Request) {
  try {
    const url = new URL(req.url);

    const backendBase = process.env.BACKEND_URL;
    if (!backendBase) {
      throw new Error('BACKEND_URL is not configured');
    }
    const targetBase = `${backendBase}/api/notifications`;
    const targetUrl = `${targetBase}${url.search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((v, k) => {
      if (k.toLowerCase() === 'host') return;
      headers[k] = v as string;
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

    // add CORS headers for browser requests
    const origin = req.headers.get('origin') ?? '*';
    resHeaders['Access-Control-Allow-Origin'] = origin;
    resHeaders['Access-Control-Allow-Credentials'] = 'true';
    resHeaders['Access-Control-Expose-Headers'] = res.headers.get('access-control-expose-headers') ?? 'Content-Length,Content-Type';

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
