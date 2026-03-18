import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
  ChevronsLeft,
  ChevronsRight,
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
    const d = new Date(dateValue);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${m}월 ${day}일 (${w})`;
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 animate-pulse">
        <CardContent className="p-8 h-64" />
      </Card>
    );
  }

  // Filter out weekends and sort history by date descending
  const history = [...initialHistory]
    .filter((item) => {
      const day = new Date(item.date).getDay();
      return day !== 0 && day !== 6;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));
  const paginatedHistory = history.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-slate-950 border-slate-900 overflow-hidden shadow-2xl">
        <CardHeader className="border-b border-slate-900 bg-slate-900/50 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <History size={20} className="text-blue-400" />
            일간 투자 히스토리
          </CardTitle>
          {history.length > 0 && (
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Total {history.length} Days
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/30">
                <TableRow className="border-slate-900 hover:bg-transparent">
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    날짜
                  </TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    전일 종가
                  </TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    현재가
                  </TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    전일대비
                  </TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    일간 수익
                  </TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    수익률
                  </TableHead>
                  <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 text-center">
                    평가금액
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <AnimatePresence mode="wait">
                  {paginatedHistory.length === 0 ? (
                    <TableRow className="border-slate-900">
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-slate-500 text-sm italic"
                      >
                        기록된 히스토리가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedHistory.map((item, idx) => {
                      // 전체 history 배열에서 현재 아이템의 실제 인덱스를 찾음
                      const actualIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx;
                      // 전일 종가는 다음 인덱스(이전 날짜)의 currentPrice임
                      const prevClose = history[actualIdx + 1]?.currentPrice || 0;
                      const diffPrice = prevClose > 0 ? item.currentPrice - prevClose : 0;

                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          className="border-slate-900 hover:bg-slate-900/20 transition-colors group cursor-default"
                        >
                          <TableCell className="font-medium text-slate-300 py-4 text-sm text-center">
                            {formatDate(item.date)}
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm font-medium text-center">
                            {prevClose > 0 ? prevClose.toLocaleString() : "-"}
                            {prevClose > 0 && (
                              <span className="text-[10px] opacity-50 font-normal ml-0.5">
                                원
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-100 font-bold text-sm text-center">
                            {item.currentPrice.toLocaleString()}{" "}
                            <span className="text-[10px] opacity-50 font-normal">
                              원
                            </span>
                          </TableCell>
                          <TableCell className={`text-sm font-bold text-center ${diffPrice > 0 ? "text-red-400" : diffPrice < 0 ? "text-blue-400" : "text-slate-400"}`}>
                            {prevClose > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                {diffPrice > 0 ? (
                                  <TrendingUp size={12} />
                                ) : diffPrice < 0 ? (
                                  <TrendingDown size={12} />
                                ) : (
                                  <Minus size={12} />
                                )}
                                <span>{diffPrice > 0 ? "+" : ""}{diffPrice.toLocaleString()}</span>
                              </div>
                            ) : (
                              <span className="opacity-30">-</span>
                            )}
                          </TableCell>
                          <TableCell
                            className={`py-4 text-center ${item.dailyProfit > 0 ? "text-red-400" : item.dailyProfit < 0 ? "text-blue-400" : "text-slate-400"}`}
                          >
                            <div className="flex items-center justify-center gap-1.5 text-sm font-bold">
                              {item.dailyProfit > 0 ? (
                                <TrendingUp size={14} />
                              ) : item.dailyProfit < 0 ? (
                                <TrendingDown size={14} />
                              ) : (
                                <Minus size={14} />
                              )}
                              {item.dailyProfit > 0 ? "+" : ""}
                              {item.dailyProfit.toLocaleString()}
                              <span className="text-[10px] ml-0.5 font-normal opacity-60">
                                원
                              </span>
                            </div>
                          </TableCell>
                          <TableCell
                            className={`py-4 text-sm font-bold text-center ${item.returnRate >= 0 ? "text-red-400" : "text-blue-400"}`}
                          >
                            {item.returnRate >= 0 ? "+" : ""}
                            {item.returnRate.toFixed(2)} %
                          </TableCell>
                          <TableCell className="text-slate-200 font-black tracking-tighter text-sm py-4 text-center">
                            {item.totalValuation.toLocaleString()}{" "}
                            <span className="text-[10px] text-slate-500 font-normal">
                              원
                            </span>
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
        {totalPages > 1 && (
          <CardFooter className="border-t border-slate-900 bg-slate-900/20 py-4 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 text-slate-500 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-20"
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 text-slate-500 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-20"
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="flex items-center gap-1 px-4 text-slate-400 text-xs font-bold">
              Page <span className="text-blue-400 mx-1">{currentPage}</span> of{" "}
              {totalPages}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 text-slate-500 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-20"
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 text-slate-500 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-20"
            >
              <ChevronsRight size={16} />
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
