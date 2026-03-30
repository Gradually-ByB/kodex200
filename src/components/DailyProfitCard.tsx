"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface DailyProfitCardProps {
  changeAmount?: number;
  quantity: number;
  isLoading: boolean;
}

export default function DailyProfitCard({
  changeAmount = 0,
  quantity,
  isLoading,
}: DailyProfitCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-md animate-pulse">
        <CardContent className="p-6 h-32" />
      </Card>
    );
  }

  const dailyProfit = changeAmount * quantity;
  const isPositive = dailyProfit > 0;
  const isNegative = dailyProfit < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full"
    >
      <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-md text-slate-100 overflow-hidden relative h-full flex flex-col justify-center">
        <div className="absolute top-0 right-1 border-white p-6 opacity-[0.03] pointer-events-none select-none">
          <span className="text-[140px] font-black leading-none">₩</span>
        </div>
        <CardContent className="px-6 py-0">
          <div>
            <p className="text-slate-300 text-xs font-bold uppercase mb-4">
              일간 수익
            </p>
            <div className="flex items-baseline gap-2 pt-4">
              <h2
                className={`text-2xl font-black tracking-tighter transition-all duration-300 ${isPositive
                  ? "text-red-500"
                  : isNegative
                    ? "text-blue-500"
                    : "text-slate-400"
                  }`}
              >
                <span className="inline-block scale-y-[1.5] origin-bottom leading-none">
                  {isPositive ? "+" : ""}
                  {dailyProfit.toLocaleString()}
                </span>
              </h2>
              <span className="text-slate-400 text-xs font-semibold">원</span>
            </div>
            <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-400 font-medium italic">
              {isPositive ? (
                <span className="flex items-center gap-1.5 text-red-400">
                  <TrendingUp size={14} /> 전일 대비 자산 증가
                </span>
              ) : isNegative ? (
                <span className="flex items-center gap-1.5 text-blue-400">
                  <TrendingDown size={14} /> 전일 대비 자산 감소
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Minus size={14} /> 변동 없음
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
