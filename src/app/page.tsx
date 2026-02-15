'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import MyPortfolioCard from '@/components/MyPortfolioCard';
import EtfSummaryCard from '@/components/EtfSummaryCard';
import StockTable from '@/components/StockTable';
import { ApiResponse } from '@/types/stock';
import { RefreshCw, LayoutDashboard, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import PortfolioInput from '@/components/PortfolioInput';

export default function Home() {
  const [isLiveEnabled, setIsLiveEnabled] = useState(false);
  const [quantity, setQuantity] = useState(27);
  const [avgPrice, setAvgPrice] = useState(76573);

  const { data, isLoading, refetch, isFetching } = useQuery<ApiResponse & { marketStatus: string }>({
    queryKey: ['quotes', isLiveEnabled],
    queryFn: async () => {
      const response = await axios.get(`/api/quotes${isLiveEnabled ? '?live=true' : ''}`);
      return response.data;
    },
    // When live is enabled, poll every 2 seconds for that "real-time" feel
    // Outside live mode, poll every 30 seconds as per original PRD
    refetchInterval: isLiveEnabled ? 2000 : 30000,
  });

  const isMarketOpen = data?.marketStatus === 'OPEN';

  return (
    <main className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto selection:bg-blue-500/30">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-8">
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
            <p className="text-sm font-mono text-blue-400 font-bold">15:30:00 KST</p>
          </div>

          <div className="flex items-center gap-2">
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

      {/* Hero Section - ETF Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col items-stretch gap-6">
          <EtfSummaryCard data={data?.etf} isLoading={isLoading} />
          <MyPortfolioCard
            currentPrice={data?.etf?.price}
            isLoading={isLoading}
            quantity={quantity}
            avgPrice={avgPrice}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <PortfolioInput
            quantity={quantity}
            setQuantity={setQuantity}
            avgPrice={avgPrice}
            setAvgPrice={setAvgPrice}
          />

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 flex items-center justify-between hover:bg-slate-900/50 transition-colors cursor-help">
            <span className="text-xs text-slate-400">차트 동기화</span>
            <div className="w-8 h-4 bg-green-500/20 rounded-full flex items-center px-1">
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Stock Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black tracking-tight underline decoration-blue-500/40 decoration-4 underline-offset-8">구성 종목 현황</h3>
            <span className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 uppercase tracking-tighter">
              <Activity size={10} />
              {isLiveEnabled ? '스트리밍' : '스냅샷'}
            </span>
          </div>
        </div>
        <StockTable stocks={data?.stocks || []} isLoading={isLoading} />
      </section>

      <footer className="pt-20 pb-12 flex flex-col items-center gap-4 text-slate-600 border-t border-slate-900/50">
        <p className="text-[12px] font-bold tracking-[0.1em]">
          &copy; 2026 KODEX200 HTS CopyRight by Aufemir.
        </p>
      </footer>
    </main>
  );
}
