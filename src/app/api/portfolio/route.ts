import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function syncHistoricalData() {
  try {
    const portfolio = await prisma.portfolio.findFirst();
    if (!portfolio) return;

    // Fetch historical data directly from Naver for stability
    const symbol = "069500"; // KODEX 200
    const chartRes = await axios.get(
      `https://api.stock.naver.com/chart/domestic/item/${symbol}?periodType=month&count=100`,
      {
        headers: {
          Referer: "https://fin.naver.com/",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );
    
    const priceInfos = chartRes.data.priceInfos || [];
    const historyData = priceInfos.map((item: any) => {
      const rawDate = item.localDate || item.localDateTime?.substring(0, 8);
      const formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
      return {
        time: formattedDate,
        close: item.closePrice || item.currentPrice,
      };
    });

    if (!Array.isArray(historyData)) return;

    // Get existing history to avoid unnecessary writes
    const existingHistory = await prisma.dailyHistory.findMany({
      orderBy: { date: "desc" },
      take: 50,
    });
    const existingDates = new Set(
      existingHistory.map((h) => h.date.toISOString().split("T")[0])
    );

    const operations = [];

    // Iterate through historical data and backfill missing or suspicious entries
    const recentHistory = historyData.slice(-14);
    
    for (let i = 0; i < recentHistory.length; i++) {
      const item = recentHistory[i];
      const dateStr = item.time;
      const currentPrice = item.close;
      
      const prevItem = i > 0 ? recentHistory[i-1] : null;
      const prevPrice = prevItem ? prevItem.close : currentPrice;

      const needsUpdate = !existingDates.has(dateStr);
      const existingEntry = existingHistory.find(h => h.date.toISOString().split("T")[0] === dateStr);
      const suspicious = existingEntry && existingEntry.currentPrice !== currentPrice;

      if (needsUpdate || suspicious) {
        const totalValuation = currentPrice * portfolio.quantity;
        const dailyProfit = (currentPrice - prevPrice) * portfolio.quantity;
        const totalPrincipal = portfolio.totalPrincipal;
        const returnRate = totalPrincipal > 0 ? ((totalValuation - totalPrincipal) / totalPrincipal) * 100 : 0;

        operations.push(
          prisma.dailyHistory.upsert({
            where: { date: new Date(dateStr) },
            update: {
              avgPrice: portfolio.avgPrice,
              currentPrice,
              dailyProfit,
              returnRate,
              totalValuation,
            },
            create: {
              date: new Date(dateStr),
              avgPrice: portfolio.avgPrice,
              currentPrice,
              dailyProfit,
              returnRate,
              totalValuation,
            },
          })
        );
      }
    }

    if (operations.length > 0) {
      console.log(`[Sync] Updated ${operations.length} historical entries.`);
      await prisma.$transaction(operations);
    }
  } catch (error) {
    console.error("Historical sync failed:", error);
  }
}

export async function GET() {
  try {
    // Perform a background sync to ensure data consistency
    await syncHistoricalData();

    const [portfolio, history] = await Promise.all([
      prisma.portfolio.findFirst(),
      prisma.dailyHistory.findMany({
        orderBy: { date: "desc" },
        take: 100,
      }),
    ]);
    return NextResponse.json({ portfolio, history });
  } catch (error) {
    console.error("Failed to fetch portfolio data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quantity, avgPrice, totalPrincipal, historyItem } = body;

    const operations = [];

    if (quantity !== undefined) {
      const current = await prisma.portfolio.findFirst();
      if (current) {
        operations.push(
          prisma.portfolio.update({
            where: { id: current.id },
            data: { quantity, avgPrice, totalPrincipal },
          }),
        );
      } else {
        operations.push(
          prisma.portfolio.create({
            data: { quantity, avgPrice, totalPrincipal },
          }),
        );
      }
    }

    if (historyItem) {
      operations.push(
        prisma.dailyHistory.upsert({
          where: { date: new Date(historyItem.date) },
          update: {
            avgPrice: historyItem.avgPrice,
            currentPrice: historyItem.currentPrice,
            dailyProfit: historyItem.dailyProfit,
            returnRate: historyItem.returnRate,
            totalValuation: historyItem.totalValuation,
          },
          create: {
            date: new Date(historyItem.date),
            avgPrice: historyItem.avgPrice,
            currentPrice: historyItem.currentPrice,
            dailyProfit: historyItem.dailyProfit,
            returnRate: historyItem.returnRate,
            totalValuation: historyItem.totalValuation,
          },
        }),
      );
    }

    await prisma.$transaction(operations as any);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save portfolio data:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
