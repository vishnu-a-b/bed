'use client'

import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, Loader } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  let supporterId:any=""
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get('paymentId');
        const PayerID = urlParams.get('PayerID');
        const token = urlParams.get('token'); // This is the order ID from PayPal

        if (!paymentId && !token) {
          setStatus('error');
          setMessage('Missing payment information');
          return;
        }

        // Get stored payment info
        const paymentInfoStr = sessionStorage.getItem('paymentInfo');
        if (!paymentInfoStr) {
          setStatus('error');
          setMessage('Payment session expired');
          return;
        }

        const paymentInfo = JSON.parse(paymentInfoStr);
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        // Verify payment with backend
        const response = await fetch(`${API_URL}/bed-payments/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paypal_order_id: token || paymentInfo.orderId,
            paypal_payment_id: paymentId,
          }),
        });

        const result = await response.json();
        console.log(result)
        if (response.ok && result.success) {
          setStatus('success');
          setMessage('Payment completed successfully!');
          // Clear stored payment info
          sessionStorage.removeItem('paymentInfo');
          supporterId=result.data.payment.supporter._id
        } else {
          throw new Error(result.message || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to verify payment');
      }
    };

    verifyPayment();
  }, []);

  const handleReturnHome = () => {
    window.location.href = `/supporter?supporter=${supporterId}`; // Redirect to home page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Payment
              </h1>
              <p className="text-gray-600 mb-6">
                Please wait while we confirm your payment...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for your generous contribution. Your payment has been processed successfully.
              </p>
              <button
                onClick={handleReturnHome}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
              >
                Return to Home
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = `/supporter?supporter=${supporterId}`}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Try Again
                </button>
                <button
                  onClick={handleReturnHome}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Return to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;