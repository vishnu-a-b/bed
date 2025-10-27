"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Verifying your payment...");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const razorpay_payment_id = searchParams.get("razorpay_payment_id");
        const razorpay_order_id = searchParams.get("razorpay_order_id");
        const razorpay_signature = searchParams.get("razorpay_signature");

        console.log("Payment params:", { razorpay_payment_id, razorpay_order_id, razorpay_signature });

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
          setStatus("error");
          setMessage("Missing payment parameters. Redirecting to home...");
          setTimeout(() => {
            router.push("/payment");
          }, 2000);
          return;
        }

        // Verify payment with Razorpay India endpoint
        const response = await axios.post(
          `${API_URL}/generous-payments-ind/verify`,
          {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.success) {
          setStatus("success");
          setMessage("Payment successful! Thank you for your contribution.");

          // Store success info in sessionStorage for the success page
          if (typeof window !== "undefined" && window.sessionStorage) {
            sessionStorage.setItem('razorpayPaymentVerified', 'true');
            sessionStorage.setItem('paymentMethod', 'razorpay');
          }

          // Redirect to success page after 2 seconds
          setTimeout(() => {
            router.push("/payment/success?verified=true");
          }, 2000);
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        console.error("Error response:", error.response?.data);
        setStatus("error");

        // Get detailed error message
        let errorMessage = "Payment verification failed. Please contact support.";
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setMessage(errorMessage);
      }
    };

    verifyPayment();
  }, [searchParams, router, API_URL]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === "processing" && (
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Payment Verified!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting you to success page...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerify() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    }>
      <PaymentVerifyContent />
    </Suspense>
  );
}
