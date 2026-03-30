const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const history = await prisma.dailyHistory.findMany({ orderBy: { date: 'asc' } });
  console.log("Total entries:", history.length);
  if (history.length > 0) {
    console.log("First date:", history[0].date);
    console.log("Last date:", history[history.length - 1].date);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
