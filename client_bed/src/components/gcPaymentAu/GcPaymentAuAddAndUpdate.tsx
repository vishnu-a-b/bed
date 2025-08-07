"use client"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toastService from "@/utils/toastService";
import { fetchSingleData } from "@/utils/api/fetchData";
import Select from "react-select";
import { update } from "@/utils/api/updateData";
import { create } from "@/utils/api/create";
import { useDispatch } from "react-redux";
import { clearUpdate } from "@/lib/slice/updateSlice";

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
  status: z.enum(["pending", "completed", "failed", "cancelled", "refunded", "partially_refunded"]),
  
  // Contribution details
  contribution: z.object({
    purpose: z.enum(["general_donation", "medical_assistance", "education_support", "emergency_fund", "other"]).default("general_donation"),
    description: z.string().default("General donation")
  }),
  
  // Payment mode
  paymentMode: z.enum(["online", "offline"]).default("online"),
  manualMethod: z.enum(["cash", "cheque", "bank_transfer", "other"]).optional(),
  transactionReference: z.string().optional(),
  paymentDate: z.string().optional(),
  remarks: z.string().optional(),
  
  // Source
  source: z.enum(["website", "mobile_app", "social_media", "email_campaign", "other"]).default("website"),
  
  // Approval
  isApproved: z.boolean().default(true),
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

  const dispatch = useDispatch();
  const [paymentMode, setPaymentMode] = useState<any>({
    value: "online",
    label: "Online",
  });
  const [manualMethod, setManualMethod] = useState<any>();
  const [status, setStatus] = useState<any>({
    value: "completed",
    label: "Completed",
  });
  const [currency, setCurrency] = useState<any>({
    value: "AUD",
    label: "AUD",
  });
  const [purpose, setPurpose] = useState<any>({
    value: "general_donation",
    label: "General Donation",
  });
  const [source, setSource] = useState<any>({
    value: "website",
    label: "Website",
  });
  const [isApproved, setIsApproved] = useState<any>({
    value: true,
    label: "Yes",
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
        description: "General donation"
      },
      source: "website",
      currency: "AUD",
      status: "completed",
      paymentMode: "online",
      isApproved: true
    }
  });

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (paymentId) {
      const fetchDetails = async () => {
        try {
          const items: any = await fetchSingleData(paymentId, "generous-contribution");
          const data = items.items;
          
          setValue("paypal_order_id", data.paypal_order_id || "");
          setValue("paypal_payment_id", data.paypal_payment_id || "");
          setValue("paypal_payer_id", data.paypal_payer_id || "");
          setValue("paypal_capture_id", data.paypal_capture_id || "");
          setValue("name", data.name || "");
          setValue("phNo", data.phNo || "");
          setValue("email", data.email || data.payer?.email_address || "");
          setValue("address", data.address || "");
          setValue("amount", data.amount);
          setValue("currency", data.currency || "AUD");
          setValue("status", data.status || "completed");
          setValue("paymentMode", data.paymentMode || "online");
          setValue("manualMethod", data.manualMethod || undefined);
          setValue("transactionReference", data.transactionReference || "");
          setValue("paymentDate", data.paymentDate?.split('T')[0] || "");
          setValue("remarks", data.remarks || "");
          setValue("isApproved", data.isApproved !== false);
          setValue("contribution.purpose", data.contribution?.purpose || "general_donation");
          setValue("contribution.description", data.contribution?.description || "General donation");
          setValue("source", data.source || "website");

          setStatus({
            value: data.status || "completed",
            label: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : "Completed",
          });

          setPaymentMode({
            value: data.paymentMode || "online",
            label: data.paymentMode === "offline" ? "Offline" : "Online",
          });

          setCurrency({
            value: data.currency || "AUD",
            label: data.currency || "AUD",
          });

          setPurpose({
            value: data.contribution?.purpose || "general_donation",
            label: data.contribution?.purpose 
              ? data.contribution.purpose.split('_').map((word:any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              : "General Donation"
          });

          setSource({
            value: data.source || "website",
            label: data.source 
              ? data.source.split('_').map((word:any) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
              : "Website"
          });

          setIsApproved({
            value: data.isApproved !== false,
            label: data.isApproved !== false ? "Yes" : "No",
          });

          if (data.manualMethod) {
            setManualMethod({
              value: data.manualMethod,
              label: data.manualMethod.charAt(0).toUpperCase() + data.manualMethod.slice(1),
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
    // Set default description based on purpose
    const description = selectedOption.value === "general_donation" 
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
      const paymentData: any = {
        ...data,
        amount: Number(data.amount),
        ...(data.paymentDate && { paymentDate: new Date(data.paymentDate).toISOString() }),
      };

      if (paymentId) {
        const response = await update(paymentData, "generous-contribution", paymentId);
        if (response._id) {
          toastService.success("Contribution updated successfully");
        } else {
          setError(response.id, { message: response.value });
          toastService.error("Error updating contribution");
        }
      } else {
        const response = await create("generous-contribution", paymentData);
        if (response._id) {
          toastService.success("Contribution created successfully");
          clear();
        } else {
          setError(response.id, { message: response.value });
          toastService.error("Error creating contribution");
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
    setValue("status", "completed");
    setValue("paymentMode", "online");
    setValue("isApproved", true);
    setValue("contribution.purpose", "general_donation");
    setValue("contribution.description", "General donation");
    setValue("source", "website");
    setValue("currency", "AUD");
    
    setPaymentMode({ value: "online", label: "Online" });
    setStatus({ value: "completed", label: "Completed" });
    setCurrency({ value: "AUD", label: "AUD" });
    setPurpose({ value: "general_donation", label: "General Donation" });
    setSource({ value: "website", label: "Website" });
    setIsApproved({ value: true, label: "Yes" });
    setManualMethod(undefined);
    
    dispatch(clearUpdate());
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto p-4 bg-primary-foreground dark:bg-gray-900 shadow-lg rounded-lg grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <div className="col-span-1 lg:col-span-2">
        <Label htmlFor="amount" className="required">
          Amount
        </Label>
        <Input
          id="amount"
          type="number"
          {...register("amount", { valueAsNumber: true })}
          placeholder="Enter amount"
          className={`w-full ${errors.amount ? "border-red-500" : ""}`}
        />
        {errors.amount && (
          <p className="text-red-500 text-sm">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select
          id="currency"
          options={currencyOptions}
          value={currency}
          onChange={handleCurrencyChange}
          classNamePrefix="select"
        />
        {errors.currency && (
          <p className="text-red-500 text-sm">{errors.currency.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="status" className="required">
          Status
        </Label>
        <Select
          id="status"
          options={statusOptions}
          value={status}
          onChange={handleStatusChange}
          classNamePrefix="select"
        />
        {errors.status && (
          <p className="text-red-500 text-sm">{errors.status.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="paymentMode" className="required">
          Payment Mode
        </Label>
        <Select
          id="paymentMode"
          options={paymentModeOptions}
          value={paymentMode}
          onChange={handlePaymentModeChange}
          classNamePrefix="select"
        />
        {errors.paymentMode && (
          <p className="text-red-500 text-sm">{errors.paymentMode.message}</p>
        )}
      </div>

      {watch("paymentMode") === "offline" && (
        <>
          <div>
            <Label htmlFor="manualMethod">Manual Method</Label>
            <Select
              id="manualMethod"
              options={manualMethodOptions}
              value={manualMethod}
              onChange={handleManualMethodChange}
              classNamePrefix="select"
            />
            {errors.manualMethod && (
              <p className="text-red-500 text-sm">{errors.manualMethod.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="transactionReference">Transaction Reference</Label>
            <Input
              id="transactionReference"
              {...register("transactionReference")}
              placeholder="Cheque no, UTR, etc."
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              type="date"
              id="paymentDate"
              {...register("paymentDate")}
              className="w-full"
            />
          </div>

          <div className="col-span-1 lg:col-span-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              {...register("remarks")}
              placeholder="Enter remarks"
              className="w-full"
            />
          </div>
        </>
      )}

      {watch("paymentMode") === "online" && (
        <>
          <div>
            <Label htmlFor="paypal_payment_id">PayPal Payment ID</Label>
            <Input
              id="paypal_payment_id"
              {...register("paypal_payment_id")}
              placeholder="Enter PayPal payment ID"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="paypal_order_id">PayPal Order ID</Label>
            <Input
              id="paypal_order_id"
              {...register("paypal_order_id")}
              placeholder="Enter PayPal order ID"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="paypal_payer_id">PayPal Payer ID</Label>
            <Input
              id="paypal_payer_id"
              {...register("paypal_payer_id")}
              placeholder="Enter PayPal payer ID"
              className="w-full"
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="name">Payer Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter payer name"
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          {...register("email")}
          placeholder="Enter payer email"
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="phNo">Phone Number</Label>
        <Input
          id="phNo"
          {...register("phNo")}
          placeholder="Enter payer phone number"
          className="w-full"
        />
      </div>

      <div className="col-span-1 lg:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Enter payer address"
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="purpose">Contribution Purpose</Label>
        <Select
          id="purpose"
          options={purposeOptions}
          value={purpose}
          onChange={handlePurposeChange}
          classNamePrefix="select"
        />
        {errors.contribution?.purpose && (
          <p className="text-red-500 text-sm">{errors.contribution.purpose.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="source">Source</Label>
        <Select
          id="source"
          options={sourceOptions}
          value={source}
          onChange={handleSourceChange}
          classNamePrefix="select"
        />
        {errors.source && (
          <p className="text-red-500 text-sm">{errors.source.message}</p>
        )}
      </div>

      <div>
        <Label>Approved</Label>
        <Select
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" }
          ]}
          value={isApproved}
          onChange={handleApprovalChange}
          classNamePrefix="select"
        />
      </div>

      <div className="flex justify-between col-span-1 lg:col-span-2">
        <Button onClick={clear} className="bg-slate-400 hover:bg-slate-500">
          {paymentId ? "Cancel" : "Clear"}
        </Button>
        <Button
          className={isSending ? "cursor-not-allowed opacity-50" : ""}
          type="submit"
        >
          {paymentId ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;