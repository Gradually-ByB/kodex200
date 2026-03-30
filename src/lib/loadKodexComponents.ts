import fs from "fs";
import path from "path";
import { Stock } from "@/types/stock";

let cachedComponents: Stock[] | null = null;

export async function loadKodexComponents(): Promise<Stock[]> {
  if (cachedComponents) return cachedComponents;

  const filePath = path.join(process.cwd(), "data", "kodex200.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(fileContent);

  // Normalize 종목코드 to 6-digit string
  cachedComponents = data.map((item: any) => ({
    ...item,
    종목코드: String(item.종목코드).padStart(6, "0"),
  }));

  return cachedComponents as Stock[];
}
