'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Stock, Quote } from '@/types/stock';
import { Search, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface StockTableProps {
    stocks: (Stock & Quote)[];
    isLoading: boolean;
}

type SortConfig = {
    key: keyof (Stock & Quote) | 'changeRate';
    direction: 'asc' | 'desc';
} | null;

const PriceCell = ({ price, prevPrice }: { price: number; prevPrice: number | undefined }) => {
    const [flash, setFlash] = useState<'up' | 'down' | null>(null);

    useEffect(() => {
        if (prevPrice !== undefined && price !== prevPrice) {
            setFlash(price > prevPrice ? 'up' : 'down');
            const timer = setTimeout(() => setFlash(null), 1000);
            return () => clearTimeout(timer);
        }
    }, [price, prevPrice]);

    return (
        <TableCell className={`text-right font-mono transition-colors duration-500 ${flash === 'up' ? 'bg-red-500/20 text-red-400' : flash === 'down' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-200'
            }`}>
            {price.toLocaleString()}
        </TableCell>
    );
};

export default function StockTable({ stocks, isLoading }: StockTableProps) {
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'changeRate', direction: 'desc' });
    const prevStocksRef = useRef<Record<string, number>>({});

    useEffect(() => {
        if (stocks.length > 0) {
            const currentPrices: Record<string, number> = {};
            stocks.forEach(s => {
                currentPrices[s.종목코드] = s.price;
            });
            // We don't update ref here immediately because we want to compare with PREVIOUS state
            // Actually, we'll update it *after* children render or in a way that respects the cycle
        }
    }, [stocks]);

    const handleSort = (key: any) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredStocks = stocks
        .filter(stock =>
            stock.종목명.toLowerCase().includes(search.toLowerCase()) ||
            stock.종목코드.includes(search)
        )
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;
            const aValue = (a as any)[key];
            const bValue = (b as any)[key];

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

    // Keep track of prices for flash effect
    const stockPriceMap = stocks.reduce((acc, s) => {
        acc[s.종목코드] = s.price;
        return acc;
    }, {} as Record<string, number>);

    useEffect(() => {
        return () => {
            prevStocksRef.current = stockPriceMap;
        };
    }, [stocks]);

    return (
        <div className="space-y-4">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <Input
                    placeholder="종목명 또는 코드로 검색..."
                    className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-sans"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
                <div className="max-h-[600px] overflow-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-slate-900/90 sticky top-0 z-10 backdrop-blur-xl border-b border-slate-800">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="w-[80px] text-slate-400 font-bold text-xs uppercase tracking-wider">코드</TableHead>
                                <TableHead className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                                    <button onClick={() => handleSort('종목명')} className="flex items-center gap-1 hover:text-white transition-colors">
                                        종목명 <ArrowUpDown size={12} />
                                    </button>
                                </TableHead>
                                <TableHead className="text-right text-slate-400 font-bold text-xs uppercase tracking-wider">
                                    <button onClick={() => handleSort('price')} className="ml-auto flex items-center gap-1 hover:text-white transition-colors">
                                        현재가 <ArrowUpDown size={12} />
                                    </button>
                                </TableHead>
                                <TableHead className="text-right text-slate-400 font-bold text-xs uppercase tracking-wider">
                                    <button onClick={() => handleSort('changeRate')} className="ml-auto flex items-center gap-1 hover:text-white transition-colors">
                                        등락률 <ArrowUpDown size={12} />
                                    </button>
                                </TableHead>
                                <TableHead className="text-right text-slate-400 font-bold text-xs uppercase tracking-wider">
                                    <button onClick={() => handleSort('volume')} className="ml-auto flex items-center gap-1 hover:text-white transition-colors">
                                        거래량 <ArrowUpDown size={12} />
                                    </button>
                                </TableHead>
                                <TableHead className="text-right text-slate-400 font-bold text-xs uppercase tracking-wider">비중</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 15 }).map((_, i) => (
                                    <TableRow key={i} className="border-slate-800 animate-pulse">
                                        <TableCell colSpan={6} className="h-12 bg-slate-800/10" />
                                    </TableRow>
                                ))
                            ) : (
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {filteredStocks.map((stock) => (
                                        <motion.tr
                                            layout
                                            key={stock.종목코드}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-slate-800 hover:bg-slate-800/40 transition-colors group cursor-pointer"
                                        >
                                            <TableCell className="font-mono text-[10px] text-slate-500 group-hover:text-slate-300">{stock.종목코드}</TableCell>
                                            <TableCell className="font-bold text-slate-200">{stock.종목명}</TableCell>
                                            <PriceCell price={stock.price} prevPrice={prevStocksRef.current[stock.종목코드]} />
                                            <TableCell className="text-right">
                                                <div className={`inline-flex items-center font-mono font-bold ${stock.changeRate > 0 ? 'text-red-400' : stock.changeRate < 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                                                    {stock.changeRate > 0 ? '▲' : stock.changeRate < 0 ? '▼' : ''}
                                                    {Math.abs(stock.changeRate).toFixed(2)}%
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-slate-400 text-sm font-mono group-hover:text-slate-200 transition-colors">
                                                {stock.volume.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="bg-slate-900 border-slate-800 text-slate-500 font-mono text-[10px] group-hover:border-slate-700 transition-colors">
                                                    {stock["비중(%)"]}
                                                </Badge>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
        </div>
    );
}
