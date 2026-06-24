import NewTodoForm from "./NewTodoForm";

export const metadata = {
  title: "새 할 일 | Todo App",
  description: "새로운 할 일을 추가하세요.",
};

export default function NewTodoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">✨ 새 할 일 추가</h1>
          <p className="mt-1 text-sm text-purple-300">
            오늘 해야 할 일을 기록해보세요.
          </p>
        </div>

        {/* 폼 (Client Component) */}
        <NewTodoForm />
      </div>
    </main>
  );
}
