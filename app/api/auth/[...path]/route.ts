import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

if (!BACKEND_URL) {
	throw new Error("BACKEND_URL is not configured");
}

type RouteContext = {
	params: Promise<{ path: string[] }>;
};

async function forward(req: NextRequest, context: RouteContext) {
	try {
		const { path } = await context.params;
		const url = new URL(req.url);
		const headers = new Headers(req.headers);
		headers.delete("host");

		const response = await fetch(`${BACKEND_URL}/api/auth/${path.join("/")}${url.search}`, {
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
		return NextResponse.json(
			{ detail: error instanceof Error ? error.message : "Auth request failed" },
			{ status: 500 },
		);
	}
}

export async function GET(req: NextRequest, context: RouteContext) {
	return forward(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
	return forward(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
	return forward(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
	return forward(req, context);
}
