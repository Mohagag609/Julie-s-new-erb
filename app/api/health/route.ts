import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // A simple query to check if the DB is responsive
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up", timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        error: "Failed to connect to the database.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
