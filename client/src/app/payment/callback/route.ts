import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Razorpay embedded checkout
    const formData = await request.formData();

    const razorpay_payment_id = formData.get('razorpay_payment_id') as string;
    const razorpay_order_id = formData.get('razorpay_order_id') as string;
    const razorpay_signature = formData.get('razorpay_signature') as string;

    // Check if this is an error callback
    const error_code = formData.get('error[code]') as string;
    const error_description = formData.get('error[description]') as string;
    const error_reason = formData.get('error[reason]') as string;

    if (error_code || error_description) {
      // Payment failed, redirect to cancel page with error info
      const cancelUrl = new URL('/payment/cancel', request.url);
      cancelUrl.searchParams.set('error_code', error_code || 'PAYMENT_FAILED');
      cancelUrl.searchParams.set('error_description', error_description || 'Payment failed');
      cancelUrl.searchParams.set('error_reason', error_reason || 'Unknown error');

      return NextResponse.redirect(cancelUrl);
    }

    // Payment successful, redirect to callback page with query params
    const callbackUrl = new URL('/payment/verify', request.url);
    callbackUrl.searchParams.set('razorpay_payment_id', razorpay_payment_id);
    callbackUrl.searchParams.set('razorpay_order_id', razorpay_order_id);
    callbackUrl.searchParams.set('razorpay_signature', razorpay_signature);

    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error('Payment callback error:', error);

    // Redirect to cancel page on error
    const cancelUrl = new URL('/payment/cancel', request.url);
    cancelUrl.searchParams.set('error_description', 'Invalid payment callback');

    return NextResponse.redirect(cancelUrl);
  }
}

// Handle GET requests by redirecting to home
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url));
}
