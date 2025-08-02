"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import toastService from "@/utils/toastService";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const supporterSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  mobileNo: z
    .string()
    .min(8, { message: "Phone number with country code is required" })
    .regex(/^\d+$/, { message: "Invalid phone number format" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().optional(),
  type: z.enum(["Individual", "Organization"]),
  amount: z.number().min(1, { message: "Amount must be at least 1" }),
  nameVisible: z.boolean().default(true),
  panNo: z.string().optional(),
});

type SupporterFormData = z.infer<typeof supporterSchema>;

const DonationForm = ({ bed }: { bed?: any }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [isSending, setIsSending] = useState(false);
  const [showPanField, setShowPanField] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [supporterId, setSupporterId] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SupporterFormData>({
    resolver: zodResolver(supporterSchema),
    defaultValues: {
      type: "Individual",
      nameVisible: true,
      amount: bed?.fixedAmount > 0 ? bed.fixedAmount : 0,
    },
  });

  const type = watch("type");
  const nameVisible = watch("nameVisible");
  const amount = watch("amount");

  const onSubmit = async (data: SupporterFormData) => {
    setIsSending(true);
    try {
      const userData = {
        name: data.name,
        mobileNo: data.mobileNo,
        password: `User@${data.mobileNo}`,
        ...(data.email && { email: data.email }),
      };

      const response1 = await axios.post(`${API_URL}/user`, userData);
      if (response1.data.success) {
        const supporterData = {
          user: response1.data.data._id,
          name: data.name,
          bed: bed?.bedId,
          amount: bed?.fixedAmount > 0 ? bed.fixedAmount : data.amount,
          type: data.type,
          role: "regular-supporter",
          nameVisible: data.nameVisible,
          ...(data.panNo && { panNo: data.panNo }),
        };

        const response = await axios.post(
          `${API_URL}/supporter`,
          supporterData
        );
        if (response.data.success) {
          toastService.success("Thank you for your Support");
          setSupporterId(response.data.data._id);
          reset();
          setShowPanField(false);
          setShowSuccessModal(true);
        } else {
          toastService.error("Error creating supporter");
        }
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toastService.error(
        error.response?.data?.message || "Error submitting form"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleMakePayment = () => {
    // Close both modals
    setShowSuccessModal(false);
    // You can add payment logic here
  };

  const handleGoToPortal = () => {
    window.open(`${window.location.origin}/supporter?supporter=${supporterId}`, '_blank');
    setShowSuccessModal(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Support Bed</h2>

        {bed?.fixedAmount && bed?.fixedAmount > 0 && (
          <div>
            <div className="text-lg font-semibold mb-2 border border-dotted border-blue-500 p-3 rounded">
              Monthly Support Amount: {bed?.currency} {bed?.fixedAmount}
            </div>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium text-gray-700 block">
            Supporter Type
          </Label>
          <Select
            onValueChange={(value: "Individual" | "Organization") =>
              setValue("type", value)
            }
            value={type}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Organization">Organization</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="name" className="block font-medium required">
            Name
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter name"
            className={errors.name ? "border-red-500 w-full" : "w-full"}
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="nameVisible"
            checked={nameVisible}
            onCheckedChange={(checked) => setValue("nameVisible", !!checked)}
          />
          <Label htmlFor="nameVisible">Do you want to display your name?</Label>
        </div>

        <div>
          <Label htmlFor="mobileNo" className="block font-medium required">
            Phone Number
          </Label>
          <PhoneInput
            country={bed?.currency === "INR" ? "in" : "au"}
            inputProps={{
              name: "mobileNo",
              required: true,
            }}
            value={watch("mobileNo")}
            onChange={(value) => setValue("mobileNo", value)}
            inputClass={errors.mobileNo ? "border-red-500 w-full" : "w-full"}
            containerClass="w-full"
          />
          {errors.mobileNo && (
            <p className="text-red-500 text-sm mt-1">
              {errors.mobileNo.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="block font-medium required">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="example@email.com"
            className={errors.email ? "border-red-500 w-full" : "w-full"}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {(!bed?.fixedAmount || bed?.fixedAmount === 0) && (
          <div>
            <Label htmlFor="amount" className="block font-medium">
              Donation Amount
            </Label>
            <Input
              id="amount"
              type="number"
              {...register("amount", { valueAsNumber: true })}
              placeholder="0.00"
              className={errors.amount ? "border-red-500 w-full" : "w-full"}
              required
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="address" className="block font-medium">
            Address (Optional)
          </Label>
          <textarea
            id="address"
            {...register("address")}
            placeholder="Enter address"
            className={
              (errors.address ? "border-red-500 " : "") +
              "w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            }
            rows={3}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {showPanField && (
          <div>
            <Label htmlFor="panNo" className="block font-medium">
              PAN Number (Required for tax exemption)
            </Label>
            <Input
              id="panNo"
              {...register("panNo")}
              placeholder="Enter PAN number"
              className={errors.panNo ? "border-red-500 w-full" : "w-full"}
            />
            {errors.panNo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.panNo.message}
              </p>
            )}
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700"
            disabled={isSending}
          >
            {isSending ? "Processing..." : "Submit"}
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Thank You for Your Support!</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="text-center">
              <p>Your support has been successfully registered.</p>
            </div>
            <div className="flex flex-col space-y-3">
              {/* <Button
                onClick={handleMakePayment}
                className="w-full py-3 bg-green-600 hover:bg-green-700"
              >
                Make This Month's Payment
              </Button> */}
              <Button
                onClick={handleGoToPortal}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white"
                variant="outline"

              >
                Go to Your Portal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DonationForm;