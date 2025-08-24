import { prisma } from './prisma';
import PdfPrinter from 'pdfmake';
import ExcelJS from 'exceljs';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Base64 encoded Amiri font for Arabic support. This is a workaround for environments
// where you cannot place font files in the filesystem.
// Font source: https://fonts.google.com/amiri (SIL Open Font License)
// The full base64 string is omitted for brevity.
const amiriFontBase64 = "AAEAAA...very-long-string...AAA==";

const vfs = {
  "Amiri-Regular.ttf": amiriFontBase64
};

const printer = new PdfPrinter({
  Amiri: {
    normal: 'Amiri-Regular.ttf',
    bold: 'Amiri-Regular.ttf',
    italics: 'Amiri-Regular.ttf',
    bolditalics: 'Amiri-Regular.ttf'
  }
});

// To use the virtual file system, we need to pass it to the printer instance
// We cast to `any` because the type definitions for pdfmake are incomplete and don't include the `vfs` property.
(printer as any).vfs = vfs;


/**
 * Builds a PDF document of the first 100 installments.
 */
export async function buildInstallmentsPdf(): Promise<Uint8Array> {
  const installments = await prisma.installment.findMany({
    take: 100,
    orderBy: { dueDate: 'asc' },
    include: {
      contract: {
        include: {
          client: true,
          unit: true,
        },
      },
    },
  });

  // Function to reverse text for RTL display in pdfmake
  const reverseText = (text: string) => text.split('').reverse().join('');

  const tableBody = [
    [
      { text: reverseText('الحالة'), style: 'tableHeader' },
      { text: reverseText('تاريخ الاستحقاق'), style: 'tableHeader' },
      { text: reverseText('المبلغ'), style: 'tableHeader' },
      { text: reverseText('كود الوحدة'), style: 'tableHeader' },
      { text: reverseText('اسم العميل'), style: 'tableHeader' },
    ]
  ];

  installments.forEach(inst => {
    tableBody.push([
      { text: reverseText(inst.status), style: 'tableCell' },
      { text: new Date(inst.dueDate).toLocaleDateString('ar-EG'), style: 'tableCell' },
      { text: inst.amount.toString(), style: 'tableCell' },
      { text: inst.contract.unit.code, style: 'tableCell' },
      { text: reverseText(inst.contract.client.name), style: 'tableCell' },
    ]);
  });

  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: reverseText('تقرير الأقساط'), style: 'header' },
      { text: reverseText('قائمة بأول 100 قسط مستحق'), style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', '*'],
          body: tableBody,
        },
        layout: 'lightHorizontalLines'
      }
    ],
    defaultStyle: {
      font: 'Amiri',
      alignment: 'right'
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        margin: [0, 0, 0, 15],
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'black',
        fillColor: '#eeeeee',
      },
      tableCell: {
        fontSize: 10
      }
    }
  };

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: any[] = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    pdfDoc.on('error', err => reject(err));
    pdfDoc.end();
  });
}

/**
 * Builds an Excel file of all bank import records.
 */
export async function buildBankExcel(): Promise<Uint8Array> {
    const bankImports = await prisma.bankImport.findMany({
        orderBy: { date: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ERP System';
    workbook.lastModifiedBy = 'ERP System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Bank Imports');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Type', key: 'type', width: 10 },
        { header: 'Reference', key: 'reference', width: 30 },
        { header: 'Description', key: 'description', width: 50 },
        { header: 'Posted', key: 'posted', width: 10 },
    ];

    worksheet.addRows(bankImports.map(b => ({
        ...b,
        amount: b.amount.toNumber(),
        date: new Date(b.date)
    })));

    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer);
}
