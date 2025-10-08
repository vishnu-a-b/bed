import { body } from "express-validator";
import { Supporter } from "../../supporter/models/Supporter"; // Your original supporter model
import { Bed } from "../../bed/models/Bed";
import { Payment } from "../models/Payment";

export const paymentCreateValidator = [
  // body("razorpay_payment_id")
  //   .notEmpty()
  //   .withMessage("razorpay_payment_id is required")
  //   .custom(async (paymentId: string) => {
  //     const existing = await Payment.findOne({ razorpay_payment_id: paymentId });
  //     if (existing) {
  //       return Promise.reject("Payment with this ID already exists");
  //     }
  //     return Promise.resolve();
  //   }),

  // body("razorpay_order_id")
  //   .notEmpty()
  //   .withMessage("razorpay_order_id is required"),

  // body("razorpay_signature")
  //   .notEmpty()
  //   .withMessage("razorpay_signature is required"),

  body("amount")
    .isNumeric()
    .withMessage("amount must be a number")
    .notEmpty()
    .withMessage("amount is required"),

  body("currency")
    .optional()
    .isIn(["INR", "USD", "EUR"])
    .withMessage("currency must be INR, USD or EUR"),

  body("supporter").custom(async (supporterId: string) => {
    const supporter = await Supporter.findById(supporterId);
    if (!supporter) {
      return Promise.reject("supporter not found");
    }
    return Promise.resolve();
  }),

  body("bed").custom(async (bedId: string) => {
    const bed = await Bed.findById(bedId);
    if (!bed) {
      return Promise.reject("bed not found");
    }
    return Promise.resolve();
  }),
];
