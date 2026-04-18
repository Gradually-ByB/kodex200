import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getKstDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getLatestMarketDateString(date: Date = new Date()): string {
  const kstDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const day = kstDate.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  
  const targetDate = new Date(kstDate);
  
  if (day === 0) { // Sunday -> Last Friday
    targetDate.setDate(kstDate.getDate() - 2);
  } else if (day === 6) { // Saturday -> Last Friday
    targetDate.setDate(kstDate.getDate() - 1);
  }
  
  return getKstDateString(targetDate);
}
