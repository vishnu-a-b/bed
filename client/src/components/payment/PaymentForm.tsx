"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
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

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      // Handle online payment with Razorpay
      const response = await create("payment/create-order", {
        supporterId: supporter.supporterId,
      });

      // Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: response.data.amount,
          currency: response.data.currency,
          name: "Palliative Care Support",
          description: `Payment for ${supporter.supporterName}`,
          order_id: response.data.orderId,
          handler: async (razorpayResponse: any) => {
            try {
              await Axios.post("/payment/verify", {
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              });
              setPaymentStatus("success");
              setTimeout(() => router.refresh(), 2000);
            } catch (error) {
              console.error("Payment verification failed:", error);
              setPaymentStatus("error");
              setErrorMessage("Payment verification failed");
            }
          },
          prefill: {
            name: supporter.supporterName,
            email: supporter.user?.email || "",
            contact: supporter.user?.phoneNumber || "",
          },
          theme: {
            color: "#4f46e5",
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
        (typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as any).response?.data?.message) ||
          "Payment failed. Please try again."
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