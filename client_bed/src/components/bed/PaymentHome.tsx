"use client";
import React, { useState } from "react";
import ViewPayments from "./ViewPayments";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";
import { RootState } from "@/lib/store";
import { clearPaymentId, setPaymentId } from "@/lib/slice/paymentSlice";

import { clearUpdate } from "@/lib/slice/updateSlice";
import PaymentForm from "./PaymentForm";
// import PaymentForm from "./GcPaymentAuAddAndUpdate";


export default function PaymentHome() {
  const [showViewPayments, setShowViewPayments] = useState(true);
  const dispatch = useDispatch();
  const url: string | null = useSelector((state: RootState) => state.update.url);
  const id: string | null = useSelector((state: RootState) => state.update.id);
  
  const toggleView = () => {
    dispatch(clearPaymentId());
    dispatch(clearUpdate());
    setShowViewPayments(!showViewPayments);
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex justify-between">
        <h1 className="text-lg font-semibold mb-2 text-bg2 flex justify-start">
          Payments
        </h1>
        {url === 'payment' ? (
          ""
        ) : (
          <Button
            onClick={toggleView}
            className="py-2 px-4 rounded-md hover:bg-bg2"
          >
            {showViewPayments ? "Add Payment" : "View Payments"}
          </Button>
        )}
      </div>
      {url === 'payment' ? (
       id && <div></div>
      ) : showViewPayments ? (
        <ViewPayments />
      ) : (
        <PaymentForm />
      )}
    </div>
  );
}