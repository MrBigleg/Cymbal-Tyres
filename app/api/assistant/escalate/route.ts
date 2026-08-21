import { NextRequest, NextResponse } from 'next/server';
import { eventPublisher } from '@/lib/services/mockCommerceService';
import { SEED_STORES } from '@/lib/data/seedData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ticketId,
      customerName,
      customerPhone,
      customerEmail,
      vehicleReg,
      query,
      storeId = 'birmingham',
      reason = 'Customer requested human technician verification',
    } = body;

    const store = SEED_STORES.find((s) => s.id === storeId) || SEED_STORES[0];

    const escalationTicket = {
      ticketId: ticketId || `HITL-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'ASSIGNED_TO_TECHNICIAN',
      technician: {
        name: 'Dave Henderson',
        role: 'Master Wheel & Alignment Specialist',
        store: store.name,
        phoneDirect: store.phone,
      },
      customer: {
        name: customerName || 'Valued Driver',
        phone: customerPhone || 'Not provided',
        email: customerEmail || 'driver@example.co.uk',
        vehicleReg: vehicleReg || 'DVLA Match Pending',
      },
      query,
      reason,
      estimatedWaitTime: '3–5 minutes',
    };

    // Emit event to live bus
    await eventPublisher.publish({
      eventId: `evt_hitl_${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'assistant.human_escalation.dispatched',
      payload: escalationTicket,
    });

    return NextResponse.json({
      success: true,
      ticket: escalationTicket,
      message: `Your request has been routed to Dave Henderson (Master Tech at ${store.city}). They will review your fitment specs shortly.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch human escalation' },
      { status: 500 }
    );
  }
}
