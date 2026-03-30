"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HistoryItem {
  id: string;
  date: string | Date;
  avgPrice: number;
  currentPrice: number;
  dailyProfit: number;
  returnRate: number;
  totalValuation: number;
}

interface PortfolioHistoryTableProps {
  history: HistoryItem[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 5;

export default function PortfolioHistoryTable({
  history: initialHistory,
  isLoading,
}: PortfolioHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (dateValue: string | Date) => {
    // Handling date string vs object and avoiding local date shift
    const dateStr = typeof dateValue === 'string' ? dateValue.split('T')[0] : dateValue.toISOString().split('T')[0];
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${m}월 ${day}일 (${w})`;
  };

  // Skip weekends to ensure consistent day-to-day profit calculation
  const history = useMemo(() => {
    if (!initialHistory) return [];
    return initialHistory.filter(item => {
      const d = new Date(item.date);
      const day = d.getDay();
      return day !== 0 && day !== 6; // Filter out Sun(0) and Sat(6)
    });
  }, [initialHistory]);

  const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));

  const paginatedHistory = useMemo(() => {
    return history.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
  }, [history, currentPage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-slate-900/80 border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-md">
        <CardHeader className="border-b border-slate-700/50 bg-slate-900/50 py-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <History className="text-indigo-400" size={20} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-100 tracking-tight">
                일간 투자 히스토리
              </CardTitle>
              <p className="text-xs text-slate-400 font-medium">최초 투자 시점부터 현재까지의 기록입니다.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-2 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-slate-900 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 disabled:opacity-20"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-slate-900 border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 disabled:opacity-20"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || history.length === 0 || isLoading}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-800/50">
                <TableRow className="border-slate-800 border-b hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[11px] py-4 w-[100px] text-center">
                    날짜
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    전일 종가
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    금일 종가
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    전일대비
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    일간 수익
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    수익률
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    누적 손익
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    평가금액
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <AnimatePresence mode="wait">
                  {isLoading && history.length === 0 ? (
                    <TableRow className="border-slate-900">
                      <TableCell colSpan={8} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-slate-500 font-medium">히스토리를 불러오는 중...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow className="border-slate-900">
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500 text-sm italic">
                        기록된 히스토리가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedHistory.map((item, idx) => {
                      const actualIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx;
                      const prevClose = history[actualIdx + 1]?.currentPrice || 0;
                      const diffPrice = prevClose > 0 ? item.currentPrice - prevClose : 0;

                      const cumulativeProfit = Math.round(
                        item.totalValuation -
                        item.totalValuation / (1 + item.returnRate / 100),
                      );

                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          className="border-slate-800 hover:bg-slate-800/50 transition-colors group cursor-default"
                        >
                          <TableCell className="font-medium text-slate-200 py-4 text-sm text-center">
                            {formatDate(item.date)}
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm font-medium text-center">
                            {prevClose > 0 ? prevClose.toLocaleString() : "-"}
                            {prevClose > 0 && <span className="text-[10px] opacity-40 ml-1">원</span>}
                          </TableCell>
                          <TableCell className="text-white font-bold text-sm text-center">
                            {item.currentPrice.toLocaleString()}
                            <span className="text-[10px] opacity-40 ml-1">원</span>
                          </TableCell>
                          <TableCell className={`text-sm font-bold text-center ${diffPrice > 0 ? "text-red-400" : diffPrice < 0 ? "text-blue-400" : "text-slate-400"}`}>
                            {prevClose > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                {diffPrice > 0 ? <TrendingUp size={12} /> : diffPrice < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                                <span>{diffPrice > 0 ? "+" : ""}{diffPrice.toLocaleString()}</span>
                              </div>
                            ) : (
                              <span className="opacity-30">-</span>
                            )}
                          </TableCell>
                          <TableCell className={`text-sm font-bold text-center ${item.dailyProfit > 0 ? "text-red-400" : item.dailyProfit < 0 ? "text-blue-400" : "text-slate-400"}`}>
                            {item.dailyProfit > 0 ? "+" : ""}
                            {Math.round(item.dailyProfit).toLocaleString()}
                          </TableCell>
                          <TableCell className={`text-sm font-bold text-center ${item.returnRate > 0 ? "text-red-400" : item.returnRate < 0 ? "text-blue-400" : "text-slate-400"}`}>
                            {item.returnRate > 0 ? "+" : ""}
                            {item.returnRate.toFixed(2)}%
                          </TableCell>
                          <TableCell className={`text-sm font-bold text-center ${cumulativeProfit > 0 ? "text-red-400" : cumulativeProfit < 0 ? "text-blue-400" : "text-slate-400"}`}>
                            {cumulativeProfit > 0 ? "+" : ""}
                            {cumulativeProfit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-slate-200 font-bold text-sm text-center">
                            {Math.round(item.totalValuation).toLocaleString()}
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
