import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createVoucherReceipt, createVoucherPayment } from '@/lib/accounting';
import { prisma } from '@/lib/prisma';
import Decimal from 'decimal.js';

const VoucherSchema = z.object({
  kind: z.enum(['receipt', 'payment']),
  date: z.string().pipe(z.coerce.date()),
  cashboxId: z.string(),
  accountId: z.string(), // The other account (credit for receipt, debit for payment)
  amount: z.number().positive(),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = VoucherSchema.parse(json);

    // Verify accounts exist
    await Promise.all([
        prisma.cashbox.findUniqueOrThrow({ where: { id: data.cashboxId } }),
        prisma.account.findUniqueOrThrow({ where: { id: data.accountId } }),
    ]);

    let result;
    if (data.kind === 'receipt') {
      result = await createVoucherReceipt({
        date: data.date,
        cashboxId: data.cashboxId,
        creditAccountId: data.accountId,
        amount: new Decimal(data.amount),
        note: data.note,
      });
    } else { // payment
      result = await createVoucherPayment({
        date: data.date,
        cashboxId: data.cashboxId,
        debitAccountId: data.accountId,
        amount: new Decimal(data.amount),
        note: data.note,
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    // Default error
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to create voucher', details: errorMessage }, { status: 500 });
  }
}
