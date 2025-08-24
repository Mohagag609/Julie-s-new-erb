import { prisma } from './prisma';
import Decimal from 'decimal.js';
import { z } from 'zod';

// --- Zod Schemas for Validation ---
const JournalLineSchema = z.object({
  accountId: z.string(),
  debit: z.number().or(z.string()).pipe(z.coerce.decimal()),
  credit: z.number().or(z.string()).pipe(z.coerce.decimal()),
}).refine(data => !(data.debit.isPositive() && data.credit.isPositive()), {
  message: 'A line cannot have both debit and credit.',
}).refine(data => !data.debit.isNegative() && !data.credit.isNegative(), {
    message: 'Debit and credit must not be negative.',
});

const PostJournalSchema = z.object({
  date: z.date(),
  description: z.string(),
  ref: z.string().optional(),
  lines: z.array(JournalLineSchema).min(2),
});

// --- Service Functions ---

/**
 * Posts a new journal entry, ensuring it is balanced.
 */
export async function postJournal(input: z.infer<typeof PostJournalSchema>) {
  const { date, description, ref, lines } = PostJournalSchema.parse(input);

  const totalDebits = lines.reduce((sum, line) => sum.plus(line.debit), new Decimal(0));
  const totalCredits = lines.reduce((sum, line) => sum.plus(line.credit), new Decimal(0));

  if (!totalDebits.equals(totalCredits)) {
    throw new Error('Journal entry is not balanced.');
  }
  if (totalDebits.isZero()) {
      throw new Error('Journal entry must have a non-zero amount.')
  }

  const entry = await prisma.journalEntry.create({
    data: {
      date,
      description,
      ref,
      lines: {
        create: lines.map(line => ({
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
        })),
      },
    },
    include: { lines: true },
  });

  return entry;
}

/**
 * Creates a receipt voucher and its corresponding journal entry.
 * A receipt debits a cashbox and credits another account (e.g., Accounts Receivable).
 */
export async function createVoucherReceipt(data: {
  date: Date;
  cashboxId: string;
  creditAccountId: string;
  amount: Decimal;
  note?: string;
}) {
    const cashbox = await prisma.cashbox.findUniqueOrThrow({ where: { id: data.cashboxId } });
    const amount = new Decimal(data.amount);

    if (amount.isNegative() || amount.isZero()) {
        throw new Error('Voucher amount must be positive.');
    }

    const journalEntry = await postJournal({
        date: data.date,
        description: `سند قبض - ${data.note || 'بدون تفاصيل'}`,
        lines: [
            { accountId: cashbox.accountId, debit: amount, credit: new Decimal(0) }, // Debit cashbox
            { accountId: data.creditAccountId, debit: new Decimal(0), credit: amount }, // Credit the other account
        ]
    });

    const voucher = await prisma.voucher.create({
        data: {
            kind: 'receipt',
            date: data.date,
            amount: amount,
            note: data.note,
            cashboxId: data.cashboxId,
            journalEntryId: journalEntry.id,
        }
    });

    return { voucher, journalEntry };
}

/**
 * Creates a payment voucher and its corresponding journal entry.
 * A payment credits a cashbox and debits another account (e.g., an expense account).
 */
export async function createVoucherPayment(data: {
  date: Date;
  cashboxId: string;
  debitAccountId: string;
  amount: Decimal;
  note?: string;
}) {
    const cashbox = await prisma.cashbox.findUniqueOrThrow({ where: { id: data.cashboxId } });
    const amount = new Decimal(data.amount);

    if (amount.isNegative() || amount.isZero()) {
        throw new Error('Voucher amount must be positive.');
    }

    const journalEntry = await postJournal({
        date: data.date,
        description: `سند صرف - ${data.note || 'بدون تفاصيل'}`,
        lines: [
            { accountId: data.debitAccountId, debit: amount, credit: new Decimal(0) }, // Debit the other account
            { accountId: cashbox.accountId, debit: new Decimal(0), credit: amount }, // Credit cashbox
        ]
    });

    const voucher = await prisma.voucher.create({
        data: {
            kind: 'payment',
            date: data.date,
            amount: amount,
            note: data.note,
            cashboxId: data.cashboxId,
            journalEntryId: journalEntry.id,
        }
    });

    return { voucher, journalEntry };
}


/**
 * Creates a transfer between two cashboxes and its corresponding journal entry.
 */
export async function createCashTransfer(data: {
  date: Date;
  fromCashboxId: string;
  toCashboxId: string;
  amount: Decimal;
  note?: string;
}) {
    if (data.fromCashboxId === data.toCashboxId) {
        throw new Error('Cannot transfer to the same cashbox.');
    }
    const amount = new Decimal(data.amount);
    if (amount.isNegative() || amount.isZero()) {
        throw new Error('Transfer amount must be positive.');
    }

    const fromCashbox = await prisma.cashbox.findUniqueOrThrow({ where: { id: data.fromCashboxId }});
    const toCashbox = await prisma.cashbox.findUniqueOrThrow({ where: { id: data.toCashboxId }});

    const journalEntry = await postJournal({
        date: data.date,
        description: `تحويل من ${fromCashbox.name} إلى ${toCashbox.name} - ${data.note || ''}`,
        lines: [
            { accountId: toCashbox.accountId, debit: amount, credit: new Decimal(0) }, // Debit destination
            { accountId: fromCashbox.accountId, debit: new Decimal(0), credit: amount }, // Credit source
        ]
    });

    const transfer = await prisma.transfer.create({
        data: {
            date: data.date,
            amount: amount,
            note: data.note,
            fromCashboxId: data.fromCashboxId,
            toCashboxId: data.toCashboxId,
            journalEntryId: journalEntry.id,
        }
    });

    return { transfer, journalEntry };
}
