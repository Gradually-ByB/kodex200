'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from './ui/label';
import { Settings2 } from 'lucide-react';

interface PortfolioInputProps {
    subtitle?: string;
    quantity: number;
    setQuantity: (value: number) => void;
    avgPrice: number;
    setAvgPrice: (value: number) => void;
    totalPrincipal: number;
    setTotalPrincipal: (value: number) => void;
}

export default function PortfolioInput({
    subtitle,
    quantity,
    setQuantity,
    avgPrice,
    setAvgPrice,
    totalPrincipal,
    setTotalPrincipal
}: PortfolioInputProps) {
    return (
        <Card className="flex-1 bg-slate-900/50 border-slate-800 backdrop-blur-xl relative overflow-hidden">
            <CardHeader className="py-2 px-4 border-b border-slate-800/50">
                <div className="flex flex-col gap-0.5">
                    <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                        <Settings2 size={16} />
                        투자 정보 설정
                    </CardTitle>
                    {subtitle && (
                        <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest pl-6">
                            {subtitle}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-2 p-4 space-y-1">
                <div className="space-y-1">
                    <Label htmlFor="quantity" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        보유 수량(주)
                    </Label>
                    <Input
                        id="quantity"
                        type="text"
                        value={quantity.toLocaleString()}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, '');
                            const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                            setQuantity(numericValue);
                        }}
                        className="h-9 bg-slate-950 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-200 font-mono text-base text-right"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="avgPrice" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        평균 단가(원)
                    </Label>
                    <Input
                        id="avgPrice"
                        type="text"
                        value={avgPrice.toLocaleString()}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, '');
                            const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                            setAvgPrice(numericValue);
                        }}
                        className="h-9 bg-slate-950 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-200 font-mono text-base text-right"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="totalPrincipal" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-blue-400">
                        투자 원금(원)
                    </Label>
                    <Input
                        id="totalPrincipal"
                        type="text"
                        value={totalPrincipal.toLocaleString()}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, '');
                            const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                            setTotalPrincipal(numericValue);
                        }}
                        className="h-9 bg-slate-950 border-blue-900/40 focus:border-blue-500/50 focus:ring-blue-500/20 text-blue-400 font-mono text-base text-right shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
