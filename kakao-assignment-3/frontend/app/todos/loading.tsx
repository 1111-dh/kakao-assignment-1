export default function TodosLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* 헤더 스켈레톤 */}
        <div className="mb-10 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-9 w-40 animate-pulse rounded-lg bg-white/10" />
            <div className="h-4 w-24 animate-pulse rounded-lg bg-white/10" />
          </div>
          <div className="h-10 w-24 animate-pulse rounded-xl bg-white/10" />
        </div>

        {/* 필터 탭 스켈레톤 */}
        <div className="mb-5 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-16 animate-pulse rounded-lg bg-white/10"
            />
          ))}
        </div>

        {/* Todo 아이템 스켈레톤 */}
        <ul className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <li
              key={i}
              className="flex items-center gap-4 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10"
            >
              <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div
                  className="h-4 animate-pulse rounded-lg bg-white/10"
                  style={{ width: `${60 + Math.random() * 30}%` }}
                />
                <div className="h-3 w-20 animate-pulse rounded-lg bg-white/10" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
