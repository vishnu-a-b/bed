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

const fetchSingleData = async (id: any, endpoint: any) => {
  const response = await Axios.get(`/${endpoint}/${id}`);
  return { items: response.data.data };
};

const update = async (data: any, endpoint: any, id: any) => {
  const response = await Axios.put(`/${endpoint}/${id}`, data);
  return response.data.data;
};

const paymentSchema = z.object({
  // Razorpay fields
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),

  // Payer information
  name: z.string().optional(),
  phNo: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),

  // Payment details
  amount: z.number().min(1, { message: "Amount must be positive" }),
  currency: z.enum(["INR"]).default("INR"),
  status: z.enum([
    "pending",
    "captured",
    "failed",
    "cancelled",
    "refunded",
  ]),

  // Payment mode
  paymentMode: z.enum(["online", "offline"]).default("online"),
  manualMethod: z.enum(["cash", "cheque", "upi", "bank_transfer", "other"]).optional(),
  transactionReference: z.string().optional(),
  paymentDate: z.string().optional(),
  remarks: z.string().optional(),

  // Verification
  isVerified: z.boolean().default(false),

  // Required supporter and bed references
  supporter: z.string().min(1, { message: "Supporter is required" }),
  bed: z.string().min(1, { message: "Bed is required" }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PaymentForm = ({ paymentId }: { paymentId?: string }) => {
  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "captured", label: "Captured" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  const paymentModeOptions = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
  ];

  const manualMethodOptions = [
    { value: "cash", label: "Cash" },
    { value: "cheque", label: "Cheque" },
    { value: "upi", label: "UPI" },
    { value: "bank_transfer", label: "Bank Transfer" },
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
  const [isVerified, setIsVerified] = useState({
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
      currency: "INR",
      status: "pending",
      paymentMode: "offline",
      isVerified: false,
    },
  });

  const [isSending, setIsSending] = useState(false);
  const [supporter, setSupporter] = useState<any>();

  const handleSupporterChange = (selectedOption: any) => {
    console.log(selectedOption);
    setValue("supporter", selectedOption?.value || "");
    setValue("bed", selectedOption?.bed || "");
    setSupporter(selectedOption);
  };

  useEffect(() => {
    if (paymentId) {
      const fetchDetails = async () => {
        try {
          const items = await fetchSingleData(paymentId, "payment");
          const data: any = items.items;

          setValue("razorpay_order_id", data.razorpay_order_id || "");
          setValue("razorpay_payment_id", data.razorpay_payment_id || "");
          setValue("razorpay_signature", data.razorpay_signature || "");
          setValue("name", data.name || "");
          setValue("phNo", data.phNo || "");
          setValue("email", data.email || "");
          setValue("address", data.address || "");
          setValue("amount", data.amount);
          setValue("currency", "INR");
          setValue("status", data.status || "pending");
          setValue("paymentMode", data.paymentMode || "offline");
          setValue("manualMethod", data.manualMethod || undefined);
          setValue("transactionReference", data.transactionReference || "");
          setValue("paymentDate", data.paymentDate?.split("T")[0] || "");
          setValue("remarks", data.remarks || "");
          setValue("isVerified", data.isVerified || false);
          setValue("supporter", data.supporter?._id || "");
          setValue("bed", data.bed?._id || "");

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

          setIsVerified({
            value: data.isVerified || false,
            label: data.isVerified ? "Yes" : "No",
          });

          if (data.manualMethod) {
            setManualMethod({
              value: data.manualMethod,
              label:
                data.manualMethod.charAt(0).toUpperCase() +
                data.manualMethod.slice(1),
            });
          }

          if (data.supporter) {
            setSupporter({
              value: data.supporter._id,
              label: data.supporter.name,
              bedNo: data.bed?.bedNo,
              bed: data.bed?._id,
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

  const handleVerificationChange = (selectedOption: any) => {
    setIsVerified(selectedOption);
    setValue("isVerified", selectedOption.value);
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
        const response = await update(paymentData, "payment", paymentId);
        if (response._id) {
          toastService.success("Payment updated successfully");
        } else {
          toastService.error("Error updating payment");
        }
      } else {
        // Create new payment
        const response = await create("payment", paymentData);
        console.log(response);
        if (response._id) {
          toastService.success("Payment created successfully");
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
    setValue("isVerified", false);
    setValue("currency", "INR");
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
    setIsVerified({ value: false, label: "No" });
    setManualMethod(undefined);
    setSupporter(undefined);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {watch("paymentMode") === "offline" && (
        <Alert className="mb-6">
          <AlertDescription>
            Manual/offline payments require verification before being confirmed.
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
              Amount (in paise) *
            </Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", { valueAsNumber: true })}
              placeholder="Enter amount in paise"
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
            <Input
              id="currency"
              value="INR"
              disabled
              className="w-full bg-gray-100"
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
              <Label htmlFor="isVerified" className="text-sm font-medium">
                Verified Status
              </Label>
              <Select
                options={[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ]}
                value={isVerified}
                onChange={handleVerificationChange}
                classNamePrefix="select"
              />
            </div>
          </>
        )}

        {watch("paymentMode") === "online" && (
          <>
            <div>
              <Label
                htmlFor="razorpay_payment_id"
                className="text-sm font-medium"
              >
                Razorpay Payment ID
              </Label>
              <Input
                id="razorpay_payment_id"
                {...register("razorpay_payment_id")}
                placeholder="Enter Razorpay payment ID"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="razorpay_order_id" className="text-sm font-medium">
                Razorpay Order ID
              </Label>
              <Input
                id="razorpay_order_id"
                {...register("razorpay_order_id")}
                placeholder="Enter Razorpay order ID"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="razorpay_signature" className="text-sm font-medium">
                Razorpay Signature
              </Label>
              <Input
                id="razorpay_signature"
                {...register("razorpay_signature")}
                placeholder="Enter Razorpay signature"
                className="w-full"
              />
            </div>
          </>
        )}

        <div className="col-span-1 lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supporter" className="required">
                Supporter *
              </Label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadSupporter}
                defaultOptions
                value={supporter}
                onChange={handleSupporterChange}
                classNamePrefix="select"
                isClearable
                required
              />
              {errors.supporter && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.supporter.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bed" className="text-sm font-medium">
                Bed No
              </Label>
              <Input
                id="bed"
                {...register("bed")}
                className="w-full hidden"
              />
              <Input
                value={supporter?.bedNo || ""}
                placeholder="Bed number"
                className="w-full"
                disabled
              />
              {errors.bed && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bed.message}
                </p>
              )}
            </div>
          </div>
        </div>

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
                ⚠️ Will require verification
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
