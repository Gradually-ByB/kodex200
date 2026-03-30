import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [portfolio, history] = await Promise.all([
      prisma.portfolio.findFirst(),
      prisma.dailyHistory.findMany({
        orderBy: { date: "desc" },
        take: 100, // Increased to 100 to show data from February and earlier
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
