import { NextResponse } from 'next/server';
import { loadKodexComponents } from '@/lib/loadKodexComponents';
import { Quote } from '@/types/stock';
import { isMarketOpen } from '@/lib/marketHours';

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

        const baseEtfPrice = 81860;
        let etfPrice = baseEtfPrice;
        if (isLiveMode) {
            if (!simulatedOffsets['KODEX200']) simulatedOffsets['KODEX200'] = 0;
            simulatedOffsets['KODEX200'] += (Math.random() - 0.5) * 15;
            etfPrice = Math.round(baseEtfPrice + simulatedOffsets['KODEX200']);
        }

        const etfPrevPrice = 81975;
        const etfChangeAmount = etfPrice - etfPrevPrice;
        const etfChangeRate = parseFloat(((etfChangeAmount / etfPrevPrice) * 100).toFixed(2));

        return NextResponse.json({
            etf: {
                price: etfPrice,
                changeRate: etfChangeRate,
                changeAmount: etfChangeAmount,
            },
            stocks: mergedData,
            marketStatus: marketOpen ? 'OPEN' : 'CLOSED',
        });
    } catch (error) {
        console.error('Failed to fetch quotes:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
