import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || '069500';

    try {
        // Use 'month' period type which returns daily data points for the recent period
        const response = await axios.get(`https://api.stock.naver.com/chart/domestic/item/${symbol}?periodType=month&count=100`, {
            headers: {
                'Referer': 'https://fin.naver.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const priceInfos = response.data.priceInfos || [];

        // Deduplicate and map to lightweight-charts format
        const uniqueDataMap = new Map();
        priceInfos.forEach((item: any) => {
            // Field mapping: month API uses 'localDate' and 'closePrice'
            // whereas intraday API (day) used 'localDateTime' and 'currentPrice'
            const rawDate = item.localDate || item.localDateTime?.substring(0, 8);
            if (!rawDate) return;

            const formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;

            // Avoid duplicate timestamps by using a Map
            uniqueDataMap.set(formattedDate, {
                time: formattedDate,
                open: item.openPrice,
                high: item.highPrice,
                low: item.lowPrice,
                close: item.closePrice || item.currentPrice,
                volume: item.accumulatedTradingVolume
            });
        });

        const chartData = Array.from(uniqueDataMap.values());

        // Strictly sort by time
        chartData.sort((a: any, b: any) => a.time.localeCompare(b.time));

        return NextResponse.json(chartData);
    } catch (error) {
        console.error('Failed to fetch chart data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
