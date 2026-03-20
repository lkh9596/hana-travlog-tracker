import { Currency, ExchangeRates } from "@/types";

const API_URL = "https://api.exchangerate-api.com/v4/latest/KRW";

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("환율 정보를 가져올 수 없습니다");
  const data = await res.json();
  return {
    rates: data.rates as Record<string, number>,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Convert a foreign currency amount to KRW.
 * The API returns rates relative to KRW (e.g., 1 KRW = 0.00074 USD).
 * So to convert X USD to KRW: X / rate(USD)
 */
export function convertToKRW(
  amount: number,
  currency: Currency,
  rates: ExchangeRates
): number {
  if (currency === "KRW") return amount;
  const rate = rates.rates[currency];
  if (!rate || rate === 0) return amount;
  return amount / rate;
}
