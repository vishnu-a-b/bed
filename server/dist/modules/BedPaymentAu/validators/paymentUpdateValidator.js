"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentUpdateValidator = void 0;
const express_validator_1 = require("express-validator");
exports.paymentUpdateValidator = [
    (0, express_validator_1.body)("amount")
        .optional()
        .isNumeric()
        .withMessage("amount must be a number"),
];
