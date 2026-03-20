import { Currency, CURRENCIES } from "@/types";

export function formatKRW(amount: number): string {
  const rounded = Math.round(amount);
  const prefix = rounded < 0 ? "-₩" : "₩";
  return prefix + Math.abs(rounded).toLocaleString("ko-KR");
}

export function formatCurrency(amount: number, currency: Currency): string {
  const info = CURRENCIES.find((c) => c.code === currency);
  const symbol = info?.symbol ?? "";
  if (currency === "KRW" || currency === "JPY") {
    return `${symbol}${Math.round(amount).toLocaleString("ko-KR")}`;
  }
  return `${symbol}${amount.toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[d.getDay()];
  return `${month}/${day} (${weekday})`;
}

export function formatDateFull(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일`;
}

export function toInputDateValue(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return new Date().toISOString();
}
