'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface MyPortfolioCardProps {
    currentPrice?: number;
    isLoading: boolean;
    quantity: number;
    avgPrice: number;
}

export default function MyPortfolioCard({ currentPrice, isLoading, quantity, avgPrice }: MyPortfolioCardProps) {
    // User's investment data
    const principal = avgPrice * quantity;

    if (isLoading || !currentPrice) {
        return (
            <Card className="bg-slate-900 border-slate-800 animate-pulse mt-6">
                <CardContent className="p-6 h-32" />
            </Card>
        );
    }

    // Calculations
    const valuation = currentPrice * quantity;
    const profitLoss = valuation - principal;
    const returnRate = (profitLoss / principal) * 100;

    const isPositive = profitLoss >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-slate-50 mt-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Wallet size={100} />
                </div>

                <CardHeader className="pb-2 border-b border-slate-800/50">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Wallet size={16} />
                            내 보유 자산 현황
                        </CardTitle>
                        <Badge variant="outline" className="border-slate-700 text-slate-400 font-normal">
                            보유 {quantity}주
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Valuation */}
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500">총 평가 금액</p>
                        <p className="text-2xl font-bold tracking-tight">
                            {valuation.toLocaleString()} <span className="text-sm text-slate-500 font-normal">원</span>
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500">투자 원금: {principal.toLocaleString()}원</span>
                        </div>
                    </div>

                    {/* Profit/Loss */}
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500">평가 손익</p>
                        <div className={`flex items-center gap-2 ${isPositive ? 'text-red-400' : 'text-blue-400'}`}>
                            <p className="text-2xl font-bold tracking-tight">
                                {isPositive ? '+' : ''}{profitLoss.toLocaleString()}
                            </p>
                            <span className="text-sm font-normal">원</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <span>평단가: {avgPrice.toLocaleString()}원</span>
                        </div>
                    </div>

                    {/* Return Rate */}
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500">수익률</p>
                        <div className={`flex items-center gap-2 ${isPositive ? 'text-red-400' : 'text-blue-400'}`}>
                            {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            <p className="text-2xl font-bold tracking-tight">
                                {isPositive ? '+' : ''}{returnRate.toFixed(2)}
                            </p>
                            <span className="text-sm font-normal">%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
