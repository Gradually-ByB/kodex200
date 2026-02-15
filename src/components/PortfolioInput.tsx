'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from './ui/label';
import { Settings2 } from 'lucide-react';

interface PortfolioInputProps {
    quantity: number;
    setQuantity: (value: number) => void;
    avgPrice: number;
    setAvgPrice: (value: number) => void;
}

export default function PortfolioInput({ quantity, setQuantity, avgPrice, setAvgPrice }: PortfolioInputProps) {
    return (
        <Card className="flex-1 bg-slate-900/50 border-slate-800 backdrop-blur-xl relative overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-800/50">
                <CardTitle className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                    <Settings2 size={16} />
                    투자 정보 설정
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        보유 수량 (주)
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
                        className="bg-slate-950 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-200 font-mono text-lg text-right"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="avgPrice" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        평균 단가 (원)
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
                        className="bg-slate-950 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20 text-slate-200 font-mono text-lg text-right"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
