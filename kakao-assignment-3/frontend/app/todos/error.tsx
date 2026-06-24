"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function TodosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TodosError]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        {/* 아이콘 */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-900/40 ring-1 ring-rose-500/30">
          <span className="text-4xl">⚠️</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          오류가 발생했습니다
        </h2>
        <p className="text-purple-300 mb-1 text-sm max-w-sm mx-auto">
          {error.message || "예상치 못한 오류가 발생했습니다."}
        </p>
        {error.digest && (
          <p className="text-purple-500 text-xs mb-8 font-mono">
            오류 코드: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-purple-500 active:scale-95"
          >
            다시 시도
          </button>
          <Link
            href="/todos"
            className="rounded-xl bg-white/10 px-6 py-2.5 text-sm font-semibold text-purple-200 ring-1 ring-white/20 transition hover:bg-white/20"
          >
            목록으로
          </Link>
        </div>
      </div>
    </main>
  );
}
