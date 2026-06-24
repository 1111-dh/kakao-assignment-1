"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import type { Todo } from "@/app/types";

type Filter = "all" | "active" | "completed";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

// --- [Helper Functions] ---
function getStorageDateString(dateObj: Date) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export default function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filter, setFilter] = useState<Filter>("all");
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // 달력 기준 날짜 및 선택된 날짜 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  // 현재 달력에 표시할 7일 생성
  const calendarDays: Date[] = [];
  const start = getStartOfWeek(viewDate);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    calendarDays.push(d);
  }

  // 달력 내비게이션 (1주 단위 이동)
  const navigateCalendar = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setViewDate(newDate);
  };

  // 날짜 클릭
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setViewDate(day); // 선택된 날짜 기준으로 달력 포커스 유지
  };

  // 날짜별 할 일 통계 계산
  const getTodoStats = (dateStr: string) => {
    const dayTodos = todos.filter((t) => t.date === dateStr);
    const activeCount = dayTodos.filter((t) => !t.completed).length;
    const completedCount = dayTodos.filter((t) => t.completed).length;
    return { activeCount, completedCount };
  };

  // 목록 필터링 (선택된 날짜 기준 + 상태 필터)
  const filteredTodos = todos.filter((todo) => {
    if (todo.date !== getStorageDateString(selectedDate)) return false;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // 완료 토글 — API Route 경유
  async function handleToggle(todo: Todo) {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: !t.completed } : t
        )
      );
    }
  }

  // 삭제 — API Route 경유
  async function handleDelete(id: number) {
    const res = await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      startTransition(() => router.refresh());
    }
  }

  const FILTERS: { label: string; value: Filter }[] = [
    { label: "전체", value: "all" },
    { label: "진행 중", value: "active" },
    { label: "완료", value: "completed" },
  ];

  const today = new Date();

  return (
    <>
      {/* 캘린더 위젯 (주간 뷰) */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-white/5 shadow-xl ring-1 ring-white/10 backdrop-blur-md">
        <div className="flex flex-col p-5">
          {/* 달력 헤더 */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigateCalendar(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => navigateCalendar(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* 달력 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dateStr = getStorageDateString(day);
              const stats = getTodoStats(dateStr);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(day)}
                  className={`group flex flex-col items-center justify-center rounded-2xl py-3 transition-all ${
                    isSelected
                      ? "bg-purple-600 shadow-lg shadow-purple-900/50"
                      : "bg-white/5 hover:bg-white/15"
                  }`}
                >
                  <span
                    className={`mb-1 text-xs font-medium transition-colors ${
                      isSelected ? "text-purple-100" : "text-purple-300 group-hover:text-purple-200"
                    }`}
                  >
                    {DAY_NAMES[day.getDay()]}
                  </span>
                  <span
                    className={`text-lg font-bold transition-colors ${
                      isSelected
                        ? "text-white"
                        : isToday
                        ? "text-purple-400"
                        : "text-white/80 group-hover:text-white"
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  {/* 달력 인디케이터 (통계) */}
                  <div className="mt-1.5 flex h-1.5 gap-1">
                    {stats.activeCount > 0 && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          isSelected ? "bg-white" : "bg-purple-400"
                        }`}
                      />
                    )}
                    {stats.completedCount > 0 && (
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-colors ${
                          isSelected ? "bg-purple-300" : "bg-emerald-500"
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 상태별 필터 탭 */}
      <div className="mb-5 flex gap-2">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              filter === value
                ? "bg-purple-600 text-white shadow shadow-purple-900/50"
                : "bg-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <ul className="space-y-3">
        {filteredTodos.length === 0 ? (
          <li className="rounded-2xl bg-white/5 py-12 text-center text-purple-300">
            해당 날짜에는 할 일이 없습니다 🎉
          </li>
        ) : (
          filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className="group flex items-center gap-4 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/10"
            >
              {/* 완료 체크박스 */}
              <button
                onClick={() => handleToggle(todo)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  todo.completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-purple-400 hover:border-purple-300"
                }`}
              >
                {todo.completed && (
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

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <p
                  className={`truncate text-base font-medium ${
                    todo.completed
                      ? "text-purple-400/60 line-through"
                      : "text-white"
                  }`}
                >
                  {todo.text}
                </p>
                <p className="mt-0.5 text-xs text-purple-400">{todo.date}</p>
              </div>

              {/* 수정/삭제 버튼 */}
              <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                <Link
                  href={`/todos/${todo.id}`}
                  className="rounded-lg bg-purple-700/60 px-3 py-1 text-xs font-medium text-purple-100 transition hover:bg-purple-600"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setTodoToDelete(todo.id);
                  }}
                  className="rounded-lg bg-rose-700/60 px-3 py-1 text-xs font-medium text-rose-100 transition hover:bg-rose-600"
                >
                  삭제
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {isPending && (
        <p className="mt-4 text-center text-sm text-purple-400">처리 중...</p>
      )}

      {/* 커스텀 삭제 확인 모달 */}
      {todoToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm scale-100 rounded-2xl bg-slate-900 p-6 shadow-2xl ring-1 ring-white/10 transition-transform">
            <h3 className="text-xl font-bold text-white">⚠️ 삭제 확인</h3>
            <p className="mt-2 text-sm text-purple-200">
              정말 이 할 일을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setTodoToDelete(null)}
                className="flex-1 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
              >
                취소
              </button>
              <button
                onClick={() => {
                  handleDelete(todoToDelete);
                  setTodoToDelete(null);
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-900/40 transition hover:bg-rose-500 active:scale-95"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
