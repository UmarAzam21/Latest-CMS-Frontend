import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("BACKEND_URL is not configured");
}

async function forward(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const query = new URL(req.url).search;
    const targetUrl = `${BACKEND_URL}/api/auth/${path.join("/")}${query}`;
    const headers = new Headers(req.headers);
    headers.delete("host");

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
      cache: "no-store",
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");

    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "User auth proxy error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(req, context);
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(req, context);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return forward(req, context);
}