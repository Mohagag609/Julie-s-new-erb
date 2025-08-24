import { prisma } from '@/lib/prisma';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardPage = async () => {
  let counts = {
    clients: 0,
    units: 0,
    contracts: 0,
    installments: 0,
  };
  let error = null;

  try {
    const [clients, units, contracts, installments] = await Promise.all([
      prisma.client.count(),
      prisma.unit.count(),
      prisma.contract.count(),
      prisma.installment.count(),
    ]);
    counts = { clients, units, contracts, installments };
  } catch (e: any) {
    console.error("Failed to fetch dashboard counts:", e);
    error = "فشلت عملية جلب البيانات من قاعدة البيانات. يرجى التأكد من أن الخادم يعمل وأن `DATABASE_URL` صحيح.";
    // Render with 0 counts if the database fails
  }

  const kpiCards = [
    { title: 'العملاء', value: counts.clients },
    { title: 'الوحدات المتاحة', value: counts.units },
    { title: 'العقود', value: counts.contracts },
    { title: 'الأقساط', value: counts.installments },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم الرئيسية</h1>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive font-semibold">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {/* You can add an icon here e.g. <Users className="h-4 w-4 text-muted-foreground" /> */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

       {/* Seed data note */}
       {!error && counts.clients === 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p><strong>ملاحظة:</strong> البيانات المعروضة هي صفر. قد يكون هذا بسبب عدم تشغيل عملية تعبئة البيانات الأولية. يمكن تشغيلها عبر زيارة <a href="/api/seed" className="font-bold hover:underline">مسار التعبئة</a>.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
