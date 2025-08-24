import { prisma } from './prisma';
import Decimal from 'decimal.js';

interface MatchOptions {
  toleranceDays?: number;
  toleranceAmt?: number;
}

/**
 * Attempts to match unprocessed bank credit imports with pending installments.
 */
export async function matchBankCredits(options: MatchOptions = {}) {
  const { toleranceDays = 7, toleranceAmt = 5 } = options;

  const unmatchedCredits = await prisma.bankImport.findMany({
    where: {
      posted: false,
      type: 'credit',
    },
  });

  let matchedCount = 0;
  const ambiguousMatches = [];

  for (const credit of unmatchedCredits) {
    const creditAmount = new Decimal(credit.amount);
    const minAmount = creditAmount.minus(toleranceAmt);
    const maxAmount = creditAmount.plus(toleranceAmt);

    const creditDate = new Date(credit.date);
    const minDate = new Date(creditDate);
    minDate.setDate(creditDate.getDate() - toleranceDays);
    const maxDate = new Date(creditDate);
    maxDate.setDate(creditDate.getDate() + toleranceDays);

    const potentialInstallments = await prisma.installment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: minDate,
          lte: maxDate,
        },
        amount: {
          gte: minAmount,
          lte: maxAmount,
        },
      },
    });

    if (potentialInstallments.length === 1) {
      const installment = potentialInstallments[0];
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Update the installment
          await tx.installment.update({
            where: { id: installment.id },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });

          // 2. Update the bank import record
          await tx.bankImport.update({
            where: { id: credit.id },
            data: {
              posted: true,
              matchedInstallmentId: installment.id,
            },
          });
        });
        matchedCount++;
      } catch (error) {
        console.error(`Transaction failed for credit ${credit.id} and installment ${installment.id}`, error);
      }
    } else {
        if (potentialInstallments.length > 1) {
            ambiguousMatches.push({
                creditId: credit.id,
                potentialInstallmentIds: potentialInstallments.map(p => p.id)
            });
        }
    }
  }

  return {
    processedCredits: unmatchedCredits.length,
    matchedCount,
    ambiguousMatches,
  };
}
