const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) throw new Error("BACKEND_URL is not defined");

// GET /api/todos — 전체 Todo 목록 조회
export async function GET() {
  const res = await fetch(`${BACKEND_URL}/todos`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "백엔드 오류" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return Response.json(data);
}

// POST /api/todos — 새 Todo 생성
export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "생성 실패" }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return Response.json(data, { status: 201 });
}
