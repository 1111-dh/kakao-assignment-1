import Link from "next/link";
import TodoList from "./TodoList";
import type { Todo } from "@/app/types";

export const metadata = {
  title: "Todo 목록 | Todo App",
  description: "전체 할 일 목록을 확인하고 관리하세요.",
};

const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) throw new Error("BACKEND_URL is not defined");

async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${BACKEND_URL}/todos`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("할 일 목록을 불러오는 데 실패했습니다.");
  }
  return res.json();
}

export default async function TodosPage() {
  const todos = await getTodos();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* 헤더 */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              📝 Todo List
            </h1>
            <p className="mt-1 text-sm text-purple-300">
              총 {todos.length}개의 할 일
            </p>
          </div>
          <Link
            href="/todos/new"
            className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-purple-500 hover:shadow-purple-700/50 active:scale-95"
          >
            + 새 할 일
          </Link>
        </div>

        {/* Todo 목록 (Client Component) */}
        <TodoList initialTodos={todos} />
      </div>
    </main>
  );
}
