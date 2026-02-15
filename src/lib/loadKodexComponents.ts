import fs from 'fs';
import path from 'path';
import { Stock } from '@/types/stock';

export async function loadKodexComponents(): Promise<Stock[]> {
    const filePath = path.join(process.cwd(), 'data', 'kodex200.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Normalize 종목코드 to 6-digit string
    return data.map((item: any) => ({
        ...item,
        종목코드: String(item.종목코드).padStart(6, '0')
    }));
}
