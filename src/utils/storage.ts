import { AppData, Transaction, ExchangeRates } from "@/types";

const STORAGE_KEY = "hana-travlog-data";
const SHEETS_API = "https://script.google.com/macros/s/AKfycby3UnBXZRwRHl9E90wITNOVsEVzI7ueSsJ2v6chy-2Q38LuFzfYNZIlqfxiXFTRsE6q2g/exec";

function getDefaultData(): AppData {
  return {
    startingBalance: 0,
    transactions: [],
    exchangeRates: null,
  };
}

// ============ LOCAL STORAGE ============

export function loadData(): AppData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw) as AppData;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveBalance(balance: number): void {
  const data = loadData();
  data.startingBalance = balance;
  saveData(data);
  syncBalanceToSheets(balance);
}

export function addTransaction(tx: Transaction): void {
  const data = loadData();
  data.transactions.push(tx);
  saveData(data);
  // Sync to Google Sheets in background
  syncAddToSheets(tx);
}

export function deleteTransaction(id: string): void {
  const data = loadData();
  data.transactions = data.transactions.filter((t) => t.id !== id);
  saveData(data);
  // Sync deletion to Google Sheets in background
  syncDeleteFromSheets(id);
}

export function saveExchangeRates(rates: ExchangeRates): void {
  const data = loadData();
  data.exchangeRates = rates;
  saveData(data);
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ============ GOOGLE SHEETS SYNC ============

async function syncAddToSheets(tx: Transaction): Promise<void> {
  try {
    await fetch(SHEETS_API, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "add", transaction: tx }),
    });
  } catch {
    console.warn("Failed to sync transaction to Google Sheets");
  }
}

async function syncDeleteFromSheets(id: string): Promise<void> {
  try {
    await fetch(SHEETS_API, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "delete", id }),
    });
  } catch {
    console.warn("Failed to sync deletion to Google Sheets");
  }
}

async function syncBalanceToSheets(balance: number): Promise<void> {
  try {
    await fetch(SHEETS_API, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "setBalance", balance }),
    });
  } catch {
    console.warn("Failed to sync balance to Google Sheets");
  }
}

export async function loadFromSheets(): Promise<Transaction[]> {
  try {
    const res = await fetch(SHEETS_API);
    const data = await res.json();
    return data.transactions || [];
  } catch {
    console.warn("Failed to load from Google Sheets");
    return [];
  }
}
