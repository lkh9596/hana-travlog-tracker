"use client";

import { Transaction, CATEGORIES } from "@/types";
import { formatKRW, formatCurrency, formatDate } from "@/utils/format";

interface TransactionListProps {
  transactions: Transaction[];
  startingBalance: number;
  onDelete: (id: string) => void;
}

export default function TransactionList({
  transactions,
  startingBalance,
  onDelete,
}: TransactionListProps) {
  // Sort by date descending (newest first)
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Compute running balance for each transaction.
  // We need chronological order for running balance calculation, then display in reverse.
  const chronological = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const balanceMap = new Map<string, number>();
  let running = startingBalance;
  for (const tx of chronological) {
    running -= tx.amountKRW;
    balanceMap.set(tx.id, running);
  }

  // Group sorted transactions by date
  const groups: { dateLabel: string; items: Transaction[] }[] = [];
  for (const tx of sorted) {
    const label = formatDate(tx.date);
    const last = groups[groups.length - 1];
    if (last && last.dateLabel === label) {
      last.items.push(tx);
    } else {
      groups.push({ dateLabel: label, items: [tx] });
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-3 opacity-40"
        >
          <rect x="2" y="3" width="20" height="18" rx="3" />
          <path d="M2 9h20" />
          <path d="M9 14h6" />
        </svg>
        <p className="text-sm">아직 거래 내역이 없습니다</p>
        <p className="text-xs mt-1">아래 버튼을 눌러 지출을 추가하세요</p>
      </div>
    );
  }

  function getCategoryIcon(categoryName: string) {
    const cat = CATEGORIES.find((c) => c.name === categoryName);
    return cat?.icon ?? "📌";
  }

  function handleDelete(id: string) {
    if (confirm("이 거래를 삭제할까요?")) {
      onDelete(id);
    }
  }

  return (
    <div className="px-4 pb-28">
      {groups.map((group) => (
        <div key={group.dateLabel} className="mb-4">
          <p className="text-xs font-semibold text-gray-400 mb-2 px-1">
            {group.dateLabel}
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {group.items.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center px-4 py-3.5 active:bg-gray-50 transition-colors"
                onClick={() => handleDelete(tx.id)}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0">
                  {getCategoryIcon(tx.category)}
                </div>

                {/* Info */}
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tx.category}
                    {tx.currency !== "KRW" && (
                      <span className="ml-1.5">
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    )}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0 ml-2">
                  <p className="text-sm font-bold text-gray-900">
                    -{formatKRW(tx.amountKRW)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    잔액 {formatKRW(balanceMap.get(tx.id) ?? 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
