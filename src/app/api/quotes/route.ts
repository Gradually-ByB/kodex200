import { NextResponse } from 'next/server';
import { loadKodexComponents } from '@/lib/loadKodexComponents';
import { Quote } from '@/types/stock';
import { isMarketOpen } from '@/lib/marketHours';
import axios from 'axios';

// Function to parse Korean currency strings like "181,200" or number
function parsePrice(val: string | number): number {
    if (typeof val === 'number') return val;
    return parseInt(String(val).replace(/,/g, ''), 10);
}

// Function to parse change amount
function parseChange(val: string | number): number {
    if (typeof val === 'number') return val;
    if (val === '-' || !val) return 0;
    return parseInt(String(val).replace(/,/g, ''), 10);
}

// Global state to store simulated fluctuations during the session
let simulatedOffsets: Record<string, number> = {};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isLiveMode = searchParams.get('live') === 'true';
    const marketOpen = isMarketOpen();

    try {
        const components = await loadKodexComponents();

        const quotes = components.map(stock => {
            let price = parsePrice(stock["현재가(원)"]);
            let changeAmount = parseChange(stock["등락(원)"]);

            // If live mode is on, simulate small fluctuations
            if (isLiveMode) {
                if (!simulatedOffsets[stock.종목코드]) simulatedOffsets[stock.종목코드] = 0;

                // Random walk: move -0.05% to +0.05%
                const move = (Math.random() - 0.5) * 0.001 * price;
                simulatedOffsets[stock.종목코드] += move;

                price = Math.round(price + simulatedOffsets[stock.종목코드]);
                changeAmount = Math.round(changeAmount + simulatedOffsets[stock.종목코드]);
            }

            const prevPrice = price - changeAmount;
            const changeRate = prevPrice !== 0 ? (changeAmount / prevPrice) * 100 : 0;
            const volume = Math.floor(Math.random() * 1000000) + 50000;

            return {
                code: stock.종목코드,
                price,
                changeAmount,
                changeRate: parseFloat(changeRate.toFixed(2)),
                volume,
            } as Quote;
        });

        const mergedData = components.map(stock => {
            const quote = quotes.find(q => q.code === stock.종목코드);
            return {
                ...stock,
                ...quote,
            };
        });

        // Initialize with default values (Feb 13, 2026 constants)
        let kospiValue = 5507.01;
        let kospiChange = -15.26;
        let kospiRate = -0.28;

        let kosdaqValue = 1106.08;
        let kosdaqChange = -19.91;
        let kosdaqRate = -1.77;

        let kpi200Value = 814.59;

        try {
            const naverRes = await axios.get('https://polling.finance.naver.com/api/realtime?query=SERVICE_INDEX:KOSPI,KOSDAQ,KPI200');
            const datas = naverRes.data?.result?.areas?.[0]?.datas;
            if (datas) {
                const kospi = datas.find((d: any) => d.cd === 'KOSPI');
                const kosdaq = datas.find((d: any) => d.cd === 'KOSDAQ');
                const kpi200 = datas.find((d: any) => d.cd === 'KPI200');

                if (kospi) {
                    kospiValue = kospi.nv / 100;
                    kospiChange = kospi.cv / 100;
                    kospiRate = kospi.cr;
                }
                if (kosdaq) {
                    kosdaqValue = kosdaq.nv / 100;
                    kosdaqChange = kosdaq.cv / 100;
                    kosdaqRate = kosdaq.cr;
                }
                if (kpi200) {
                    kpi200Value = kpi200.nv / 100;
                }
            }
        } catch (e) {
            console.error('Failed to fetch real-time indices from Naver:', e);
        }

        let etfPrice = Math.round(kpi200Value * 100);
        if (isLiveMode) {
            if (!simulatedOffsets['KODEX200']) simulatedOffsets['KODEX200'] = 0;
            simulatedOffsets['KODEX200'] += (Math.random() - 0.5) * 15;
            etfPrice = Math.round(etfPrice + simulatedOffsets['KODEX200']);
        }

        const etfPrevPrice = etfPrice - 110; // Simplified simulated prev close
        const etfChangeAmount = etfPrice - etfPrevPrice;
        const etfChangeRate = parseFloat(((etfChangeAmount / etfPrevPrice) * 100).toFixed(2));

        let currentKospi = kospiValue;
        let currentKosdaq = kosdaqValue;

        if (isLiveMode) {
            if (!simulatedOffsets['KOSPI']) simulatedOffsets['KOSPI'] = 0;
            if (!simulatedOffsets['KOSDAQ']) simulatedOffsets['KOSDAQ'] = 0;
            simulatedOffsets['KOSPI'] += (Math.random() - 0.5) * 1.5;
            simulatedOffsets['KOSDAQ'] += (Math.random() - 0.5) * 0.8;
            currentKospi = parseFloat((currentKospi + simulatedOffsets['KOSPI']).toFixed(2));
            currentKosdaq = parseFloat((currentKosdaq + simulatedOffsets['KOSDAQ']).toFixed(2));
        }

        return NextResponse.json({
            etf: {
                price: etfPrice,
                changeRate: etfChangeRate,
                changeAmount: etfChangeAmount,
            },
            marketIndices: {
                kospi: { value: currentKospi, change: kospiChange, rate: kospiRate },
                kosdaq: { value: currentKosdaq, change: kosdaqChange, rate: kosdaqRate }
            },
            stocks: mergedData,
            marketStatus: marketOpen ? 'OPEN' : 'CLOSED',
        });
    } catch (error) {
        console.error('Failed to fetch quotes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
