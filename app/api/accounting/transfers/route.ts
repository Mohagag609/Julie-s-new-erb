import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCashTransfer } from '@/lib/accounting';
import { prisma } from '@/lib/prisma';

const TransferSchema = z.object({
  date: z.string().pipe(z.coerce.date()),
  fromCashboxId: z.string(),
  toCashboxId: z.string(),
  amount: z.number().positive(),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = TransferSchema.parse(json);

    // The service function will throw an error if IDs are the same.
    // We can also check here for a more specific error message if we want.
    if (data.fromCashboxId === data.toCashboxId) {
        return NextResponse.json({ error: 'Source and destination cashboxes cannot be the same.' }, { status: 400 });
    }

    // Verify cashboxes exist before calling service
    await Promise.all([
        prisma.cashbox.findUniqueOrThrow({ where: { id: data.fromCashboxId } }),
        prisma.cashbox.findUniqueOrThrow({ where: { id: data.toCashboxId } }),
    ]);

    const result = await createCashTransfer({
      date: data.date,
      fromCashboxId: data.fromCashboxId,
      toCashboxId: data.toCashboxId,
      amount: data.amount,
      note: data.note,
    });

    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to create transfer', details: errorMessage }, { status: 500 });
  }
}
