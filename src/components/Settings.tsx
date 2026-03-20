"use client";

import { useState } from "react";
import { formatKRW } from "@/utils/format";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  startingBalance: number;
  transactionCount: number;
  onSetBalance: (balance: number) => void;
  onAdjustBalance: (actualBalance: number) => void;
  onClearAll: () => void;
  ratesLastUpdated: string | null;
  onRefreshRates: () => void;
}

export default function Settings({
  isOpen,
  onClose,
  currentBalance,
  startingBalance,
  transactionCount,
  onSetBalance,
  onAdjustBalance,
  onClearAll,
  ratesLastUpdated,
  onRefreshRates,
}: SettingsProps) {
  const [balanceInput, setBalanceInput] = useState(
    startingBalance > 0 ? String(startingBalance) : ""
  );
  const [adjustInput, setAdjustInput] = useState("");

  if (!isOpen) return null;

  function handleSaveBalance() {
    const val = parseInt(balanceInput, 10);
    if (!isNaN(val) && val >= 0) {
      if (confirm(`시작 잔액을 ₩${val.toLocaleString()}으로 설정할까요?`)) {
        onSetBalance(val);
        onClose();
      }
    }
  }

  function handleClear() {
    if (
      confirm("모든 데이터를 삭제합니다. 복구할 수 없습니다. 진행할까요?")
    ) {
      onClearAll();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-bold text-gray-900 mb-5">설정</h2>

        {/* Starting balance */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            시작 잔액 (KRW)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              placeholder="예: 1000000"
              className="flex-1 h-12 px-4 rounded-xl bg-gray-100 text-gray-900 text-lg font-semibold outline-none focus:ring-2 focus:ring-[#009B8D] transition"
            />
            <button
              onClick={handleSaveBalance}
              className="h-12 px-5 rounded-xl bg-[#009B8D] text-white font-bold active:scale-[0.97] transition-transform"
            >
              저장
            </button>
          </div>
          {startingBalance > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              현재 설정: {formatKRW(startingBalance)}
            </p>
          )}
        </div>

        {/* Adjust current balance */}
        {startingBalance > 0 && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              잔액 조정 — 실제 잔액 입력 (KRW)
            </label>
            <p className="text-xs text-gray-400 mb-2">
              현재 잔액: {formatKRW(currentBalance)}
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={adjustInput}
                onChange={(e) => setAdjustInput(e.target.value)}
                placeholder="실제 계좌 잔액"
                className="flex-1 h-12 px-4 rounded-xl bg-gray-100 text-gray-900 text-lg font-semibold outline-none focus:ring-2 focus:ring-[#009B8D] transition"
              />
              <button
                onClick={() => {
                  const val = parseInt(adjustInput, 10);
                  if (!isNaN(val) && val >= 0) {
                    onAdjustBalance(val);
                    setAdjustInput("");
                    onClose();
                  }
                }}
                className="h-12 px-5 rounded-xl bg-amber-500 text-white font-bold active:scale-[0.97] transition-transform"
              >
                조정
              </button>
            </div>
          </div>
        )}

        {/* Exchange rates */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">환율 정보</p>
              {ratesLastUpdated && (
                <p className="text-xs text-gray-400 mt-0.5">
                  마지막 업데이트:{" "}
                  {new Date(ratesLastUpdated).toLocaleString("ko-KR")}
                </p>
              )}
            </div>
            <button
              onClick={onRefreshRates}
              className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 active:bg-gray-100 transition"
            >
              새로고침
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-semibold text-gray-900">데이터</p>
          <p className="text-xs text-gray-400 mt-1">
            총 {transactionCount}건의 거래 기록
          </p>
        </div>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="w-full h-12 rounded-xl bg-red-50 text-red-600 font-bold text-sm active:bg-red-100 transition-colors"
        >
          모든 데이터 삭제
        </button>
      </div>
    </div>
  );
}
