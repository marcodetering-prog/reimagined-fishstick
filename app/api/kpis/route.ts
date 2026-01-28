import { NextRequest, NextResponse } from 'next/server';
import { calculateKPIs, cacheKPISnapshot } from '@/lib/kpi-calculator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    let dateRange = undefined;

    if (startDateStr && endDateStr) {
      dateRange = {
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
      };
    }

    const kpis = await calculateKPIs(dateRange);

    // Cache the KPI snapshot if date range is provided
    if (dateRange) {
      await cacheKPISnapshot(dateRange, kpis);
    }

    return NextResponse.json(kpis);
  } catch (error) {
    console.error('KPI calculation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
