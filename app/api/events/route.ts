import { NextRequest, NextResponse } from 'next/server';
import { eventPublisher } from '@/lib/services/mockCommerceService';

/**
 * SERVER EVENT QUERY & DISPATCH ENDPOINT
 *
 * Used by internal tools or external monitor dashboards to query recent domain events.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const events = await eventPublisher.getEvents(limit);

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.eventType) {
      return NextResponse.json({ error: 'Missing eventType' }, { status: 400 });
    }

    const event = {
      eventId: body.eventId || body.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType: body.eventType,
      payload: body.payload || body.data || {},
    };

    await eventPublisher.publish(event);

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to publish event' },
      { status: 500 }
    );
  }
}
