'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import MyPortfolioCard from '@/components/MyPortfolioCard';
import EtfSummaryCard from '@/components/EtfSummaryCard';
import StockTable from '@/components/StockTable';
import { ApiResponse, Portfolio } from '@/types/stock';
import { RefreshCw, Activity, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import PortfolioInput from '@/components/PortfolioInput';
import MarketIndices from '@/components/MarketIndices';
import StockChart from '@/components/StockChart';

export default function Home() {
  const [isLiveEnabled, setIsLiveEnabled] = useState(false);
  const [quantity, setQuantity] = useState(27);
  const [avgPrice, setAvgPrice] = useState(76573);
  const [totalPrincipal, setTotalPrincipal] = useState(27 * 76573);
  const [currentTime, setCurrentTime] = useState<string>('');

  // TIGER 200 State
  const [tigerQuantity, setTigerQuantity] = useState(0);
  const [tigerAvgPrice, setTigerAvgPrice] = useState(0);
  const [tigerTotalPrincipal, setTigerTotalPrincipal] = useState(0);

  // Debounced save function for localStorage
  const debouncedSave = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (data: any) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          localStorage.setItem('portfolio', JSON.stringify(data));
        }, 1000);
      };
    })(),
    []
  );

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('portfolio');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setQuantity(data.kodexQuantity ?? 27);
        setAvgPrice(data.kodexAvgPrice ?? 76573);
        setTotalPrincipal(data.kodexPrincipal ?? (27 * 76573));
        setTigerQuantity(data.tigerQuantity ?? 0);
        setTigerAvgPrice(data.tigerAvgPrice ?? 0);
        setTigerTotalPrincipal(data.tigerPrincipal ?? 0);
      } catch (e) {
        console.error('Failed to load portfolio from localStorage', e);
      }
    }
  }, []);

  // Auto-save to localStorage when values change
  useEffect(() => {
    debouncedSave({
      kodexQuantity: quantity,
      kodexAvgPrice: avgPrice,
      kodexPrincipal: totalPrincipal,
      tigerQuantity: tigerQuantity,
      tigerAvgPrice: tigerAvgPrice,
      tigerPrincipal: tigerTotalPrincipal,
    });
  }, [quantity, avgPrice, totalPrincipal, tigerQuantity, tigerAvgPrice, tigerTotalPrincipal, debouncedSave]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds} KST`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data, isLoading, refetch, isFetching } = useQuery<ApiResponse & { marketStatus: string }>({
    queryKey: ['quotes', isLiveEnabled],
    queryFn: async () => {
      const response = await axios.get(`/api/quotes${isLiveEnabled ? '?live=true' : ''}`);
      return response.data;
    },
    refetchInterval: isLiveEnabled ? 2000 : 30000,
  });

  const isMarketOpen = data?.marketStatus === 'OPEN';

  return (
    <main className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto selection:bg-blue-500/30">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src="/images/logo_kodex.png"
                alt="KODEX Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <h1 className="text-3xl font-black tracking-tighter italic text-slate-100">
              KODEX200
            </h1>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className={`flex items-center gap-1.5 py-1 px-3 border-slate-800 ${isMarketOpen ? 'text-green-400 bg-green-400/5' : 'text-slate-500 bg-slate-900'}`}>
              <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`} />
              시장 {isMarketOpen ? '개장' : '마감'}
            </Badge>
            <p className="text-slate-500 text-sm font-medium">
              데이터: 2026-02-13 아카이브 {isLiveEnabled && '+ 실시간 시뮬레이션'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-md">
          <div className="px-4 hidden lg:block border-r border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">기준 시각</p>
            <p className="text-sm font-mono text-blue-400 font-bold min-w-[90px]">{currentTime || '--:--:-- KST'}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* DB status removed as per user request */}


            <Button
              variant={isLiveEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLiveEnabled(!isLiveEnabled)}
              className={`transition-all duration-300 rounded-xl ${isLiveEnabled ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20' : 'bg-slate-950 border-slate-800'}`}
            >
              <Activity size={16} className={`mr-2 ${isLiveEnabled ? 'animate-pulse' : ''}`} />
              {isLiveEnabled ? '실시간 온' : '실시간 시작'}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-xl hover:bg-slate-800 text-slate-400"
            >
              <RefreshCw size={18} className={`${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      {!isMarketOpen && isLiveEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-xl flex items-center gap-3 text-sm"
        >
          <AlertCircle size={18} />
          현재 시장이 마감되었습니다. 전일 종가 기반 실시간 시뮬레이션을 표시합니다.
        </motion.div>
      )}

      {/* Hero Section - Balanced Terminal Layout (8:4 Split) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section: Main Data (Wider) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <EtfSummaryCard data={data?.etf} isLoading={isLoading} title="KODEX 200" />
            <EtfSummaryCard data={data?.tiger} isLoading={isLoading} title="TIGER 200" />
          </div>
          <MyPortfolioCard
            subtitle="KODEX 200"
            currentPrice={data?.etf?.price}
            isLoading={isLoading}
            quantity={quantity}
            avgPrice={avgPrice}
            totalPrincipal={totalPrincipal}
          />
          <MyPortfolioCard
            subtitle="TIGER 200"
            currentPrice={data?.tiger?.price}
            isLoading={isLoading}
            quantity={tigerQuantity}
            avgPrice={tigerAvgPrice}
            totalPrincipal={tigerTotalPrincipal}
          />
          <StockChart symbol="069500" />
        </div>

        {/* Right Section: Market & Controls (Narrower) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <MarketIndices data={data?.marketIndices} isLoading={isLoading} />

          <div className="flex flex-col gap-4">
            <PortfolioInput
              subtitle="KODEX 200"
              quantity={quantity}
              setQuantity={setQuantity}
              avgPrice={avgPrice}
              setAvgPrice={setAvgPrice}
              totalPrincipal={totalPrincipal}
              setTotalPrincipal={setTotalPrincipal}
            />

            <PortfolioInput
              subtitle="TIGER 200"
              quantity={tigerQuantity}
              setQuantity={setTigerQuantity}
              avgPrice={tigerAvgPrice}
              setAvgPrice={setTigerAvgPrice}
              totalPrincipal={tigerTotalPrincipal}
              setTotalPrincipal={setTigerTotalPrincipal}
            />

          </div>
        </div>
      </section>

      {/* Main Stock Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl tracking-tight underline decoration-blue-500/40 decoration-4 underline-offset-8">구성 종목 현황</h3>
            <span className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 uppercase tracking-tighter">
              <Activity size={10} />
              {isLiveEnabled ? '스트리밍' : '스냅샷'}
            </span>
          </div>
        </div>
        <StockTable stocks={data?.stocks || []} isLoading={isLoading} />
      </section>

      <footer className="pt-20 pb-12 flex flex-col items-center gap-4 text-slate-600 border-t border-slate-900/50">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em]">
          &copy; 2026 KODEX200 HTS. All rights reserved by Aufemir.
        </p>
      </footer>
    </main>
  );
}
