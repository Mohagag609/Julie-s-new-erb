import { NextResponse } from 'next/server';
import { runLocalBackup } from '@/lib/backup';

export async function POST() {
  // Optional: Add some security here in a real app, e.g., check for a secret key
  // if (request.headers.get('Authorization') !== `Bearer ${process.env.BACKUP_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const result = await runLocalBackup();
    return NextResponse.json({
      message: 'Backup process completed successfully.',
      ...result
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Backup process failed', details: errorMessage }, { status: 500 });
  }
}
