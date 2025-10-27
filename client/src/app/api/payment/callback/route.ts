import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const razorpay_payment_id = formData.get('razorpay_payment_id') as string;
    const razorpay_order_id = formData.get('razorpay_order_id') as string;
    const razorpay_signature = formData.get('razorpay_signature') as string;

    console.log('Razorpay callback received:', {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    });

    // Redirect to the verify page with parameters
    const baseUrl = request.nextUrl.origin;
    const url = new URL('/payment/verify', baseUrl);
    url.searchParams.set('razorpay_payment_id', razorpay_payment_id);
    url.searchParams.set('razorpay_order_id', razorpay_order_id);
    url.searchParams.set('razorpay_signature', razorpay_signature);

    return NextResponse.redirect(url, 303);
  } catch (error) {
    console.error('Error processing Razorpay callback:', error);
    const baseUrl = request.nextUrl.origin;
    return NextResponse.redirect(new URL('/payment/cancel', baseUrl), 303);
  }
}
