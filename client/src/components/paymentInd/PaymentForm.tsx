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
  const [showEmbeddedCheckout, setShowEmbeddedCheckout] = useState<boolean>(false);
  const [paymentOrderData, setPaymentOrderData] = useState<any>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      // Create Razorpay order for embedded checkout
      const response = await create("payment/create-order-hosted", {
        supporterId: supporter.supporterId,
        callback_url: `${window.location.origin}/payment/callback`,
        cancel_url: `${window.location.origin}/payment/cancel`,
      });

      console.log("Full API response:", response);

      // Handle direct response (without .data)
      const paymentData = response.data ? response.data : response;

      if (!paymentData.orderId || !paymentData.key) {
        throw new Error(
          `Invalid API response. Received: ${JSON.stringify(paymentData)}`
        );
      }

      // Store order data for embedded checkout form
      setPaymentOrderData({
        key_id: paymentData.key,
        order_id: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency || "INR",
        name: "Generous Contributions",
        description: "Bed Payment Contribution",
        image: `${window.location.origin}/father.png`,
        prefill_name: paymentData.customerName || "",
        prefill_email: paymentData.customerEmail || "",
        prefill_contact: paymentData.customerContact || "",
        callback_url: paymentData.callbackUrl || `${window.location.origin}/payment/callback`,
        cancel_url: paymentData.cancelUrl || `${window.location.origin}/payment/cancel`,
      });

      // Show embedded checkout
      setShowEmbeddedCheckout(true);
      setIsLoading(false);

      // Auto-submit the form after a short delay to allow state to update
      setTimeout(() => {
        const form = document.getElementById('razorpay-payment-embedded-form') as HTMLFormElement;
        if (form) {
          form.submit();
        }
      }, 100);

    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setErrorMessage(
        (error as any)?.response?.data?.message ||
          (error instanceof Error ? error.message : "Payment failed")
      );
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
    <>
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

      {/* Razorpay Embedded Checkout Form */}
      {showEmbeddedCheckout && paymentOrderData && (
        <form
          id="razorpay-payment-embedded-form"
          method="POST"
          action="https://api.razorpay.com/v1/checkout/embedded"
          style={{ display: 'none' }}
        >
          <input type="hidden" name="key_id" value={paymentOrderData.key_id} />
          <input type="hidden" name="amount" value={paymentOrderData.amount} />
          <input type="hidden" name="currency" value={paymentOrderData.currency} />
          <input type="hidden" name="order_id" value={paymentOrderData.order_id} />
          <input type="hidden" name="name" value={paymentOrderData.name} />
          <input type="hidden" name="description" value={paymentOrderData.description} />
          <input type="hidden" name="image" value={paymentOrderData.image} />
          <input type="hidden" name="prefill[name]" value={paymentOrderData.prefill_name} />
          <input type="hidden" name="prefill[email]" value={paymentOrderData.prefill_email} />
          <input type="hidden" name="prefill[contact]" value={paymentOrderData.prefill_contact} />
          <input type="hidden" name="callback_url" value={paymentOrderData.callback_url} />
          <input type="hidden" name="cancel_url" value={paymentOrderData.cancel_url} />
        </form>
      )}
    </>
  );
}
