import { prisma } from './prisma';
import { promises as fs } from 'fs';
import path from 'path';

// A custom replacer function for JSON.stringify to handle special types.
function jsonReplacer(key: string, value: any) {
  // Convert Decimal.js objects to strings
  if (value && typeof value === 'object' && value.isDecimal) {
    return value.toString();
  }
  // BigInts are not used in this schema, but this is how you would handle them:
  // if (typeof value === 'bigint') {
  //   return value.toString();
  // }
  return value;
}

/**
 * Fetches all critical data and writes it to a local JSON file.
 */
export async function runLocalBackup() {
  const backupDir = path.join(process.cwd(), 'backups');

  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create backup directory:', error);
    throw new Error('Could not create backup directory.');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(backupDir, filename);

  console.log('Starting database backup...');

  const dataToBackup = {
    // Phase 1
    clients: await prisma.client.findMany(),
    projects: await prisma.project.findMany(),
    units: await prisma.unit.findMany(),
    contracts: await prisma.contract.findMany(),
    installments: await prisma.installment.findMany(),
    // Phase 2
    partners: await prisma.partner.findMany(),
    projectPartners: await prisma.projectPartner.findMany(),
    returns: await prisma.return.findMany(),
    // Phase 3
    accounts: await prisma.account.findMany(),
    cashboxes: await prisma.cashbox.findMany(),
    journalEntries: await prisma.journalEntry.findMany({
      include: { lines: true },
    }),
    vouchers: await prisma.voucher.findMany(),
    transfers: await prisma.transfer.findMany(),
    // Phase 4
    bankImports: await prisma.bankImport.findMany(),
  };

  console.log(`Backing up ${Object.keys(dataToBackup).length} tables to ${filepath}...`);

  const jsonString = JSON.stringify(dataToBackup, jsonReplacer, 2);

  try {
    await fs.writeFile(filepath, jsonString);
    console.log('Backup completed successfully.');
    return { ok: true, file: filepath };
  } catch (error) {
    console.error('Failed to write backup file:', error);
    throw new Error('Could not write backup file.');
  }
}
