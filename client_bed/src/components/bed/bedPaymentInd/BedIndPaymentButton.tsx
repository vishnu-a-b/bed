"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, CheckCircle2, X } from "lucide-react";
import axios from "axios";

interface BedIndPaymentButtonProps {
  supporterId: string | null;
  supporterData?: any;
}

export function BedIndPaymentButton({ supporterId, supporterData }: BedIndPaymentButtonProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Clean up Razorpay script when component unmounts
  useEffect(() => {
    return () => {
      const razorpayScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (razorpayScript) {
        document.body.removeChild(razorpayScript);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!supporterId) {
      setErrorMessage("Supporter ID is missing");
      setPaymentStatus("error");
      return;
    }

    setShowDialog(false); // Close dialog when starting payment
    setIsLoading(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      console.log("=== CREATE ORDER REQUEST ===");
      console.log("API URL:", `${API_URL}/bed-payments-ind/create-order-hosted`);
      console.log("Supporter ID:", supporterId);

      // Create Razorpay order for hosted checkout
      const response = await axios.post(
        `${API_URL}/bed-payments-ind/create-order-hosted`,
        {
          supporterId: supporterId,
          // Provide callback URLs for hosted checkout
          callback_url: `${window.location.origin}/payment/callback`,
          cancel_url: `${window.location.origin}/payment/cancel`,
        }
      );

      console.log("Full API response:", response);

      // Handle response
      const paymentData = response.data?.data || response.data;

      if (!paymentData.hostedCheckoutUrl) {
        throw new Error(
          `Invalid API response. Received: ${JSON.stringify(paymentData)}`
        );
      }

      // Redirect to Razorpay hosted checkout page
      window.location.href = paymentData.hostedCheckoutUrl;

    } catch (error) {
      console.error("=== PAYMENT ERROR ===");
      console.error("Full error:", error);
      console.error("Error response:", (error as any)?.response);
      console.error("Error response data:", (error as any)?.response?.data);

      setPaymentStatus("error");
      const errorMsg =
        (error as any)?.response?.data?.error ||
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : "Payment failed");

      console.error("Showing error message:", errorMsg);
      setErrorMessage(errorMsg);
      setIsLoading(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="pt-6 border-t border-gray-200">
        <div className="text-center py-8 bg-green-50 rounded-lg">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Payment Successful!
          </h3>
          <p className="text-sm text-gray-500">
            Thank you for your contribution to palliative care.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pt-6 border-t border-gray-200">
        {errorMessage && (
          <div className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg mb-4">
            {errorMessage}
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowDialog(true)}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 mr-2" />
              Pay Now
            </>
          )}
        </button>
      </div>

      {/* Payment Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Confirm Payment
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Supporter Name
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {supporterData?.supporterName || "N/A"}
                  </span>
                </div>
                {supporterData?.bedNo && supporterData.bedNo < 1000 && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Bed Number
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {supporterData.bedNo}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Monthly Amount
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {supporterData?.currency} {supporterData?.fixedAmount || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Payment Method
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    Razorpay (UPI, Card, Net Banking)
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                You will be able to choose your preferred payment method in the
                next step.
              </p>
            </div>

            {/* Dialog Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
