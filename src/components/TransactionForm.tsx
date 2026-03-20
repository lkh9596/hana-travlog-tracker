"use client";

import { useState } from "react";
import {
  Currency,
  Category,
  Transaction,
  TransactionType,
  CURRENCIES,
  EXPENSE_CATEGORIES,
  DEPOSIT_CATEGORIES,
  ExchangeRates,
} from "@/types";
import { convertToKRW } from "@/utils/currency";
import { formatKRW, toInputDateValue } from "@/utils/format";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: Transaction) => void;
  exchangeRates: ExchangeRates | null;
}

export default function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  exchangeRates,
}: TransactionFormProps) {
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("JPY");
  const [category, setCategory] = useState<Category>("식비");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toInputDateValue(new Date().toISOString()));

  if (!isOpen) return null;

  const categories = txType === "expense" ? EXPENSE_CATEGORIES : DEPOSIT_CATEGORIES;
  const numericAmount = parseFloat(amount) || 0;
  const estimatedKRW =
    exchangeRates && numericAmount > 0
      ? convertToKRW(numericAmount, currency, exchangeRates)
      : 0;

  function handleTypeChange(type: TransactionType) {
    setTxType(type);
    if (type === "deposit") {
      setCategory("입금");
      setCurrency("KRW");
    } else {
      setCategory("식비");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (numericAmount <= 0) return;

    const amountKRW =
      currency === "KRW"
        ? numericAmount
        : exchangeRates
          ? convertToKRW(numericAmount, currency, exchangeRates)
          : numericAmount;

    const tx: Transaction = {
      id: crypto.randomUUID(),
      type: txType,
      amount: numericAmount,
      currency,
      amountKRW: Math.round(amountKRW),
      category,
      description: description || category,
      date: new Date(date + "T12:00:00").toISOString(),
      createdAt: new Date().toISOString(),
    };

    onSubmit(tx);
    setAmount("");
    setDescription("");
    setTxType("expense");
    setCurrency("JPY");
    setCategory("식비");
    setDate(toInputDateValue(new Date().toISOString()));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

        {/* Type toggle */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${
              txType === "expense"
                ? "bg-[#009B8D] text-white shadow-md"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            지출
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("deposit")}
            className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all ${
              txType === "deposit"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            입금
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount + Currency */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              금액
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 h-12 px-4 rounded-xl bg-gray-100 text-gray-900 text-lg font-semibold outline-none focus:ring-2 focus:ring-[#009B8D] transition"
                autoFocus
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="h-12 px-3 rounded-xl bg-gray-100 text-gray-900 font-semibold outline-none focus:ring-2 focus:ring-[#009B8D] transition"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
            {estimatedKRW > 0 && currency !== "KRW" && (
              <p className="text-xs text-[#009B8D] mt-1.5 font-medium">
                ≈ {formatKRW(estimatedKRW)}
              </p>
            )}
          </div>

          {/* Category (only for expenses) */}
          {txType === "expense" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                카테고리
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={`h-11 rounded-xl text-sm font-semibold transition-all ${
                      category === cat.name
                        ? "bg-[#009B8D] text-white shadow-md"
                        : "bg-gray-100 text-gray-700 active:bg-gray-200"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              설명 (선택)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={txType === "expense" ? "예: 라멘, 택시, 호텔..." : "예: 엄마 입금, 환불..."}
              className="w-full h-12 px-4 rounded-xl bg-gray-100 text-gray-900 outline-none focus:ring-2 focus:ring-[#009B8D] transition"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-gray-100 text-gray-900 outline-none focus:ring-2 focus:ring-[#009B8D] transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={numericAmount <= 0}
            className={`w-full h-13 rounded-xl text-white font-bold text-base shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100 mt-2 ${
              txType === "expense" ? "bg-[#009B8D]" : "bg-blue-500"
            }`}
          >
            {txType === "expense" ? "지출 추가" : "입금 추가"}
          </button>
        </form>
      </div>
    </div>
  );
}
