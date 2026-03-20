"use client";

import { formatKRW } from "@/utils/format";

interface HeaderProps {
  currentBalance: number;
  startingBalance: number;
  onOpenSettings: () => void;
}

export default function Header({
  currentBalance,
  startingBalance,
  onOpenSettings,
}: HeaderProps) {
  const spent = startingBalance - currentBalance;
  const spentPercent =
    startingBalance > 0 ? Math.min((spent / startingBalance) * 100, 100) : 0;

  return (
    <header className="bg-[#009B8D] text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold tracking-tight">하나 트래블로그 카드 기록</h1>
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors"
          aria-label="설정"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>

      <p className="text-white/70 text-xs mb-1">잔액</p>
      <p className="text-3xl font-extrabold tracking-tight mb-1">
        {formatKRW(currentBalance)}
      </p>

      {startingBalance > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-white/70 mt-4 mb-2">
            <span>사용 {formatKRW(spent)}</span>
            <span>{spentPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(spentPercent, 100)}%` }}
            />
          </div>
        </>
      )}
    </header>
  );
}
