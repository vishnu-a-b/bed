import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DonationForm from "./donationForm";

export default function CheckoutButton({ selectedBeds }: any) {
  return (
    <div className="space-y-4 mt-10">
      <Dialog>
        <DialogTrigger
          className={`w-full py-4 rounded-xl font-medium transition-all duration-300
                    ${
                      selectedBeds.length > 0
                        ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
          disabled={selectedBeds.length === 0}
        >
          Continue to Checkout
        </DialogTrigger>

        <p className="text-xs text-center text-slate-500 mt-4">
          By continuing, you agree to our terms and conditions
        </p>

        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <DonationForm />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
