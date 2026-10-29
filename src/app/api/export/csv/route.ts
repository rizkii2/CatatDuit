import { NextResponse } from 'next/server';
import { exportTransactionsCSVAction } from '@/actions/export';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const result = await exportTransactionsCSVAction(startDate, endDate);

  if (!result.success || !result.data) {
    return NextResponse.json(
      { error: result.error || 'Gagal mengekspor data transaksi' },
      { status: 400 }
    );
  }

  const { csv, filename } = result.data;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

