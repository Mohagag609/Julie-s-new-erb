import { NextResponse } from 'next/server';
import { buildInstallmentsPdf } from '@/lib/reporting';

export async function GET() {
  try {
    const pdfBuffer = await buildInstallmentsPdf();
    const uint8Array = new Uint8Array(pdfBuffer);
    const blob = new Blob([uint8Array], { type: 'application/pdf' });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="installments_report.pdf"',
      },
    });

  } catch (error) {
    console.error('Failed to generate PDF report:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to generate PDF report', details: errorMessage }, { status: 500 });
  }
}
