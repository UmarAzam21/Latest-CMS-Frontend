import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

/**
 * POST /api/admin/login
 * Admin login endpoint
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendBody = {
      email: body.email,
      password: body.password,
    };

    const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
      signal: AbortSignal.timeout(10000),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || 'Invalid JSON response from backend' };
    }

    if (!response.ok) {
      console.error(`Backend login error (${response.status}):`, data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error('Login fetch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to login';
    return NextResponse.json(
      { error: message, details: message },
      { status: 500 }
    );
  }
}
