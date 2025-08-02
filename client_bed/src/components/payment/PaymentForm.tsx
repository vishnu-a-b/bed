"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Axios } from "@/utils/api/apiAuth";
import { create } from "@/utils/api/create";

export function PaymentForm({ supporter }: { supporter: any }) {
  const router = useRouter();
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
      const response = await create("payment/create-order", {
        supporterId: supporter.supporterId,
      });

      console.log("Full API response:", response);

      // Handle direct response (without .data)
      const paymentData = response.data ? response.data : response;

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
          amount: response.amount,
          currency: "INR", // Must be INR for UPI
          order_id: response.orderId,
          name: "Your Business",
          description: "Payment for services",
          
          prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9999999999",
          },
          method: {
            upi: true,
            card: false,
          },
          upi: {
            flow: "collect", // Customer enters VPA
          },
          theme: {
            color: "#F37254",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setErrorMessage(
        (error as any)?.response?.data?.message ||
          (error instanceof Error ? error.message : "Payment failed")
      );
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
