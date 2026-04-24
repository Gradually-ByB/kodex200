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
  const hour = kstDate.getHours();
  const day = kstDate.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  
  const targetDate = new Date(kstDate);
  
  // If it's before market open (9:00 AM), we should look at the previous market day
  if (hour < 9) {
    targetDate.setDate(targetDate.getDate() - 1);
  }
  
  const finalDay = targetDate.getDay();
  if (finalDay === 0) { // Sunday -> Last Friday
    targetDate.setDate(targetDate.getDate() - 2);
  } else if (finalDay === 6) { // Saturday -> Last Friday
    targetDate.setDate(targetDate.getDate() - 1);
  }
  
  return getKstDateString(targetDate);
}
