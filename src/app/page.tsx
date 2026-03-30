import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let portfolio = null;
  let history: any[] = [];
  try {
    const [p, h] = await Promise.all([
      prisma.portfolio.findFirst(),
      prisma.dailyHistory.findMany({
        orderBy: { date: "desc" },
        take: 100,
      }),
    ]);
    portfolio = p;
    history = h;
  } catch (error) {
    console.error("Failed to fetch initial portfolio data:", error);
  }

  // Next.js client boundary serialization handles most things,
  // but let's JSON stringify Dates to match previous axios behavior exactly.
  const serializedPortfolio = portfolio ? JSON.parse(JSON.stringify(portfolio)) : null;
  const serializedHistory = history ? JSON.parse(JSON.stringify(history)) : [];

  return (
    <HomeClient 
      initialPortfolio={serializedPortfolio} 
      initialHistory={serializedHistory} 
    />
  );
}
