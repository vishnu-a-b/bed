"use client";

import React from "react";

export default function page() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Refund Policy of Shanthibhavan Bed Donation Program
      </h2>

      <p className="text-gray-700 dark:text-gray-300 mb-4">
        For all online transactions and credit card payments, in case a request
        is made for refund, we agree to make the refund by reversing the
        transaction through our bank or the payment service provider. The
        charges for the refund would be borne by us in case of wrong deductions
        or error transactions.
      </p>

      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        General Policy:
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Shanthibhavan is committed to ensuring transparency and accountability
        for all donations received under our Bed Donation Program. However, in
        the rare event that your donation is unsatisfactory or has been made in
        error, we are happy to process refunds if:
      </p>
      <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
        <li>you have made an unintentional or duplicate donation</li>
        <li>the transaction amount is incorrect due to a technical error</li>
        <li>there is a clear case of unauthorized or fraudulent transaction</li>
        <li>
          Shanthibhavan is unable to utilize the donation for the intended
          purpose due to unforeseen circumstances
        </li>
      </ul>

      <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
        <strong>Note:</strong> If you believe that an error has occurred in
        processing your donation, please inform us within 7 days of the
        transaction by calling us at{" "}
        <span className="font-semibold">+91 487 66 11 600</span> or
        emailing <span className="font-semibold">office@shanthibhavan.in </span>. Refunds
        will be processed after verification.
      </p>

      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        Refunds:
      </h3>
      <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
        <li>
          Refunds for all eligible cases are issued through the same payment
          method used at the time of donation, except for Cash on Delivery (if
          applicable).
        </li>
        <li>
          <em>
            Refund timelines depend on bank turnaround times and RBI guidelines.
            This may change from time to time.
          </em>
        </li>
        <li>
          <em>
            Refunds will typically be initiated in three business days from our
            end and will be credited to your account in another two to three
            business days. Shanthibhavan will not be liable for any delay caused
            in refunds due to delay by third-party affiliates (including banks),
            in providing information by the donor, technical issues, and other
            reasons beyond its control.
          </em>
        </li>
      </ul>

      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        For Cash on Delivery donations (if applicable):
      </h3>
      <p className="text-gray-700 dark:text-gray-300">
        For donations placed using Cash on Delivery as the payment method,
        refunds can be processed to your bank account via National Electronic
        Funds Transfer (NEFT). You will need to update following information to
        enable us to process a refund to your account like Bank account number,
        IFSC Code, Account holder’s name, Bank branch & Name.
      </p>
    </div>
  );
}
