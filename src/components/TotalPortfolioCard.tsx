"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react";
import { motion } from "framer-motion";

interface TotalPortfolioCardProps {
  totalValuation: number;
  totalPrincipal: number;
  isLoading: boolean;
  className?: string;
}

export default function TotalPortfolioCard({
  totalValuation,
  totalPrincipal,
  isLoading,
  className,
}: TotalPortfolioCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 animate-pulse mt-4">
        <CardContent className="p-3 h-32" />
      </Card>
    );
  }

  // Calculations
  const profitLoss = totalValuation - totalPrincipal;
  const totalReturnRate =
    totalPrincipal > 0 ? (profitLoss / totalPrincipal) * 100 : 0;

  const isPositive = profitLoss >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`flex flex-col ${className || ""}`}
    >
      <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-indigo-500/30 text-slate-100 mt-4 relative overflow-hidden flex-1 flex flex-col justify-center backdrop-blur-md">
        <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
          <PieChart size={130} />
        </div>

        <CardHeader className="py-2 px-4 border-b border-indigo-900/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-indigo-300 flex items-center gap-2">
              <PieChart size={16} />
              <span>자산 총괄 리포트</span>
            </CardTitle>
            <Badge
              variant="outline"
              className="border-indigo-400/30 text-indigo-300 font-normal text-[10px] uppercase tracking-wider"
            >
              Portfolio Summary
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4 pb-10 grid grid-cols-1 md:grid-cols-3 items-center gap-y-10">
          {/* Valuation */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-normal">
              실시간 평가 금액
            </p>
            <p className="text-3xl font-black tracking-tighter flex items-baseline gap-1.5 pt-8">
              <span className="inline-block scale-y-[2.0] origin-bottom text-white leading-none">
                {totalValuation.toLocaleString()}
              </span>
              <span className="text-sm text-indigo-400/50 font-semibold tracking-wide">
                원
              </span>
            </p>
            <div className="flex items-center gap-2 pt-8 text-[11px] text-indigo-300/60">
              <span className="font-medium">투자 원금</span>
              <span className="w-1 h-1 rounded-full bg-indigo-500/20" />
              <span className="text-indigo-200/80 font-bold">
                {totalPrincipal.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* Profit/Loss */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-normal">
              누적 투자 손익
            </p>
            <div
              className={`flex items-baseline gap-1.5 pt-8 ${isPositive ? "text-red-500" : "text-blue-500"}`}
            >
              <p className="text-3xl font-black tracking-tighter leading-none">
                <span className="inline-block scale-y-[2.0] origin-bottom">
                  {isPositive ? "+" : ""}
                  {profitLoss.toLocaleString()}
                </span>
              </p>
              <span className="text-sm font-semibold tracking-wide">원</span>
            </div>
            <div className="flex items-center gap-2 pt-8 text-[11px] text-indigo-300/60">
              <span className="font-medium italic">
                변동액 기준 실시간 점검
              </span>
            </div>
          </div>

          {/* Return Rate */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-normal">
              수익률
            </p>
            <div
              className={`flex items-baseline gap-2.5 pt-8 ${totalReturnRate >= 0 ? "text-red-500" : "text-blue-500"}`}
            >
              {totalReturnRate >= 0 ? (
                <TrendingUp size={22} className="self-center mb-1" />
              ) : (
                <TrendingDown size={22} className="self-center mb-1" />
              )}
              <p className="text-3xl font-black tracking-tighter leading-none">
                <span className="inline-block scale-y-[2.0] origin-bottom">
                  {totalReturnRate >= 0 ? "+" : ""}
                  {totalReturnRate.toFixed(2)}
                </span>
              </p>
              <span className="text-sm font-semibold tracking-wide">%</span>
            </div>
            <div className="flex items-center gap-2 pt-8 text-[11px] text-indigo-300/60">
              <span className="font-medium italic">ROI 정밀 분석 결과</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
