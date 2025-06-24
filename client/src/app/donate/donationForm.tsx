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

const supporterSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  mobileNo: z.string().min(1, { message: "Mobile number is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().optional(),
  type: z.enum(["Individual", "Organization"]),
  amount: z.number().min(1, { message: "Amount must be at least 1" }),
  nameVisible: z.boolean().default(true),
  panNo: z.string().optional(),
});

type SupporterFormData = z.infer<typeof supporterSchema>;

const DonationForm = ({ bed }: any) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [isSending, setIsSending] = useState(false);
  const [showPanField, setShowPanField] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SupporterFormData>({
    resolver: zodResolver(supporterSchema),
    defaultValues: {
      type: "Individual",
      nameVisible: true,
    },
  });

  const type = watch("type");
  const nameVisible = watch("nameVisible");

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
          amount: data.amount,
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
          setValue("name", "");
          setValue("mobileNo", "");
          setValue("email", "");
          setValue("amount", 0);
          setValue("type", "Individual");
          setValue("address", "");
          setValue("nameVisible", true);
          setValue("panNo", "");
          setShowPanField(false);
          window.location.reload();
        } else {
          toastService.error("Error");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toastService.error("Error submitting form");
    } finally {
      setIsSending(false);
    }
  };
 console.log("Bed Data:", bed);
  return (
    <div className=" h-[90vh] overflow-scroll">
      <div className="space-y-6 ">
        {/* Supporter Type */}
        <div >
          <Label className="text-sm font-medium text-gray-700  block">
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

        {/* Name */}
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

        {/* Mobile Number */}
        <div>
          <Label htmlFor="mobileNo" className="block payment font-medium required">
            Phone Number
          </Label>
          <Input
            id="mobileNo"
            {...register("mobileNo")}
            placeholder="Enter phone number"
            className={errors.mobileNo ? "border-red-500 w-full" : "w-full"}
            required
          />
          {errors.mobileNo && (
            <p className="text-red-500 text-sm mt-1">
              {errors.mobileNo.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="block  font-medium required">
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

        {/* Donation Amount */}
        <div>
          <Label htmlFor="amount" className="block font-medium">
            Donation Amount 
          </Label>
          <Input
            id="amount"
            type="number"
            {...register("amount", { valueAsNumber: true })}
            placeholder="0.00"
            value={bed.fixedAmount}
            className={errors.amount ? "border-red-500 w-full" : "w-full"}
            required
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="block font-medium">
            Address (Optional)
          </Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Enter address"
            className={errors.address ? "border-red-500 w-full" : "w-full"}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Name Visibility Checkbox */}

        {/* 80G Tax Exemption Toggle */}
        <div>
          <Label className="block mb-1 font-medium ">
            Do you want 80-G Tax Exempted?
          </Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={showPanField ? "default" : "outline"}
              onClick={() => setShowPanField(true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={!showPanField ? "default" : "outline"}
              onClick={() => {
                setShowPanField(false);
                setValue("panNo", "");
              }}
            >
              No
            </Button>
          </div>
        </div>

        {/* PAN Number (conditionally rendered) */}
        {showPanField && (
          <div>
            <Label htmlFor="panNo" className="block  font-medium">
              PAN Number
            </Label>
            <Input
              id="panNo"
              {...register("panNo")}
              placeholder="ABCDE1234F"
              className="w-full"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700"
            disabled={isSending}
            onClick={handleSubmit(onSubmit)}
          >
            {isSending ? "Processing..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DonationForm;
