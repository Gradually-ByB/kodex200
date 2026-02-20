'use client';

import { Card, CardContent } from '@/components/ui/card';
import { EtfQuote } from '@/types/stock';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface EtfSummaryCardProps {
    data?: EtfQuote;
    isLoading: boolean;
    title?: string;
}

export default function EtfSummaryCard({ data, isLoading, title = 'KODEX 200' }: EtfSummaryCardProps) {
    if (isLoading || !data) {
        return (
            <Card className="bg-slate-900 border-slate-800 animate-pulse">
                <CardContent className="p-6 h-32" />
            </Card>
        );
    }

    const isPositive = data.changeAmount > 0;
    const isNegative = data.changeAmount < 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    {isPositive ? <TrendingUp size={120} /> : isNegative ? <TrendingDown size={120} /> : <Minus size={120} />}
                </div>
                <CardContent className="px-6 py-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                            <h2 className="text-4xl font-bold tracking-tight">
                                {data.price.toLocaleString()}
                                <span className="text-slate-500 text-lg ml-2 font-normal">KRW</span>
                            </h2>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${isPositive ? 'bg-red-500/10 text-red-400' : isNegative ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                            }`}>
                            {isPositive ? <TrendingUp size={16} /> : isNegative ? <TrendingDown size={16} /> : <Minus size={16} />}
                            <span>{isPositive ? '+' : ''}{data.changeAmount.toLocaleString()} ({data.changeRate}%)</span>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-6 text-sm">
                        <div className="flex flex-col">
                            <span className="text-slate-500">시장 상태</span>
                            <span className="text-green-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                운영 중
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
