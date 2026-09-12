import { NextResponse } from "next/server";

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFoundResponse(message = "Not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflictResponse(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function tooManyRequestsResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: `Too many requests. Try again in ${retryAfter} seconds.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

export function serverErrorResponse(message = "Internal server error"): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): NextResponse {
  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1,
    },
  });
}
