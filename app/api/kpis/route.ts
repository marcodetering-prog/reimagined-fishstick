import { NextRequest, NextResponse } from 'next/server';
import { calculateKPIs, cacheKPISnapshot } from '@/lib/kpi-calculator';

export async function GET(request: NextRequest) {
  console.log('[API/KPIs] GET request received');
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const clientId = searchParams.get('clientId');

    let dateRange = undefined;

    if (startDateStr && endDateStr) {
      dateRange = {
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
      };
      console.log('[API/KPIs] Date range:', dateRange);
    } else {
      console.log('[API/KPIs] No date range specified, using all data');
    }

    if (clientId) {
      console.log('[API/KPIs] Filtering by client:', clientId);
    }

    console.log('[API/KPIs] Calculating KPIs...');
    const kpis = await calculateKPIs(dateRange, clientId || undefined);
    console.log('[API/KPIs] ✅ KPIs calculated:', {
      totalConversations: kpis.totalConversations,
      totalMessages: kpis.totalMessages,
      activeTenants: kpis.activeTenants
    });

    // Cache the KPI snapshot if date range is provided
    if (dateRange) {
      console.log('[API/KPIs] Caching KPI snapshot...');
      await cacheKPISnapshot(dateRange, kpis);
    }

    return NextResponse.json(kpis);
  } catch (error) {
    console.error('[API/KPIs] ❌ KPI calculation error:', error);
    console.error('[API/KPIs] Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('[API/KPIs] Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
