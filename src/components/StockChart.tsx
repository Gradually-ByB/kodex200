'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Maximize2, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface StockChartProps {
    symbol?: string;
    className?: string;
}

export default function StockChart({ symbol = '069500', className }: StockChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (series: any) => {
        try {
            const response = await axios.get(`/api/chart?symbol=${symbol}`);
            series.setData(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const container = chartContainerRef.current;

        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
                fontSize: 10,
            },
            grid: {
                vertLines: { color: 'rgba(30, 41, 59, 0.1)' },
                horzLines: { color: 'rgba(30, 41, 59, 0.1)' },
            },
            rightPriceScale: {
                borderColor: 'rgba(30, 41, 59, 0.5)',
            },
            timeScale: {
                borderColor: 'rgba(30, 41, 59, 0.5)',
                timeVisible: true,
            },
        });

        // Use a local variable to ensure we are calling on the correct object
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#ef4444',
            downColor: '#3b82f6',
            borderVisible: false,
            wickUpColor: '#ef4444',
            wickDownColor: '#3b82f6',
        });

        chartRef.current = chart;

        fetchData(candleSeries);

        const handleResize = () => {
            if (container && chart) {
                chart.applyOptions({ width: container.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [symbol]);

    return (
        <Card className={`bg-slate-900 border-slate-800 text-white overflow-hidden flex flex-col ${className}`}>
            <CardHeader className="py-1 px-4 border-b border-slate-800/50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <LineChart size={16} />
                    실시간 일봉 차트 (KODEX 200)
                </CardTitle>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            // Manual refresh logic would go here if needed, 
                            // but for now the initial load is most important.
                        }}
                        className="p-1 hover:bg-slate-800 rounded-md text-slate-500 transition-colors"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <Maximize2 size={14} className="text-slate-500 cursor-pointer hover:text-slate-300" />
                </div>
            </CardHeader>
            <CardContent className="p-0 relative min-h-[320px]">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-xs text-slate-400 font-medium">차트 로딩 중...</p>
                        </div>
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full h-80" />
                <div className="absolute bottom-2 left-4 z-10 pointer-events-none">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Powered by Naver Finance</p>
                </div>
            </CardContent>
        </Card>
    );
}
