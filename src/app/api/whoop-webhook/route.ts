import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received Webhook:', body);

    return NextResponse.json({ success: true, received: body });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }
}
