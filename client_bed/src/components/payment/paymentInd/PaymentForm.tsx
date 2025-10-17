"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Axios } from "@/utils/api/apiAuth";

export function PaymentForm({ supporter }: { supporter: any }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      console.log("=== CREATE ORDER REQUEST ===");
      console.log("API URL:", `${API_URL}/bed-payments-ind/create-order`);
      console.log("Supporter data:", supporter);

      // The supporterId can be in different fields depending on the response structure
      const supporterId = supporter.supporterId || supporter._id || supporter.id;
      console.log("Extracted supporterId:", supporterId);

      if (!supporterId) {
        throw new Error("Supporter ID not found in supporter data");
      }

      // Use bed-payments-ind endpoint for India payments
      const response = await Axios.post(`${API_URL}/bed-payments-ind/create-order`, {
        supporterId: supporterId,
      });

      console.log("Full API response:", response);

      // Handle response
      const paymentData = response.data?.data || response.data;

      if (!paymentData.orderId || !paymentData.amount) {
        throw new Error(
          `Invalid API response. Received: ${JSON.stringify(paymentData)}`
        );
      }

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: paymentData.amount,
          currency: paymentData.currency || "INR",
          order_id: paymentData.orderId,
          name: "Generous Contributions",
          description: "Bed Payment Contribution",

          prefill: {
            name: supporter.supporterName || "Supporter",
            email: supporter.email || "",
            contact: supporter.phone || "",
          },
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
          },
          theme: {
            color: "#3B82F6",
          },
          handler: async function (response: any) {
            // Payment successful - verify payment
            try {
              setPaymentStatus("processing");
              const verifyResponse = await Axios.post(`${API_URL}/bed-payments-ind/verify`, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });

              console.log("Verification response:", verifyResponse);

              if (verifyResponse.data?.success) {
                setPaymentStatus("success");
                // Reload the current page after a short delay to show updated data
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (verifyError) {
              console.error("Verification error:", verifyError);
              setPaymentStatus("error");
              setErrorMessage("Payment completed but verification failed. Please contact support.");
            }
          },
          modal: {
            ondismiss: function () {
              setIsLoading(false);
              setPaymentStatus("idle");
              setErrorMessage("Payment cancelled");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          console.error("Payment failed:", response.error);
          setPaymentStatus("error");
          setErrorMessage(
            response.error.description ||
            response.error.reason ||
            "Payment failed. Please try again."
          );
          setIsLoading(false);
        });
        rzp.open();
      };

      script.onerror = () => {
        setPaymentStatus("error");
        setErrorMessage("Failed to load payment gateway. Please try again.");
        setIsLoading(false);
      };

      document.body.appendChild(script);
    } catch (error) {
      console.error("=== PAYMENT ERROR ===");
      console.error("Full error:", error);
      console.error("Error response:", (error as any)?.response);
      console.error("Error response data:", (error as any)?.response?.data);

      setPaymentStatus("error");
      const errorMsg = (error as any)?.response?.data?.error ||
                      (error as any)?.response?.data?.message ||
                      (error instanceof Error ? error.message : "Payment failed");

      console.error("Showing error message:", errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-sm text-gray-500">
          Thank you for your contribution to palliative care.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
          {errorMessage}
        </div>
      )}
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Proceed to Payment"
        )}
      </Button>
    </div>
  );
}
