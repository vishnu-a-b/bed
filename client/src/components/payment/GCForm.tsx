"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  Check,
  AlertCircle,
} from "lucide-react";

// TypeScript interfaces
interface Contributor {
  name: string;
  email: string;
  phone: string;
}

interface Contribution {
  purpose: string;
  description: string;
}

interface FormData {
  amount: string;
  currency: string;
  contributor: Contributor;
  source: string;
}

interface FormErrors {
  amount?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

type SubmitStatus = "success" | "error" | null;

const GenerousContributionsForm: React.FC = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    currency: "AUD",
    contributor: {
      name: "",
      phone: "",
      email: "", // 👈 Added
    },
    source: "website",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.contributor.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.contributor.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.contributor.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.contributor.email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    section: keyof FormData | null,
    field: string,
    value: string
  ): void => {
    if (
      section &&
      section !== "amount" &&
      section !== "currency" &&
      section !== "source"
    ) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create payment with backend
      const response = await fetch(`${API_URL}/generous-payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const { approvalUrl, orderId, paymentId } = result.data;

        // Store payment info for verification after redirect
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.setItem(
            "paymentInfo",
            JSON.stringify({
              orderId,
              paymentId,
              amount: formData.amount,
              currency: formData.currency,
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

  // Handle successful payment return (you'd call this on your success page)
  const handlePaymentSuccess = async (payerID: string, paymentId: string) => {
    try {
      const paymentInfoStr =
        typeof window !== "undefined" && window.sessionStorage
          ? sessionStorage.getItem("paymentInfo")
          : null;
      const paymentInfo = paymentInfoStr ? JSON.parse(paymentInfoStr) : {};

      const response = await fetch(`${API_URL}/generous-payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paypal_order_id: paymentInfo.orderId,
          paypal_payment_id: paymentId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        // Clear stored payment info
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.removeItem("paymentInfo");
        }

        // Reset form
        setFormData({
          amount: "",
          currency: "AUD",
          contributor: {
            name: "",
            phone: "",
            email: "",
          },
          source: "website",
        });
      } else {
        throw new Error(result.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setSubmitStatus("error");
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Make a Generous Contribution
          </h1>
          <p className="text-lg text-gray-600">
            Your kindness can make a real difference in someone's life
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === "success" && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-green-800">
                Thank you for your generous contribution!
              </h3>
              <p className="text-green-700">
                Your donation has been successfully processed.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === "error" && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800">Payment Failed</h3>
              <p className="text-red-700">
                Please try again or contact support if the issue persists.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Contribution Amount */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
              Contribution Amount
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (AUD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange(null, "amount", e.target.value)
                    }
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.amount ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contributor Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.contributor.name}
                  onChange={(e) =>
                    handleInputChange("contributor", "name", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.contributor.phone}
                    onChange={(e) =>
                      handleInputChange("contributor", "phone", e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="+1234567890"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.contributor.email}
                    onChange={(e) =>
                      handleInputChange("contributor", "email", e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Payment...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Proceed to PayPal
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Your contribution makes a difference. Thank you for your generosity!
            🙏
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenerousContributionsForm;
