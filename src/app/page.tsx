"use client";

import { useState, useEffect, useCallback } from "react";
import { Transaction, ExchangeRates } from "@/types";
import { fetchExchangeRates } from "@/utils/currency";
import {
  loadData,
  saveBalance,
  addTransaction as storageAddTx,
  deleteTransaction as storageDeleteTx,
  saveExchangeRates,
  clearAllData,
} from "@/utils/storage";
import Header from "@/components/Header";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import Settings from "@/components/Settings";

export default function Home() {
  const [startingBalance, setStartingBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const data = loadData();
    setStartingBalance(data.startingBalance);
    setTransactions(data.transactions);
    if (data.exchangeRates) {
      setExchangeRates(data.exchangeRates);
    }
    setMounted(true);
  }, []);

  // Fetch exchange rates on mount
  const refreshRates = useCallback(async () => {
    try {
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
      saveExchangeRates(rates);
    } catch (err) {
      console.error("Failed to fetch exchange rates:", err);
    }
  }, []);

  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  // Computed
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amountKRW, 0);
  const currentBalance = startingBalance - totalSpent;

  // Handlers
  function handleSetBalance(balance: number) {
    setStartingBalance(balance);
    saveBalance(balance);
  }

  function handleAddTransaction(tx: Transaction) {
    const updated = [...transactions, tx];
    setTransactions(updated);
    storageAddTx(tx);
  }

  function handleDeleteTransaction(id: string) {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    storageDeleteTx(id);
  }

  function handleAdjustBalance(actualBalance: number) {
    const diff = actualBalance - currentBalance;
    if (diff === 0) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      amount: Math.abs(diff),
      currency: "KRW",
      amountKRW: diff < 0 ? Math.abs(diff) : -diff,
      category: "기타",
      description: diff > 0 ? "잔액 조정 (증가)" : "잔액 조정 (감소)",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };
    const updated = [...transactions, tx];
    setTransactions(updated);
    storageAddTx(tx);
  }

  function handleClearAll() {
    clearAllData();
    setStartingBalance(0);
    setTransactions([]);
    setExchangeRates(null);
  }

  // Show initial balance setup if no balance is set
  const needsSetup =
    mounted && startingBalance === 0 && transactions.length === 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#009B8D] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl font-bold">하나 트래블로그 카드 기록</p>
          <p className="text-white/60 text-sm mt-2">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      <Header
        currentBalance={currentBalance}
        startingBalance={startingBalance}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Initial setup prompt */}
      {needsSetup && (
        <div className="px-5 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-[#009B8D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#009B8D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              시작 잔액을 설정하세요
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              하나은행 계좌의 현재 잔액을 입력해주세요
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="w-full h-12 rounded-xl bg-[#009B8D] text-white font-bold active:scale-[0.98] transition-transform"
            >
              잔액 설정하기
            </button>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {!needsSetup && (
        <div className="mt-5">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="text-sm font-bold text-gray-900">거래 내역</h2>
            <p className="text-xs text-gray-400">{transactions.length}건</p>
          </div>
          <TransactionList
            transactions={transactions}
            startingBalance={startingBalance}
            onDelete={handleDeleteTransaction}
          />
        </div>
      )}

      {/* FAB - Floating Action Button */}
      {!needsSetup && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#009B8D] text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform z-40"
          aria-label="지출 추가"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}

      {/* Modals */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddTransaction}
        exchangeRates={exchangeRates}
      />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentBalance={currentBalance}
        startingBalance={startingBalance}
        transactionCount={transactions.length}
        onSetBalance={handleSetBalance}
        onAdjustBalance={handleAdjustBalance}
        onClearAll={handleClearAll}
        ratesLastUpdated={exchangeRates?.fetchedAt ?? null}
        onRefreshRates={refreshRates}
      />
    </main>
  );
}
