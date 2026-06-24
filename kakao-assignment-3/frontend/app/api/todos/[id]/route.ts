import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) throw new Error("BACKEND_URL is not defined");

// GET /api/todos/[id] — 단건 Todo 조회
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return new Response(JSON.stringify({ error: "찾을 수 없습니다." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "서버 오류" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return Response.json(data);
}

// PUT /api/todos/[id] — Todo 수정 (완료 토글 포함)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "수정 실패" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return Response.json(data);
}

// DELETE /api/todos/[id] — Todo 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
    method: "DELETE",
  });

  if (res.status === 404) {
    return new Response(JSON.stringify({ error: "찾을 수 없습니다." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "삭제 실패" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 204 });
}
