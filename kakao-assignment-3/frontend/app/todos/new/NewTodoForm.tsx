"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { createTodo, type ActionState } from "../actions";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-purple-500 disabled:opacity-50"
    >
      {pending ? "저장 중..." : "저장"}
    </button>
  );
}

export default function NewTodoForm() {
  const today = new Date().toISOString().split("T")[0];
  const [state, formAction] = useActionState(createTodo, initialState);

  return (
    <div className="rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 backdrop-blur-sm">
      <form action={formAction} className="space-y-6">
        {/* 할 일 내용 */}
        <div>
          <label
            htmlFor="todo-text"
            className="mb-2 block text-sm font-medium text-purple-200"
          >
            할 일 내용 <span className="text-rose-400">*</span>
          </label>
          <input
            id="todo-text"
            type="text"
            name="text"
            required
            placeholder="예: 운동하기, 책 읽기..."
            className="w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-purple-400/60 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* 날짜 */}
        <div>
          <label
            htmlFor="todo-date"
            className="mb-2 block text-sm font-medium text-purple-200"
          >
            날짜
          </label>
          <input
            id="todo-date"
            type="date"
            name="date"
            defaultValue={today}
            className="w-full rounded-xl bg-white/10 px-4 py-3 text-white ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-purple-500 [color-scheme:dark]"
          />
        </div>

        {/* 에러 메시지 */}
        {state?.error && (
          <p className="rounded-lg bg-rose-900/40 px-4 py-2 text-sm text-rose-300">
            {state.error}
          </p>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <SubmitButton />
          <Link
            href="/todos"
            className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-purple-200 ring-1 ring-white/20 transition hover:bg-white/20"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
