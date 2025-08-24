import { NextResponse } from 'next/server';
import { buildBankExcel } from '@/lib/reporting';

export async function GET() {
  try {
    const excelBuffer = await buildBankExcel();
    const uint8Array = new Uint8Array(excelBuffer);
    const blob = new Blob([uint8Array]);

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="bank_imports_report.xlsx"',
      },
    });

  } catch (error) {
    console.error('Failed to generate Excel report:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to generate Excel report', details: errorMessage }, { status: 500 });
  }
}
