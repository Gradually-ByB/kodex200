'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

interface TotalPortfolioCardProps {
    totalValuation: number;
    totalPrincipal: number;
    isLoading: boolean;
    className?: string;
}

export default function TotalPortfolioCard({ totalValuation, totalPrincipal, isLoading, className }: TotalPortfolioCardProps) {
    if (isLoading) {
        return (
            <Card className="bg-slate-900 border-slate-800 animate-pulse mt-4">
                <CardContent className="p-3 h-32" />
            </Card>
        );
    }

    // Calculations
    const profitLoss = totalValuation - totalPrincipal;
    const totalReturnRate = totalPrincipal > 0 ? (profitLoss / totalPrincipal) * 100 : 0;

    const isPositive = profitLoss >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`flex flex-col ${className || ''}`}
        >
            <Card className="bg-gradient-to-br from-indigo-950 to-slate-950 border-indigo-900/50 text-slate-50 mt-4 relative overflow-hidden flex-1 flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
                    <PieChart size={130} />
                </div>

                <CardHeader className="py-2 px-4 border-b border-indigo-900/30">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                            <Wallet size={16} />
                            <span>
                                총 보유 자산 현황
                                <span className="text-indigo-400 ml-1.5 font-bold tracking-tight">(합계)</span>
                            </span>
                        </CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 items-center">
                    {/* Valuation */}
                    <div className="space-y-1">
                        <p className="text-xs text-indigo-300/70">총 평가 금액</p>
                        <p className="text-2xl font-bold tracking-tight flex items-baseline gap-1 pt-2">
                            <span className="inline-block scale-y-[1.5] origin-bottom">
                                {totalValuation.toLocaleString()}
                            </span>
                            <span className="text-sm text-indigo-400/70 font-normal">원</span>
                        </p>
                        <div className="flex flex-col gap-0.5 text-[10px] text-indigo-300/70 font-medium">
                            <div className="flex items-center gap-1">
                                <span>총 투자 원금:</span>
                                <span className="text-indigo-200 font-bold">{totalPrincipal.toLocaleString()}원</span>
                            </div>
                        </div>
                    </div>

                    {/* Profit/Loss */}
                    <div className="space-y-1">
                        <p className="text-xs text-indigo-300/70">총 평가 손익</p>
                        <div className={`flex items-baseline gap-1 pt-2 ${isPositive ? 'text-red-400' : 'text-blue-400'}`}>
                            <p className="text-2xl font-bold tracking-tight">
                                <span className="inline-block scale-y-[1.5] origin-bottom">
                                    {isPositive ? '+' : ''}{profitLoss.toLocaleString()}
                                </span>
                            </p>
                            <span className="text-sm font-normal">원</span>
                        </div>
                    </div>

                    {/* Return Rate */}
                    <div className="space-y-1">
                        <p className="text-xs text-indigo-300/70">총 전체 수익률</p>
                        <div className={`flex items-baseline gap-2 pt-2 ${totalReturnRate >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
                            {totalReturnRate >= 0 ? <TrendingUp size={20} className="self-center" /> : <TrendingDown size={20} className="self-center" />}
                            <p className="text-2xl font-bold tracking-tight">
                                <span className="inline-block scale-y-[1.5] origin-bottom">
                                    {totalReturnRate >= 0 ? '+' : ''}{totalReturnRate.toFixed(2)}
                                </span>
                            </p>
                            <span className="text-sm font-normal">%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
