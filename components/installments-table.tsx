'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

// This type is manually created based on the expected data structure from the server.
// It's a good practice to have this to ensure type safety in the client component.
export type InstallmentData = {
  id: string;
  amount: string; // Decimals are passed as strings
  dueDate: string; // Dates are passed as strings
  status: string;
  contract: {
    client: {
      name: string;
    };
    unit: {
      code: string;
    };
  };
};

export const columns: ColumnDef<InstallmentData>[] = [
  {
    accessorKey: 'contract.client.name',
    header: 'اسم العميل',
  },
  {
    accessorKey: 'contract.unit.code',
    header: 'كود الوحدة',
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          المبلغ
          <span className="ml-2 h-4 w-4">↕️</span>
        </Button>
      );
    },
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("ar-EG", {
          style: "currency",
          currency: "EGP", // Assuming EGP, change if needed
        }).format(amount)

        return <div className="text-right font-medium">{formatted}</div>
      },
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            تاريخ الاستحقاق
            <span className="ml-2 h-4 w-4">↕️</span>
          </Button>
        );
      },
    cell: ({ row }) => new Date(row.getValue('dueDate')).toLocaleDateString('ar-EG'),
  },
  {
    accessorKey: 'status',
    header: 'الحالة',
  },
];

interface InstallmentsTableProps {
  data: InstallmentData[];
}

export function InstallmentsTable({ data }: InstallmentsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div>
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead key={header.id}>
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                            )}
                    </TableHead>
                    );
                })}
                </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                >
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    لا توجد نتائج.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            >
            السابق
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            >
            التالي
            </Button>
      </div>
    </div>
  );
}
