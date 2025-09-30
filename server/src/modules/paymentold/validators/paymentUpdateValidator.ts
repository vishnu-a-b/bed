import { body } from "express-validator";
import { Bed } from "../../bed/models/Bed";
import { Supporter } from "../../supporter/models/Supporter";

export const paymentUpdateValidator = [
  body("bed").optional().custom(async (bedId: any) => {
    try {
      const bed = await Bed.findById(bedId);
      if (!bed) {
        return Promise.reject("bed not found");
      }
      return Promise.resolve();
    } catch (_) {
      return Promise.reject();
    }
  }),

  body("supporter").optional().custom(async (supporterId: any) => {
    try {
      const supporter = await Supporter.findById(supporterId);
      if (!supporter) {
        return Promise.reject("supporter not found");
      }
      return Promise.resolve();
    } catch (_) {
      return Promise.reject();
    }
  }),

  body("status")
    .optional()
    .isIn(["created", "authorized", "captured", "failed", "refunded"])
    .withMessage("Invalid payment status"),

  // body("method")
  //   .optional()
  //   .isIn(["card", "netbanking", "upi", "wallet", "emi"])
  //   .withMessage("Invalid payment method"),

  body("amount")
    .optional()
    .isNumeric()
    .withMessage("amount must be a number"),
];
