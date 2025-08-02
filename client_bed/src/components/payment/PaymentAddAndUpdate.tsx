import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toastService from "@/utils/toastService";
import { fetchBed, fetchSingleData, fetchSupporter } from "@/utils/api/fetchData";
import Select from "react-select";
import { update } from "@/utils/api/updateData";
import { create } from "@/utils/api/create";
import AsyncSelect from "react-select/async";
import { useDispatch } from "react-redux";
import { clearUpdate } from "@/lib/slice/updateSlice";
import { deleteData } from "@/utils/api/delete";

const paymentSchema = z.object({
  razorpay_payment_id: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  amount: z.number().min(1, { message: "Amount must be positive" }),
  currency: z.enum(["INR", "AUD"]).default("INR"),
  status: z.string().min(1, { message: "Status is required" }),
  method: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  contact: z.string().optional(),
  created_at: z.number().optional(),
  notes: z.any().optional(),
  paymentMode: z.enum(["online", "offline"]).default("online"),
  manualMethod: z.enum(["cash", "cheque", "upi", "bank_transfer"]).optional(),
  transactionReference: z.string().optional(),
  paymentDate: z.string().optional(),
  remarks: z.string().optional(),
  recordedBy: z.string().optional(),
  supporter: z.string().min(1, { message: "Supporter is required" }),
  bed: z.string().min(1, { message: "Bed is required" }),
  isVerified: z.boolean().default(false),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PaymentForm = ({ paymentId }: { paymentId?: string }) => {
  const statusOptions = [
    { value: "captured", label: "Captured" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
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
  ];

  const currencyOptions = [
    { value: "INR", label: "INR" },
    { value: "AUD", label: "AUD" },
  ];

  const verificationOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const dispatch = useDispatch();
  const [bed, setBed] = useState<any>();
  const [supporter, setSupporter] = useState<any>();
  const [paymentMode, setPaymentMode] = useState<any>({
    value: "online",
    label: "Online",
  });
  const [manualMethod, setManualMethod] = useState<any>();
  const [status, setStatus] = useState<any>({
    value: "captured",
    label: "Captured",
  });
  const [currency, setCurrency] = useState<any>({
    value: "INR",
    label: "INR",
  });
  const [isVerified, setIsVerified] = useState<any>({
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
  });

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (paymentId) {
      const fetchDetails = async () => {
        try {
          const items: any = await fetchSingleData(paymentId, "payment");
          const data = items.items;
          
          setValue("razorpay_payment_id", data.razorpay_payment_id || "");
          setValue("razorpay_order_id", data.razorpay_order_id || "");
          setValue("razorpay_signature", data.razorpay_signature || "");
          setValue("amount", data.amount);
          setValue("currency", data.currency || "INR");
          setValue("status", data.status);
          setValue("method", data.method || "");
          setValue("email", data.email || "");
          setValue("contact", data.contact || "");
          setValue("created_at", data.created_at);
          setValue("notes", data.notes || {});
          setValue("paymentMode", data.paymentMode || "online");
          setValue("manualMethod", data.manualMethod || undefined);
          setValue("transactionReference", data.transactionReference || "");
          setValue("paymentDate", data.paymentDate?.split('T')[0] || "");
          setValue("remarks", data.remarks || "");
          setValue("supporter", data.supporter._id);
          setValue("bed", data.bed._id);
          setValue("isVerified", data.isVerified || false);

          setStatus({
            value: data.status,
            label: data.status.charAt(0).toUpperCase() + data.status.slice(1),
          });

          setPaymentMode({
            value: data.paymentMode || "online",
            label: data.paymentMode === "offline" ? "Offline" : "Online",
          });

          setCurrency({
            value: data.currency || "INR",
            label: data.currency || "INR",
          });

          if (data.manualMethod) {
            setManualMethod({
              value: data.manualMethod,
              label: data.manualMethod.charAt(0).toUpperCase() + data.manualMethod.slice(1),
            });
          }

          setIsVerified({
            value: data.isVerified || false,
            label: data.isVerified ? "Yes" : "No",
          });

          setBed({
            label: data.bed.bedNo,
            id: data.bed._id,
          });

          setSupporter({
            label: data.supporter.name,
            id: data.supporter._id,
          });
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

  const handleVerificationChange = (selectedOption: any) => {
    setIsVerified(selectedOption);
    setValue("isVerified", selectedOption.value);
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
        const response = await update(paymentData, "payment", paymentId);
        if (response._id) {
          toastService.success("Payment updated successfully");
        } else {
          setError(response.id, { message: response.value });
          toastService.error("Error updating payment");
        }
      } else {
        const response = await create("payment", paymentData);
        if (response._id) {
          toastService.success("Payment created successfully");
          clear();
        } else {
          setError(response.id, { message: response.value });
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
    setValue("status", "captured");
    setValue("paymentMode", "online");
    setValue("supporter", "");
    setValue("bed", "");
    setValue("isVerified", false);
    setBed(undefined);
    setSupporter(undefined);
    setPaymentMode({ value: "online", label: "Online" });
    setStatus({ value: "captured", label: "Captured" });
    setCurrency({ value: "INR", label: "INR" });
    setIsVerified({ value: false, label: "No" });
    dispatch(clearUpdate());
  };

  const loadBedOptions = async (inputValue: string) => {
    const response = await fetchBed(inputValue);
    const data: any[] = response.items;

    return data.map((bed: any) => ({
      id: bed._id,
      label: bed.bedNo,
    }));
  };

  const loadSupporterOptions = async (inputValue: string) => {
    const response = await fetchSupporter(inputValue);
    const data: any[] = response.items;

    return data.map((supporter: any) => ({
      id: supporter._id,
      label: supporter.name,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-lg mx-auto p-4 bg-primary-foreground dark:bg-gray-900 shadow-lg rounded-lg grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <div className="col-span-1 lg:col-span-2">
        <Label htmlFor="amount" className="required">
          Amount (in paise)
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
            <Label htmlFor="razorpay_payment_id">Razorpay Payment ID</Label>
            <Input
              id="razorpay_payment_id"
              {...register("razorpay_payment_id")}
              placeholder="Enter Razorpay payment ID"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="razorpay_order_id">Razorpay Order ID</Label>
            <Input
              id="razorpay_order_id"
              {...register("razorpay_order_id")}
              placeholder="Enter Razorpay order ID"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="razorpay_signature">Razorpay Signature</Label>
            <Input
              id="razorpay_signature"
              {...register("razorpay_signature")}
              placeholder="Enter Razorpay signature"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="method">Payment Method</Label>
            <Input
              id="method"
              {...register("method")}
              placeholder="e.g., UPI, Card, Netbanking"
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
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              {...register("contact")}
              placeholder="Enter payer contact"
              className="w-full"
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="supporter" className="required">
          Supporter
        </Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadSupporterOptions}
          defaultOptions
          value={supporter}
          onChange={(selectedOption: any) => {
            setSupporter(selectedOption);
            setValue("supporter", selectedOption?.id);
          }}
          classNamePrefix="select"
          required
          isClearable
        />
        {errors.supporter && (
          <p className="text-red-500 text-sm">{errors.supporter.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="bed" className="required">
          Bed
        </Label>
        <AsyncSelect
          cacheOptions
          loadOptions={loadBedOptions}
          defaultOptions
          value={bed}
          onChange={(selectedOption: any) => {
            setBed(selectedOption);
            setValue("bed", selectedOption?.id);
          }}
          classNamePrefix="select"
          required
          isClearable
        />
        {errors.bed && (
          <p className="text-red-500 text-sm">{errors.bed.message}</p>
        )}
      </div>

      <div>
        <Label>Verified</Label>
        <Select
          options={verificationOptions}
          value={isVerified}
          onChange={handleVerificationChange}
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