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
import toastService from "@/utils/toastService";

import axios from "axios";
import { add, set } from "lodash";

const supporterSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  mobileNo: z.string().min(1, { message: "Mobile number is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().optional(),
  type: z.enum(["Individual", "Organization"]),
  amount: z.number().min(1, { message: "Amount must be at least 1" }),
});

type SupporterFormData = z.infer<typeof supporterSchema>;

const DonationForm = ({bed}:any) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [isSending, setIsSending] = useState(false);
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
    },
  });

  const type = watch("type");

  // Load existing data if editing


  const onSubmit = async (data: SupporterFormData) => {
    setIsSending(true);
    try {
      const userData={
        name: data.name,
        mobileNo: data.mobileNo,
        password: `User@${data.mobileNo}`,
        ...(data.email && { email: data.email }),
      }
      
      const response1 = await axios.post(`${API_URL}/user`, userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response1)
      if(response1.data.success){
        const supporterData = {
          user: response1.data.data._id,
          name: data.name,
          bed: bed,
          amount: data.amount,
          type: data.type,
          role: "regular-supporter",
        };
        console.log(supporterData)
        const response = await axios.post(`${API_URL}/supporter`, supporterData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.data.success) {
          toastService.success("Thank you for your Support");
          // Reset form
          setValue("name", "");
          setValue("mobileNo", "");
          setValue("email", "");
          setValue("amount", 0);
          setValue("type", "Individual");
          setValue("address", "");
          window.location.reload();
        } else {
          toastService.error("Error ");
        }
      }
        
     
    } catch (error) {
      console.error("Error submitting form:", error);
      toastService.error("Error submitting form");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="">
      

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
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
          <Label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 mb-1 block required"
          >
            Name
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter name"
            className={`w-full ${errors.name ? "border-red-500" : ""}`}
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="mobileNo"
            className="text-sm font-medium text-gray-700 mb-1 block required"
          >
            Phone Number
          </Label>
          <Input
            id="mobileNo"
            {...register("mobileNo")}
            placeholder="Enter phone number"
            className={`w-full ${errors.mobileNo ? "border-red-500" : ""}`}
            required
          />
          {errors.mobileNo && (
            <p className="text-red-500 text-sm mt-1">{errors.mobileNo.message}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 mb-1 block required"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="example@email.com"
            className={`w-full ${errors.email ? "border-red-500" : ""}`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="amount"
            className="text-sm font-medium text-gray-700 mb-1 block required"
          >
            Donation Amount
          </Label>
          <Input
            id="amount"
            type="number"
            {...register("amount", { valueAsNumber: true })}
            placeholder="0.00"
            className={`w-full ${errors.amount ? "border-red-500" : ""}`}
            required
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>
        <div>
          <Label
            htmlFor="address"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Address (Optional)
          </Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Enter address"
            className={`w-full ${errors.address ? "border-red-500" : ""}`}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        <div className="pt-4">
          <Button
            className="w-full py-3 bg-blue-600 hover:bg-blue-700"
            disabled={isSending}
            onClick={handleSubmit(onSubmit)}
          >
            {isSending
              ? "Processing..."
              : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DonationForm;