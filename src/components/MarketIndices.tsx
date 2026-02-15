'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndexData } from '@/types/stock';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface MarketIndicesProps {
    data?: {
        kospi: IndexData;
        kosdaq: IndexData;
    };
    isLoading: boolean;
    className?: string;
}

export default function MarketIndices({ data, isLoading, className }: MarketIndicesProps) {
    if (isLoading || !data) {
        return (
            <Card className="bg-slate-900 border-slate-800 animate-pulse">
                <CardContent className="h-40" />
            </Card>
        );
    }

    const renderIndex = (title: string, index: IndexData, isLast: boolean) => {
        const isPositive = index.change > 0;
        const isNegative = index.change < 0;

        return (
            <div className={`relative overflow-hidden p-4 ${!isLast ? 'border-b border-slate-800/50' : ''}`}>
                {/* Background Icon */}
                <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                    {isPositive ? <TrendingUp size={60} /> : isNegative ? <TrendingDown size={60} /> : <Minus size={60} />}
                </div>

                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-0.5">{title}</p>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-100 leading-tight">
                            {index.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            <span className="text-slate-500 text-xs ml-1 font-normal tracking-normal uppercase text-opacity-60">pt</span>
                        </h2>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isPositive ? 'bg-red-500/10 text-red-500' : isNegative ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>
                        {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
                        <span>{isPositive ? '+' : ''}{index.change.toFixed(2)} ({isPositive ? '+' : ''}{index.rate}%)</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={className}
        >
            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white overflow-hidden flex flex-col">
                <CardHeader className="py-1 px-4 border-b border-slate-800/50">
                    <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-1">
                        <Activity size={16} />
                        시장 주요 지수
                    </CardTitle>
                </CardHeader>
                <div className="flex flex-col">
                    {renderIndex('KOSPI', data.kospi, false)}
                    {renderIndex('KOSDAQ', data.kosdaq, true)}
                </div>
            </Card>
        </motion.div>
    );
}
