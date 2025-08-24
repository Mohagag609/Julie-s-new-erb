import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

export async function GET() {
  // To prevent this from being run in production by accident
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seeding is disabled in production' }, { status: 403 });
  }

  try {
    console.log('Start seeding via API route...');

    // 1. Clean up previous data
    // Phase 3 tables
    await prisma.voucher.deleteMany();
    await prisma.transfer.deleteMany();
    await prisma.journalLine.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.cashbox.deleteMany();
    await prisma.account.deleteMany();
    // Phase 2 tables
    await prisma.projectPartner.deleteMany();
    await prisma.partner.deleteMany();
    await prisma.return.deleteMany();
    // Phase 1 tables
    await prisma.installment.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    console.log('Previous data cleaned.');

    // 2. Create a test client
    const client = await prisma.client.create({
      data: {
        name: 'عميل تجريبي',
        email: 'client@example.com',
        phone: '123456789',
      },
    });

    // 3. Create a project
    const project = await prisma.project.create({
      data: {
        code: 'PRJ-001',
        name: 'مشروع النهضة',
        status: 'active',
        startDate: new Date('2023-01-01'),
      },
    });

    // 4. Create a unit
    const unit = await prisma.unit.create({
      data: {
        code: 'U-101',
        type: 'سكني',
        area: 120,
        price: new Decimal('1500000.00'),
        downPayment: new Decimal('300000.00'),
        status: 'sold',
        projectId: project.id,
        description: 'وحدة سكنية في الطابق الأول',
      },
    });

    // 5. Create a contract
    const contract = await prisma.contract.create({
      data: {
        clientId: client.id,
        unitId: unit.id,
        startDate: new Date(),
        totalAmount: unit.price,
        downPayment: unit.downPayment!,
        months: 24,
        planType: 'MONTHLY',
      },
    });

    // 6. Generate installments
    const totalAmount = new Decimal(contract.totalAmount);
    const downPayment = new Decimal(contract.downPayment);
    const remainingAmount = totalAmount.minus(downPayment);
    const monthlyInstallment = remainingAmount.dividedBy(contract.months).toDecimalPlaces(2);

    const installments = [];
    for (let i = 0; i < contract.months; i++) {
      const dueDate = new Date(contract.startDate);
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      installments.push({
        contractId: contract.id,
        amount: monthlyInstallment,
        dueDate: dueDate,
        status: 'PENDING',
      });
    }

    const totalCalculated = monthlyInstallment.times(contract.months);
    const roundingDifference = remainingAmount.minus(totalCalculated);
    if (roundingDifference.abs().greaterThan(0)) {
        const lastIndex = installments.length - 1;
        installments[lastIndex].amount = new Decimal(installments[lastIndex].amount).plus(roundingDifference).toDecimalPlaces(2);
    }

    await prisma.installment.createMany({
      data: installments,
    });

    // 7. Seed Chart of Accounts
    console.log('Seeding Chart of Accounts...');
    const assetsAccount = await prisma.account.create({
      data: { code: '1000', name: 'الأصول', type: 'asset' },
    });
    const cashAccount = await prisma.account.create({
      data: { code: '1010', name: 'الخزينة الرئيسية', type: 'asset', parentAccountId: assetsAccount.id },
    });
    await prisma.account.create({
      data: { code: '1200', name: 'العملاء', type: 'asset' },
    });
    await prisma.account.create({
      data: { code: '4000', name: 'الإيرادات', type: 'revenue' },
    });

    // 8. Seed Cashbox
    console.log('Seeding Cashbox...');
    await prisma.cashbox.create({
        data: {
            code: 'CASH-1',
            name: 'خزنة الفرع الرئيسي',
            accountId: cashAccount.id
        }
    });

    // 9. Log the seed action
    await prisma.auditLog.create({
      data: {
        action: 'API_SEED',
        entity: 'System',
        entityId: 'SYSTEM',
        meta: {
          details: `Seeded database with 1 client, 1 project, 1 unit, 1 contract, and ${installments.length} installments.`,
        },
      },
    });

    console.log('Seeding finished successfully via API.');
    return NextResponse.json({
      message: 'Database seeded successfully!',
      client: client.name,
      project: project.code,
      unit: unit.code,
      installments_created: installments.length,
    });

  } catch (error: any) {
    console.error('API Seeding failed:', error);
    return NextResponse.json(
      {
        message: 'Failed to seed database.',
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
