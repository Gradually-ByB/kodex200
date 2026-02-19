import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const portfolio = await prisma.portfolio.findUnique({
            where: { id: 'default' },
        });

        if (!portfolio) {
            // Return default values if not found
            return NextResponse.json({
                kodexQuantity: 27,
                kodexAvgPrice: 76573,
                kodexPrincipal: 27 * 76573,
                tigerQuantity: 0,
                tigerAvgPrice: 0,
                tigerPrincipal: 0,
            });
        }

        return NextResponse.json(portfolio);
    } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            kodexQuantity,
            kodexAvgPrice,
            kodexPrincipal,
            tigerQuantity,
            tigerAvgPrice,
            tigerPrincipal,
        } = body;

        const portfolio = await prisma.portfolio.upsert({
            where: { id: 'default' },
            update: {
                kodexQuantity,
                kodexAvgPrice,
                kodexPrincipal,
                tigerQuantity,
                tigerAvgPrice,
                tigerPrincipal,
            },
            create: {
                id: 'default',
                kodexQuantity,
                kodexAvgPrice,
                kodexPrincipal,
                tigerQuantity,
                tigerAvgPrice,
                tigerPrincipal,
            },
        });

        return NextResponse.json(portfolio);
    } catch (error) {
        console.error('Failed to update portfolio:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
