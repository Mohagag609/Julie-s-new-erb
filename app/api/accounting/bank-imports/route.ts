import { NextResponse } from 'next/server';
import { z } from 'zod';
import { matchBankCredits } from '@/lib/bank';
import { prisma } from '@/lib/prisma';

const ImportSchema = z.object({
  date: z.string().pipe(z.coerce.date()),
  amount: z.number(),
  type: z.enum(['debit', 'credit']),
  reference: z.string().optional(),
  bankName: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  try {
    // --- Match Mode ---
    if (mode === 'match') {
      const results = await matchBankCredits();
      return NextResponse.json({
        message: 'Bank import matching process completed.',
        ...results,
      });
    }

    // --- Import Mode (default) ---
    const json = await request.json();
    const data = ImportSchema.parse(json);

    const bankImport = await prisma.bankImport.create({
      data: {
        date: data.date,
        amount: data.amount,
        type: data.type,
        reference: data.reference,
        bankName: data.bankName,
        description: data.description,
      },
    });

    return NextResponse.json(bankImport);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Bank import operation failed', details: errorMessage }, { status: 500 });
  }
}
