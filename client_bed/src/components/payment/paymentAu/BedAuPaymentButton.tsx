import axios from "axios";
import { Heart, X } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function BedAuPaymentButton({ id, supporterData }: any) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<any>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;



    // Check for payment success on component mount (if returning from PayPal)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const payerID = urlParams.get("PayerID");
      const paymentId = urlParams.get("paymentId");

      if (payerID && paymentId) {
        handlePaymentSuccess(payerID, paymentId);
      }
    }
  }, []);
  const handleSubmit = async (): Promise<void> => {
    setShowDialog(false); // Close dialog when starting payment
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create payment with backend using axios
      const response = await axios.post(
        `${API_URL}/bed-payments/create`,
        {
          supporter:id,
          source:'website',
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      if (result.success) {
        const { approvalUrl, orderId, paymentId } = result.data;

        // Store payment info for verification after redirect
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.setItem(
            "paymentInfo",
            JSON.stringify({
              orderId,
              paymentId,
            })
          );
        }

        // Redirect to PayPal for payment
        if (approvalUrl) {
          window.location.href = approvalUrl;
        } else {
          throw new Error("No approval URL received from PayPal");
        }
      } else {
        throw new Error(result.message || "Payment creation failed");
      }
    } catch (error: any) {
      console.error("Payment creation error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

    const handlePaymentSuccess = async (payerID: string, paymentId: string) => {
    try {
      const paymentInfoStr =
        typeof window !== "undefined" && window.sessionStorage
          ? sessionStorage.getItem("paymentInfo")
          : null;
      const paymentInfo = paymentInfoStr ? JSON.parse(paymentInfoStr) : {};

      const response = await axios.post(`${API_URL}/bed-payments/verify`, {
        paypal_order_id: paymentInfo.orderId,
        paypal_payment_id: paymentId,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = response.data;

      if (result.success) {
        setSubmitStatus("success");
        // Clear stored payment info
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.removeItem("paymentInfo");
        }
      } else {
        throw new Error(result.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setSubmitStatus("error");
    }
  };
  return (
    <>
      <div className="pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setShowDialog(true)}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Payment...
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
                    PayPal
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                You will be redirected to PayPal to complete your payment
                securely.
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
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Proceed to PayPal"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
