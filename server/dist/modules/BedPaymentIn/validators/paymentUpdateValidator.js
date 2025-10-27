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
exports.paymentUpdateValidator = void 0;
const express_validator_1 = require("express-validator");
const Bed_1 = require("../../bed/models/Bed");
const Supporter_1 = require("../../supporter/models/Supporter");
exports.paymentUpdateValidator = [
    (0, express_validator_1.body)("bed").optional().custom((bedId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const bed = yield Bed_1.Bed.findById(bedId);
            if (!bed) {
                return Promise.reject("bed not found");
            }
            return Promise.resolve();
        }
        catch (_) {
            return Promise.reject();
        }
    })),
    (0, express_validator_1.body)("supporter").optional().custom((supporterId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const supporter = yield Supporter_1.Supporter.findById(supporterId);
            if (!supporter) {
                return Promise.reject("supporter not found");
            }
            return Promise.resolve();
        }
        catch (_) {
            return Promise.reject();
        }
    })),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["created", "authorized", "captured", "failed", "refunded"])
        .withMessage("Invalid payment status"),
    // body("method")
    //   .optional()
    //   .isIn(["card", "netbanking", "upi", "wallet", "emi"])
    //   .withMessage("Invalid payment method"),
    (0, express_validator_1.body)("amount")
        .optional()
        .isNumeric()
        .withMessage("amount must be a number"),
];
