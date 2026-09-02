import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * GET /api/admin/dashboard
 * Admin dashboard stats endpoint - fetches dashboard data from backend
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');

    const response = await fetch(`${BACKEND_URL}/api/admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: 'no-store',
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || 'Invalid JSON response from backend' };
    }

    if (!response.ok) {
      console.error(`Backend dashboard error (${response.status}):`, data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Dashboard fetch error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch dashboard stats', details: err.toString() },
      { status: 500 }
    );
  }
}
