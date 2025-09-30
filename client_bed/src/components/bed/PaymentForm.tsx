"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Select from "react-select";
import toastService from "@/utils/toastService";
import { Axios } from "@/utils/api/apiAuth";
import { create } from "@/utils/api/create";
import AsyncSelect from "react-select/async";
import { loadSupporter, loadUsers } from "@/utils/api/loadSelectData";
// Mock services for demo - replace with your actual imports

const fetchSingleData = async (id: any, endpoint: any) => {
  // Mock implementation - replace with actual API call
  return { items: {} };
};

const update = async (data: any, endpoint: any, id: any) => {
  // Mock implementation - replace with actual API call
  return { _id: "updated" };
};

const paymentSchema = z.object({
  // Receipt number will be auto-generated
  // PayPal fields
  paypal_order_id: z.string().optional(),
  paypal_payment_id: z.string().optional(),
  paypal_payer_id: z.string().optional(),
  paypal_capture_id: z.string().optional(),

  // Payer information
  name: z.string().optional(),
  phNo: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),

  // Payment details
  amount: z.number().min(1, { message: "Amount must be positive" }),
  currency: z.enum(["AUD", "USD"]).default("AUD"),
  status: z.enum([
    "pending",
    "completed",
    "failed",
    "cancelled",
    "refunded",
    "partially_refunded",
  ]),

  // Contribution details
  contribution: z.object({
    purpose: z
      .enum([
        "general_donation",
        "medical_assistance",
        "education_support",
        "emergency_fund",
        "other",
      ])
      .default("general_donation"),
    description: z.string().default("General donation"),
  }),

  // Payment mode
  paymentMode: z.enum(["online", "offline"]).default("online"),
  manualMethod: z.enum(["cash", "cheque", "bank_transfer", "other"]).optional(),
  transactionReference: z.string().optional(),
  paymentDate: z.string().optional(),
  remarks: z.string().optional(),

  // Source
  source: z
    .enum(["website", "mobile_app", "social_media", "email_campaign", "other"])
    .default("website"),

  // Approval
  isApproved: z.boolean().default(true),

  // Optional supporter and bed references
  supporter: z.string().optional(),
  bed: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PaymentForm = ({ paymentId }: { paymentId?: string }) => {
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
    { value: "partially_refunded", label: "Partially Refunded" },
  ];

  const paymentModeOptions = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
  ];

  const manualMethodOptions = [
    { value: "cash", label: "Cash" },
    { value: "cheque", label: "Cheque" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "other", label: "Other" },
  ];

  const currencyOptions = [
    { value: "AUD", label: "AUD" },
    { value: "USD", label: "USD" },
  ];

  const purposeOptions = [
    { value: "general_donation", label: "General Donation" },
    { value: "medical_assistance", label: "Medical Assistance" },
    { value: "education_support", label: "Education Support" },
    { value: "emergency_fund", label: "Emergency Fund" },
    { value: "other", label: "Other" },
  ];

  const sourceOptions = [
    { value: "website", label: "Website" },
    { value: "mobile_app", label: "Mobile App" },
    { value: "social_media", label: "Social Media" },
    { value: "email_campaign", label: "Email Campaign" },
    { value: "other", label: "Other" },
  ];

  const [paymentMode, setPaymentMode] = useState({
    value: "offline",
    label: "Offline",
  });
  const [manualMethod, setManualMethod] = useState<any>();
  const [status, setStatus] = useState({
    value: "pending",
    label: "Pending",
  });
  const [currency, setCurrency] = useState({
    value: "AUD",
    label: "AUD",
  });
  const [purpose, setPurpose] = useState({
    value: "general_donation",
    label: "General Donation",
  });
  const [source, setSource] = useState({
    value: "website",
    label: "Website",
  });
  const [isApproved, setIsApproved] = useState({
    value: false,
    label: "No",
  });

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    setError,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      contribution: {
        purpose: "general_donation",
        description: "General donation",
      },
      source: "website",
      currency: "AUD",
      status: "pending",
      paymentMode: "offline",
      isApproved: false,
    },
  });

  const [isSending, setIsSending] = useState(false);
  const [head, setHead] = useState<any>();
  const handleHeadChange = (selectedOption: any) => {
    console.log(selectedOption);
    setValue("supporter", selectedOption.value || "");
    setValue("bed", selectedOption.bed || "");
    setHead(selectedOption);
  };
  useEffect(() => {
    if (paymentId) {
      const fetchDetails = async () => {
        try {
          const items = await fetchSingleData(paymentId, "bed-payments");
          const data: any = items.items;

          setValue("paypal_order_id", data.paypal_order_id || "");
          setValue("paypal_payment_id", data.paypal_payment_id || "");
          setValue("paypal_payer_id", data.paypal_payer_id || "");
          setValue("paypal_capture_id", data.paypal_capture_id || "");
          setValue("name", data.name || data.payer?.name?.given_name || "");
          setValue("phNo", data.phNo || "");
          setValue("email", data.email || data.payer?.email_address || "");
          setValue("address", data.address || "");
          setValue("amount", data.amount);
          setValue("currency", data.currency || "AUD");
          setValue("status", data.status || "pending");
          setValue("paymentMode", data.paymentMode || "offline");
          setValue("manualMethod", data.manualMethod || undefined);
          setValue("transactionReference", data.transactionReference || "");
          setValue("paymentDate", data.paymentDate?.split("T")[0] || "");
          setValue("remarks", data.remarks || "");
          setValue("isApproved", data.isApproved !== false);
          setValue(
            "contribution.purpose",
            data.contribution?.purpose || "general_donation"
          );
          setValue(
            "contribution.description",
            data.contribution?.description || "General donation"
          );
          setValue("source", data.source || "website");
          setValue("supporter", data.supporter || "");
          setValue("bed", data.bed || "");

          // Set dropdown states
          setStatus({
            value: data.status || "pending",
            label: data.status
              ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
              : "Pending",
          });

          setPaymentMode({
            value: data.paymentMode || "offline",
            label: data.paymentMode === "online" ? "Online" : "Offline",
          });

          setCurrency({
            value: data.currency || "AUD",
            label: data.currency || "AUD",
          });

          setPurpose({
            value: data.contribution?.purpose || "general_donation",
            label: data.contribution?.purpose
              ? data.contribution.purpose
                  .split("_")
                  .map(
                    (word: any) => word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")
              : "General Donation",
          });

          setSource({
            value: data.source || "website",
            label: data.source
              ? data.source
                  .split("_")
                  .map(
                    (word: any) => word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")
              : "Website",
          });

          setIsApproved({
            value: data.isApproved !== false,
            label: data.isApproved !== false ? "Yes" : "No",
          });

          if (data.manualMethod) {
            setManualMethod({
              value: data.manualMethod,
              label:
                data.manualMethod.charAt(0).toUpperCase() +
                data.manualMethod.slice(1),
            });
          }
        } catch (error) {
          console.error("Error fetching payment details:", error);
        }
      };
      fetchDetails();
    }
  }, [paymentId, setValue]);

  const handleStatusChange = (selectedOption: any) => {
    setStatus(selectedOption);
    setValue("status", selectedOption.value);
  };

  const handlePaymentModeChange = (selectedOption: any) => {
    setPaymentMode(selectedOption);
    setValue("paymentMode", selectedOption.value);
    if (selectedOption.value === "online") {
      setManualMethod(undefined);
      setValue("manualMethod", undefined);
    }
  };

  const handleManualMethodChange = (selectedOption: any) => {
    setManualMethod(selectedOption);
    setValue("manualMethod", selectedOption.value);
  };

  const handleCurrencyChange = (selectedOption: any) => {
    setCurrency(selectedOption);
    setValue("currency", selectedOption.value);
  };

  const handlePurposeChange = (selectedOption: any) => {
    setPurpose(selectedOption);
    setValue("contribution.purpose", selectedOption.value);
    const description =
      selectedOption.value === "general_donation"
        ? "General donation"
        : `${selectedOption.label} contribution`;
    setValue("contribution.description", description);
  };

  const handleSourceChange = (selectedOption: any) => {
    setSource(selectedOption);
    setValue("source", selectedOption.value);
  };

  const handleApprovalChange = (selectedOption: any) => {
    setIsApproved(selectedOption);
    setValue("isApproved", selectedOption.value);
  };

  const onSubmit = async (data: PaymentFormData) => {
    setIsSending(true);
    try {
      const paymentData = {
        ...data,
        amount: Number(data.amount),
        ...(data.paymentDate && {
          paymentDate: new Date(data.paymentDate).toISOString(),
        }),
      };

      if (paymentId) {
        // Update existing payment
        const response = await update(paymentData, "bed-payments", paymentId);
        if (response._id) {
          toastService.success("Payment updated successfully");
        } else {
          toastService.error("Error updating payment");
        }
      } else {
        // Create new manual payment
        const endpoint =
          data.paymentMode === "offline"
            ? "bed-payments/manual"
            : "bed-payments";

        const response = await create(endpoint, paymentData);
        console.log(response);
        if (response.payment._id) {
          toastService.success(
            `Manual payment created successfully${
              data.paymentMode === "offline" ? " (Pending approval)" : ""
            }`
          );
          clear();
        } else {
          toastService.error("Error creating payment");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toastService.error("Error submitting form");
    } finally {
      setIsSending(false);
    }
  };

  const clear = () => {
    setValue("amount", 0);
    setValue("status", "pending");
    setValue("paymentMode", "offline");
    setValue("isApproved", false);
    setValue("contribution.purpose", "general_donation");
    setValue("contribution.description", "General donation");
    setValue("source", "website");
    setValue("currency", "AUD");
    setValue("name", "");
    setValue("email", "");
    setValue("phNo", "");
    setValue("address", "");
    setValue("transactionReference", "");
    setValue("paymentDate", "");
    setValue("remarks", "");
    setValue("supporter", "");
    setValue("bed", "");

    setPaymentMode({ value: "offline", label: "Offline" });
    setStatus({ value: "pending", label: "Pending" });
    setCurrency({ value: "AUD", label: "AUD" });
    setPurpose({ value: "general_donation", label: "General Donation" });
    setSource({ value: "website", label: "Website" });
    setIsApproved({ value: false, label: "No" });
    setManualMethod(undefined);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {watch("paymentMode") === "offline" && (
        <Alert className="mb-6">
          <AlertDescription>
            Manual/offline payments require approval before receipts are sent to
            donors.
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6 grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount" className="required text-sm font-medium">
              Amount *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Enter amount"
              className={`w-full ${errors.amount ? "border-red-500" : ""}`}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="currency" className="text-sm font-medium">
              Currency
            </Label>
            <Select
              id="currency"
              options={currencyOptions}
              value={currency}
              onChange={handleCurrencyChange}
              classNamePrefix="select"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="paymentMode" className="required text-sm font-medium">
            Payment Mode *
          </Label>
          <Select
            id="paymentMode"
            options={paymentModeOptions}
            value={paymentMode}
            onChange={handlePaymentModeChange}
            classNamePrefix="select"
          />
        </div>

        <div>
          <Label htmlFor="status" className="required text-sm font-medium">
            Status *
          </Label>
          <Select
            id="status"
            options={statusOptions}
            value={status}
            onChange={handleStatusChange}
            classNamePrefix="select"
          />
        </div>

        {watch("paymentMode") === "offline" && (
          <>
            <div>
              <Label htmlFor="manualMethod" className="text-sm font-medium">
                Manual Method
              </Label>
              <Select
                id="manualMethod"
                options={manualMethodOptions}
                value={manualMethod}
                onChange={handleManualMethodChange}
                classNamePrefix="select"
                placeholder="Select method..."
              />
            </div>

            <div>
              <Label
                htmlFor="transactionReference"
                className="text-sm font-medium"
              >
                Transaction Reference
              </Label>
              <Input
                id="transactionReference"
                {...register("transactionReference")}
                placeholder="Cheque no, UTR, etc."
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="paymentDate" className="text-sm font-medium">
                Payment Date
              </Label>
              <Input
                type="date"
                id="paymentDate"
                {...register("paymentDate")}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="isApproved" className="text-sm font-medium">
                Approved Status
              </Label>
              <Select
                options={[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ]}
                value={isApproved}
                onChange={handleApprovalChange}
                classNamePrefix="select"
              />
            </div>
          </>
        )}

        {watch("paymentMode") === "online" && (
          <>
            <div>
              <Label
                htmlFor="paypal_payment_id"
                className="text-sm font-medium"
              >
                PayPal Payment ID
              </Label>
              <Input
                id="paypal_payment_id"
                {...register("paypal_payment_id")}
                placeholder="Enter PayPal payment ID"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="paypal_order_id" className="text-sm font-medium">
                PayPal Order ID
              </Label>
              <Input
                id="paypal_order_id"
                {...register("paypal_order_id")}
                placeholder="Enter PayPal order ID"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="paypal_payer_id" className="text-sm font-medium">
                PayPal Payer ID
              </Label>
              <Input
                id="paypal_payer_id"
                {...register("paypal_payer_id")}
                placeholder="Enter PayPal payer ID"
                className="w-full"
              />
            </div>
          </>
        )}

        {/* Payer Information Section */}
        <div className="col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            Payer Information
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Payer Name
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter payer name"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter payer email"
                className={`w-full ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phNo" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phNo"
                {...register("phNo")}
                placeholder="Enter payer phone number"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium">
                Address
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Enter payer address"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Optional References Section */}
        <div className="col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            Optional References
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* <div>
              <Label htmlFor="supporter" className="text-sm font-medium">
                Supporter ID (Optional)
              </Label>
              <Input
                id="supporter"
                {...register("supporter")}
                placeholder="Enter supporter ID if applicable"
                className="w-full"
              />
            </div> */}
            <div>
              <Label htmlFor="head">Supporter</Label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadSupporter}
                defaultOptions
                value={head}
                onChange={handleHeadChange}
                classNamePrefix="select"
                isClearable
              />
            </div>

            <div>
              <Label htmlFor="bed" className="text-sm font-medium">
                Bed ID (Optional)
              </Label>
              <Input
                id="bed"
                {...register("bed")}
                placeholder="Enter bed ID if applicable"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Contribution Details Section */}
        <div className="col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">
            Contribution Details
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purpose" className="text-sm font-medium">
                Contribution Purpose
              </Label>
              <Select
                id="purpose"
                options={purposeOptions}
                value={purpose}
                onChange={handlePurposeChange}
                classNamePrefix="select"
              />
            </div>

            <div>
              <Label htmlFor="source" className="text-sm font-medium">
                Source
              </Label>
              <Select
                id="source"
                options={sourceOptions}
                value={source}
                onChange={handleSourceChange}
                classNamePrefix="select"
              />
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="col-span-1 lg:col-span-2">
          <Label htmlFor="remarks" className="text-sm font-medium">
            Remarks
          </Label>
          <textarea
            id="remarks"
            {...register("remarks")}
            placeholder="Enter any additional remarks or notes"
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            rows={3}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center col-span-1 lg:col-span-2 pt-4 border-t">
          <Button
            type="button"
            onClick={clear}
            className="bg-gray-500 hover:bg-gray-600 text-white"
            disabled={isSending}
          >
            {paymentId ? "Cancel" : "Clear"}
          </Button>

          <div className="flex gap-2">
            {!paymentId && watch("paymentMode") === "offline" && (
              <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                ⚠️ Will require manual approval
              </span>
            )}

            <Button
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 text-white ${
                isSending ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={isSending}
            >
              {isSending
                ? "Processing..."
                : paymentId
                ? "Update Payment"
                : "Create Payment"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
