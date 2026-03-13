"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { ApiResponse } from "@/types/stock";
import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import MarketIndices from "@/components/MarketIndices";
import EtfSummaryCard from "@/components/EtfSummaryCard";
import TotalPortfolioCard from "@/components/TotalPortfolioCard";
import DailyProfitCard from "@/components/DailyProfitCard";
import PortfolioInput from "@/components/PortfolioInput";
import PortfolioHistoryTable from "@/components/PortfolioHistoryTable";

export default function Home() {
  const [quantity, setQuantity] = useState(27);
  const [avgPrice, setAvgPrice] = useState(76573);
  const [totalPrincipal, setTotalPrincipal] = useState(27 * 76573);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch initial data from DB
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await axios.get(
          `/api/portfolio?t=${new Date().getTime()}`,
        );
        if (response.data.portfolio) {
          const { quantity, avgPrice, totalPrincipal } =
            response.data.portfolio;
          setQuantity(quantity);
          setAvgPrice(avgPrice);
          setTotalPrincipal(totalPrincipal);
        }
        if (response.data.history) {
          setHistory(response.data.history);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to fetch from DB:", error);
        setIsLoaded(true); // Still set to true to allow editing if DB is empty or fails
      }
    };
    fetchPortfolio();
  }, []);

  const { data, isLoading, refetch, isFetching } = useQuery<
    ApiResponse & { marketStatus: string }
  >({
    queryKey: ["quotes"],
    queryFn: async () => {
      const response = await axios.get("/api/quotes");
      return response.data;
    },
    refetchInterval: 60000,
  });

  // Update current date display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      const dayOfWeek = dayNames[now.getDay()];
      setCurrentDate(`${year}-${month}-${day} (${dayOfWeek}요일)`);
    };
    updateTime();
  }, []);

  // Synchronize history with current inputs and market data
  useEffect(() => {
    if (!isLoaded || !data?.etf) return;

    const totalValuation = data.etf.price * quantity;
    const dailyProfit = data.etf.changeAmount * quantity;
    const profitLoss = totalValuation - totalPrincipal;
    const returnRate =
      totalPrincipal > 0 ? (profitLoss / totalPrincipal) * 100 : 0;

    // Use Korean local date string for consistent comparison
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Update local history state for immediate UI feedback
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory((prev) => {
      const newHistory = [...prev];
      const todayIndex = newHistory.findIndex((item) => {
        const itemDate = new Date(item.date);
        const itemStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}-${String(itemDate.getDate()).padStart(2, "0")}`;
        return itemStr === todayStr;
      });

      const updatedItem = {
        id: todayIndex >= 0 ? newHistory[todayIndex].id : "temp-id",
        date: todayStr,
        avgPrice: avgPrice,
        currentPrice: data.etf.price,
        dailyProfit: dailyProfit,
        returnRate: returnRate,
        totalValuation: totalValuation,
      };

      if (todayIndex >= 0) {
        // Only update if something actually changed to avoid unnecessary re-renders
        const existing = newHistory[todayIndex];
        const hasChanged =
          existing.avgPrice !== updatedItem.avgPrice ||
          existing.currentPrice !== updatedItem.currentPrice ||
          existing.dailyProfit !== updatedItem.dailyProfit ||
          existing.returnRate !== updatedItem.returnRate ||
          existing.totalValuation !== updatedItem.totalValuation;

        if (!hasChanged) return prev;
        newHistory[todayIndex] = updatedItem;
      } else {
        newHistory.unshift(updatedItem);
      }
      return newHistory;
    });
  }, [data?.etf, quantity, avgPrice, totalPrincipal, isLoaded]);

  // Save portfolio AND today's history to DB (Debounced)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveToDb = useCallback((payload: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      try {
        await axios.post("/api/portfolio", payload);
      } catch (error) {
        console.error("Failed to save to DB:", error);
      }
    }, 1500);
  }, []);

  useEffect(() => {
    if (!isLoaded || !data?.etf) return;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const totalValuation = data.etf.price * quantity;
    const dailyProfit = data.etf.changeAmount * quantity;
    const profitLoss = totalValuation - totalPrincipal;
    const returnRate =
      totalPrincipal > 0 ? (profitLoss / totalPrincipal) * 100 : 0;

    saveToDb({
      quantity,
      avgPrice,
      totalPrincipal,
      historyItem: {
        date: todayStr,
        avgPrice,
        currentPrice: data.etf.price,
        dailyProfit,
        returnRate,
        totalValuation,
      },
    });
  }, [quantity, avgPrice, totalPrincipal, data?.etf, saveToDb, isLoaded]);

  const isMarketOpen = data?.marketStatus === "OPEN";

  return (
    <main className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto selection:bg-blue-500/30">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src="/images/logo_kodex.png"
                alt="KODEX Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <h1 className="text-3xl font-black tracking-tighter italic text-slate-100">
              KODEX200
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              variant="outline"
              className={`flex items-center gap-1.5 py-1 px-3 border-slate-800 ${isMarketOpen ? "text-green-400 bg-green-400/5" : "text-slate-500 bg-slate-900"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isMarketOpen ? "bg-green-500 animate-pulse" : "bg-slate-700"}`}
              />
              시장 {isMarketOpen ? "개장" : "마감"}
            </Badge>
            <p className="text-slate-500 text-sm font-medium">
              날짜: {currentDate || "----.--.--"}
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section - Balanced Terminal Layout (8:4 Split) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Section: Main Data (Wider) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EtfSummaryCard
              data={data?.etf}
              isLoading={isLoading}
              title="KODEX 200"
            />
            <DailyProfitCard
              changeAmount={data?.etf?.changeAmount}
              quantity={quantity}
              isLoading={isLoading}
            />
          </div>
          <TotalPortfolioCard
            className="flex-1"
            totalValuation={data?.etf?.price ? data.etf.price * quantity : 0}
            totalPrincipal={totalPrincipal}
            isLoading={isLoading}
          />
        </div>

        {/* Right Section: Market (Narrower) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <MarketIndices data={data?.marketIndices} isLoading={isLoading} />
          <PortfolioInput
            subtitle="KODEX 200"
            quantity={quantity}
            setQuantity={setQuantity}
            avgPrice={avgPrice}
            setAvgPrice={setAvgPrice}
            totalPrincipal={totalPrincipal}
            setTotalPrincipal={setTotalPrincipal}
          />
        </div>
      </section>

      {/* History Section */}
      <section>
        <PortfolioHistoryTable history={history} isLoading={isLoading} />
      </section>

      <footer className="pt-20 pb-1 flex flex-col items-center gap-2 text-slate-600 border-t border-slate-900/50">
        <p className="text-[14px] font-bold">
          &copy; 2026 KODEX200 HTS. All rights reserved by Aufemir.
        </p>
      </footer>
    </main>
  );
}
