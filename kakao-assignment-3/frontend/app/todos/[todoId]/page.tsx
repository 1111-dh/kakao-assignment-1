import EditTodoForm from "./EditTodoForm";
import { notFound } from "next/navigation";
import type { Todo } from "@/app/types";

const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) throw new Error("BACKEND_URL is not defined");

async function getTodo(id: string): Promise<Todo> {
  const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("할 일을 불러오지 못했습니다.");
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ todoId: string }>;
}) {
  const { todoId } = await params;
  const todo = await getTodo(todoId);
  return {
    title: `수정: ${todo.text} | Todo App`,
  };
}

export default async function EditTodoPage({
  params,
}: {
  params: Promise<{ todoId: string }>;
}) {
  const { todoId } = await params;
  const todo = await getTodo(todoId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">✏️ 할 일 수정</h1>
          <p className="mt-1 text-sm text-purple-300">내용을 수정하세요.</p>
        </div>

        {/* 수정 폼 (Client Component) */}
        <EditTodoForm todo={todo} />
      </div>
    </main>
  );
}
