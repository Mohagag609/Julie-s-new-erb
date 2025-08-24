import { prisma } from '@/lib/prisma';
import React from 'react';
import { InstallmentsTable, InstallmentData } from '@/components/installments-table';

async function getInstallments() {
    try {
        const installments = await prisma.installment.findMany({
            take: 100, // Increased take for better pagination testing
            orderBy: {
              dueDate: 'asc',
            },
            include: {
              contract: {
                include: {
                  client: true,
                  unit: true,
                },
              },
            },
          });

        // Serialize data for the client component
        return installments.map(inst => ({
            ...inst,
            amount: inst.amount.toString(),
            dueDate: inst.dueDate.toISOString(),
        })) as InstallmentData[];

    } catch (error) {
        console.error("Failed to fetch installments:", error);
        return [];
    }
}


const InstallmentsPage = async () => {
  const data = await getInstallments();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">عرض الأقساط</h1>
      <InstallmentsTable data={data} />
    </div>
  );
};

export default InstallmentsPage;
