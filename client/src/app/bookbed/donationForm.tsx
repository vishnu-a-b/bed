import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DonationForm() {
  const [donorType, setDonorType] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Make a Donation
      </h2>

      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
            Donor Type
          </Label>
          <Select onValueChange={setDonorType} value={donorType}>
            <SelectTrigger className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indi" className="cursor-pointer">
                Individual
              </SelectItem>
              <SelectItem value="org" className="cursor-pointer">
                Organisation
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label
              htmlFor="first-name"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              First Name
            </Label>
            <Input
              id="first-name"
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="John"
            />
          </div>
          <div>
            <Label
              htmlFor="middle-name"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Middle Name
            </Label>
            <Input
              id="middle-name"
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="A."
            />
          </div>
          <div>
            <Label
              htmlFor="last-name"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Last Name
            </Label>
            <Input
              id="last-name"
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Phone Number
            </Label>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-1/3 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ind">+91 India</SelectItem>
                  <SelectItem value="aus">+61 Australia</SelectItem>
                  <SelectItem value="usa">+1 USA</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phone"
                className="flex-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Phone number"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 mb-1 block"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="example@email.com"
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="amount"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Donation Amount
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-6 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="0.00"
            />
          </div>
          <div className="mt-3 flex gap-2">
            {["10", "25", "50", "100"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  amount === preset
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 shadow-md hover:shadow-lg">
            Complete Donation
          </Button>
          <p className="text-xs text-center mt-3 text-gray-500">
            Your donation helps us make a difference. Thank you for your
            support!
          </p>
        </div>
      </div>
    </div>
  );
}
