import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

async function forward(req: Request) {
  try {
    const url = new URL(req.url);
    const prefix = '/api/proxy/admin/tickets';
    const forwardPath = url.pathname.startsWith(prefix)
      ? url.pathname.slice(prefix.length).replace(/^\//, '')
      : '';
    const targetBase = `${BACKEND_URL}/api/admin/tickets`;
    const targetUrl = forwardPath
      ? `${targetBase}/${forwardPath}${url.search}`
      : `${targetBase}${url.search}`;

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') headers[key] = value;
    });

    const init: RequestInit = {
      method: req.method,
      headers,
      cache: 'no-store',
      body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : await req.arrayBuffer(),
    };

    const response = await fetch(targetUrl, init);
    const responseBody = await response.arrayBuffer();
    const responseHeaders: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lower)) {
        responseHeaders[key] = value;
      }
    });

    return new NextResponse(responseBody, { status: response.status, headers: responseHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Proxy error';
    return new NextResponse(message, { status: 500 });
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
  headers.set('Access-Control-Allow-Origin', req.headers.get('origin') ?? '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', req.headers.get('access-control-request-headers') ?? 'Content-Type, Authorization');
  headers.set('Access-Control-Allow-Credentials', 'true');
  return new NextResponse(null, { status: 204, headers });
}
