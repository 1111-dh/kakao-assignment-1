"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { updateTodo, type ActionState } from "../actions";
import type { Todo } from "@/app/types";

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

export default function EditTodoForm({ todo }: { todo: Todo }) {
  const [completed, setCompleted] = useState(todo.completed);

  // updateTodo(id, prevState, formData) 형태이므로 bind로 id를 고정
  const updateTodoWithId = updateTodo.bind(null, todo.id);
  const [state, formAction] = useActionState(updateTodoWithId, initialState);

  return (
    <div className="rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 backdrop-blur-sm">
      <form action={formAction} className="space-y-6">
        {/* 할 일 내용 */}
        <div>
          <label
            htmlFor="edit-text"
            className="mb-2 block text-sm font-medium text-purple-200"
          >
            할 일 내용 <span className="text-rose-400">*</span>
          </label>
          <input
            id="edit-text"
            type="text"
            name="text"
            required
            defaultValue={todo.text}
            className="w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-purple-400/60 ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* 날짜 */}
        <div>
          <label
            htmlFor="edit-date"
            className="mb-2 block text-sm font-medium text-purple-200"
          >
            날짜
          </label>
          <input
            id="edit-date"
            type="date"
            name="date"
            defaultValue={todo.date}
            className="w-full rounded-xl bg-white/10 px-4 py-3 text-white ring-1 ring-white/20 outline-none transition focus:ring-2 focus:ring-purple-500 [color-scheme:dark]"
          />
        </div>

        {/* 완료 여부 — hidden input으로 상태 전달 */}
        <input type="hidden" name="completed" value={String(completed)} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCompleted((prev) => !prev)}
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
              completed
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-purple-400 hover:border-purple-300"
            }`}
          >
            {completed && (
              <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7l4 4 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <span className="text-sm text-purple-200">
            {completed ? "완료됨" : "진행 중"}
          </span>
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
