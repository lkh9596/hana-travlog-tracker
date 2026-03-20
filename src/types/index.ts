export type Currency = "KRW" | "JPY" | "USD" | "HKD" | "EUR";

export type Category =
  | "식비"
  | "교통"
  | "숙박"
  | "쇼핑"
  | "관광"
  | "기타";

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  amountKRW: number;
  category: Category;
  description: string;
  date: string; // ISO string
  createdAt: string;
}

export interface ExchangeRates {
  rates: Record<string, number>;
  fetchedAt: string;
}

export interface AppData {
  startingBalance: number;
  transactions: Transaction[];
  exchangeRates: ExchangeRates | null;
}

export const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: "KRW", symbol: "₩", name: "원 (KRW)" },
  { code: "JPY", symbol: "¥", name: "엔 (JPY)" },
  { code: "USD", symbol: "$", name: "달러 (USD)" },
  { code: "HKD", symbol: "HK$", name: "홍콩달러 (HKD)" },
  { code: "EUR", symbol: "€", name: "유로 (EUR)" },
];

export const CATEGORIES: { name: Category; icon: string }[] = [
  { name: "식비", icon: "🍽" },
  { name: "교통", icon: "🚇" },
  { name: "숙박", icon: "🏨" },
  { name: "쇼핑", icon: "🛍" },
  { name: "관광", icon: "🎫" },
  { name: "기타", icon: "📌" },
];
