import { NextRequest, NextResponse } from 'next/server';

/**
 * UCP INBOUND WEBHOOK HANDLER
 *
 * Receives external webhooks from Google ADK Agents, Supplier WMS,
 * payment gateways (AP2), and ERP inventory sync systems.
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-ucp-signature');
    const event = await req.json();

    console.log('[UCP Webhook Received]:', event.type || event.eventType, event);

    // Validate webhook payload
    if (!event || (!event.type && !event.eventType)) {
      return NextResponse.json(
        { error: 'Invalid webhook payload structure' },
        { status: 400 }
      );
    }

    // Process specific event types
    switch (event.type || event.eventType) {
      case 'inventory.replenished':
        console.log('Stock replenishment notification for product:', event.productId);
        break;

      case 'commerce.purchase_intent.fulfilled':
        console.log('Autonomous purchase intent fulfilled for order:', event.orderId);
        break;

      case 'commerce.checkout.recovered':
        console.log('Checkout recovery applied for session:', event.checkoutId);
        break;

      default:
        console.log('Generic UCP event processed:', event.type || event.eventType);
    }

    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      eventId: event.id || `evt_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('Error processing UCP webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}
