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
let simulatedVolumes: Record<string, number> = {};

const NAVER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://stock.naver.com/'
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isLiveMode = searchParams.get('live') === 'true';
    const marketOpen = isMarketOpen();

    try {
        const components = await loadKodexComponents();
        const stockCodes = components.map(s => s.종목코드);

        // Ensure KODEX 200 and TIGER 200 ETF codes are included for the main cards
        const etfCode = '069500'; // KODEX 200
        const tigerCode = '102110'; // TIGER 200
        const allCodesForPolling = Array.from(new Set([...stockCodes, etfCode, tigerCode]));

        // 1. Fetch Indices
        const fetchIndices = axios.get('https://stock.naver.com/api/polling/domestic/index?itemCodes=KOSPI,KOSDAQ,KPI200,KOSDAQ150', { headers: NAVER_HEADERS })
            .catch(err => { console.error('Indices Fetch Error:', err.response?.status, err.response?.data); return { data: { datas: [] } }; });

        // 2. Fetch Indicators
        const fetchIndicators = axios.get('https://stock.naver.com/api/securityService/integration/indicators?indicatorCodes=FX_USDKRW', { headers: NAVER_HEADERS })
            .catch(err => { console.error('Indicators Fetch Error:', err.response?.status, err.response?.data); return { data: [] }; });

        // 3. Fetch Stocks in batches of 100
        const batchSize = 100;
        const stockBatches = [];
        for (let i = 0; i < allCodesForPolling.length; i += batchSize) {
            const batch = allCodesForPolling.slice(i, i + batchSize);
            const url = `https://stock.naver.com/api/polling/domestic/stock?itemCodes=${batch.join(',')}`;
            stockBatches.push(axios.get(url, { headers: NAVER_HEADERS })
                .catch(err => { console.error(`Stock Batch ${i} Fetch Error:`, err.response?.status, url); return { data: { datas: [] } }; }));
        }

        const [indexRes, indicatorRes, ...batchResults] = await Promise.all([fetchIndices, fetchIndicators, ...stockBatches]);

        // Process Indices with deep safety and Type Casting
        const indexDatas = (indexRes as any).data?.datas || [];
        const kospiData = indexDatas.find((d: any) => d.itemCode === 'KOSPI');
        const kosdaqData = indexDatas.find((d: any) => d.itemCode === 'KOSDAQ');
        const kosdaq150Data = indexDatas.find((d: any) => d.itemCode === 'KOSDAQ150');
        const kpi200 = indexDatas.find((d: any) => d.itemCode === 'KPI200');

        const kpi200ValueRaw = Number(kpi200?.closePriceRaw || 340.0);

        // Process Indicators (USD/KRW)
        const indicatorDatas = (indicatorRes as any).data || [];
        const usdKrwData = Array.isArray(indicatorDatas) ? indicatorDatas.find((d: any) => d.itemCode === 'FX_USDKRW') : null;

        // Process Stocks
        const naverStockMap: Record<string, any> = {};
        batchResults.forEach(res => {
            const stocks = (res as any).data?.datas || [];
            stocks.forEach((s: any) => {
                naverStockMap[s.itemCode] = s;
            });
        });

        // Update Component Data
        const quotes: Quote[] = components.map(stock => {
            const naverData = naverStockMap[stock.종목코드];
            let price = Number(naverData?.closePriceRaw) || parsePrice(stock["현재가(원)"]);
            let changeAmount = Number(naverData?.compareToPreviousClosePriceRaw) || parseChange(stock["등락(원)"]);
            let changeRate = Number(naverData?.fluctuationsRatioRaw) || 0;
            let volume = Number(naverData?.accumulatedTradingVolumeRaw) || Math.floor(Math.random() * 500000);

            if (isLiveMode) {
                if (!simulatedOffsets[stock.종목코드]) simulatedOffsets[stock.종목코드] = 0;
                if (!simulatedVolumes[stock.종목코드]) simulatedVolumes[stock.종목코드] = volume;

                const move = (Math.random() - 0.5) * 0.0005 * price;
                simulatedOffsets[stock.종목코드] += move;
                price = Math.round(price + simulatedOffsets[stock.종목코드]);
                const prevPrice = (Number(naverData?.closePriceRaw) || price) - (Number(naverData?.compareToPreviousClosePriceRaw) || changeAmount);
                changeAmount = price - prevPrice;
                changeRate = prevPrice !== 0 ? (changeAmount / prevPrice) * 100 : changeRate;

                // Simulate volume increase
                const volumeIncrease = Math.floor(Math.random() * 500); // 0 to 499 shares added
                simulatedVolumes[stock.종목코드] += volumeIncrease;
                volume = simulatedVolumes[stock.종목코드];
            }

            // Ensure we don't have NaN
            if (isNaN(price)) price = 0;
            if (isNaN(changeAmount)) changeAmount = 0;
            if (isNaN(changeRate)) changeRate = 0;
            if (isNaN(volume)) volume = 0;

            return {
                code: stock.종목코드,
                price,
                changeAmount,
                changeRate: parseFloat(Number(changeRate).toFixed(2)),
                volume: volume,
            } as Quote;
        });

        const mergedData = components.map(stock => {
            const quote = quotes.find(q => q.code === stock.종목코드);
            return {
                ...stock,
                ...quote,
            };
        });

        // ETF (KODEX 200) Specific Data
        const etfData = naverStockMap[etfCode];
        let etfPrice = Number(etfData?.closePriceRaw) || Math.round(kpi200ValueRaw * 100);
        let etfChangeAmount = Number(etfData?.compareToPreviousClosePriceRaw) || 0;
        let etfChangeRate = Number(etfData?.fluctuationsRatioRaw) || 0;

        if (isLiveMode) {
            if (!simulatedOffsets['KODEX200']) simulatedOffsets['KODEX200'] = 0;
            simulatedOffsets['KODEX200'] += (Math.random() - 0.5) * 10;
            const refPrice = Number(etfData?.closePriceRaw) || etfPrice;
            etfPrice = Math.round(etfPrice + simulatedOffsets['KODEX200']);
            const prevPrice = refPrice - etfChangeAmount;
            etfChangeAmount = etfPrice - prevPrice;
            etfChangeRate = prevPrice !== 0 ? (etfChangeAmount / prevPrice) * 100 : etfChangeRate;
        }

        if (isNaN(etfPrice)) etfPrice = 33000;
        if (isNaN(etfChangeAmount)) etfChangeAmount = 0;
        if (isNaN(etfChangeRate)) etfChangeRate = 0;

        // ETF (TIGER 200) Specific Data
        const tigerData = naverStockMap[tigerCode];
        let tigerPrice = Number(tigerData?.closePriceRaw) || Math.round(kpi200ValueRaw * 100);
        let tigerChangeAmount = Number(tigerData?.compareToPreviousClosePriceRaw) || 0;
        let tigerChangeRate = Number(tigerData?.fluctuationsRatioRaw) || 0;

        if (isLiveMode) {
            if (!simulatedOffsets['TIGER200']) simulatedOffsets['TIGER200'] = 0;
            simulatedOffsets['TIGER200'] += (Math.random() - 0.5) * 10;
            const refPrice = Number(tigerData?.closePriceRaw) || tigerPrice;
            tigerPrice = Math.round(tigerPrice + simulatedOffsets['TIGER200']);
            const prevPrice = refPrice - tigerChangeAmount;
            tigerChangeAmount = tigerPrice - prevPrice;
            tigerChangeRate = prevPrice !== 0 ? (tigerChangeAmount / prevPrice) * 100 : tigerChangeRate;
        }

        if (isNaN(tigerPrice)) tigerPrice = 33000;
        if (isNaN(tigerChangeAmount)) tigerChangeAmount = 0;
        if (isNaN(tigerChangeRate)) tigerChangeRate = 0;

        return NextResponse.json({
            etf: {
                price: etfPrice,
                changeRate: parseFloat(Number(etfChangeRate).toFixed(2)),
                changeAmount: etfChangeAmount,
            },
            tiger: {
                price: tigerPrice,
                changeRate: parseFloat(Number(tigerChangeRate).toFixed(2)),
                changeAmount: tigerChangeAmount,
            },
            marketIndices: {
                kospi: {
                    value: Number(kospiData?.closePriceRaw) || 2500,
                    change: Number(kospiData?.compareToPreviousClosePriceRaw) || 0,
                    rate: Number(kospiData?.fluctuationsRatioRaw) || 0
                },
                kosdaq: {
                    value: Number(kosdaqData?.closePriceRaw) || 800,
                    change: Number(kosdaqData?.compareToPreviousClosePriceRaw) || 0,
                    rate: Number(kosdaqData?.fluctuationsRatioRaw) || 0
                },
                kosdaq150: {
                    value: Number(kosdaq150Data?.closePriceRaw) || 0,
                    change: Number(kosdaq150Data?.compareToPreviousClosePriceRaw) || 0,
                    rate: Number(kosdaq150Data?.fluctuationsRatioRaw) || 0
                },
                usdKrw: {
                    value: parseFloat(usdKrwData?.currentPrice || '1400'),
                    change: parseFloat(usdKrwData?.fluctuations || '0'),
                    rate: parseFloat(usdKrwData?.fluctuationsRatio || '0')
                }
            },
            stocks: mergedData,
            marketStatus: marketOpen ? 'OPEN' : 'CLOSED',
        });
    } catch (error) {
        console.error('Final catch in /api/quotes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
