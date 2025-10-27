"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentCreateValidator = void 0;
const express_validator_1 = require("express-validator");
const Supporter_1 = require("../../supporter/models/Supporter"); // Your original supporter model
const Bed_1 = require("../../bed/models/Bed");
exports.paymentCreateValidator = [
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
    (0, express_validator_1.body)("amount")
        .isNumeric()
        .withMessage("amount must be a number")
        .notEmpty()
        .withMessage("amount is required"),
    (0, express_validator_1.body)("currency")
        .optional()
        .isIn(["INR", "USD", "EUR"])
        .withMessage("currency must be INR, USD or EUR"),
    (0, express_validator_1.body)("supporter").custom((supporterId) => __awaiter(void 0, void 0, void 0, function* () {
        const supporter = yield Supporter_1.Supporter.findById(supporterId);
        if (!supporter) {
            return Promise.reject("supporter not found");
        }
        return Promise.resolve();
    })),
    (0, express_validator_1.body)("bed").custom((bedId) => __awaiter(void 0, void 0, void 0, function* () {
        const bed = yield Bed_1.Bed.findById(bedId);
        if (!bed) {
            return Promise.reject("bed not found");
        }
        return Promise.resolve();
    })),
];
