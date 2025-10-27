"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.paymentFilterFields = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    razorpay_payment_id: { type: String, unique: true, sparse: true },
    razorpay_order_id: { type: String },
    razorpay_signature: { type: String },
    amount: { type: Number, required: true }, // In paise
    currency: { type: String, default: "INR" },
    status: { type: String, required: true }, // e.g. captured, failed, pending
    method: { type: String }, // online: card/upi/etc., offline: cash/cheque/etc.
    email: { type: String },
    contact: { type: String },
    created_at: { type: Number }, // Unix timestamp from Razorpay
    notes: { type: Object }, // Razorpay notes object (can store metadata)
    // NEW: Universal payment mode - online or offline
    paymentMode: {
        type: String,
        enum: ["online", "offline"],
        default: "online",
    },
    // NEW: Offline method details (only if paymentMode === 'offline')
    manualMethod: {
        type: String,
        enum: ["cash", "cheque", "upi", "bank_transfer"],
    },
    transactionReference: {
        type: String, // cheque number, bank UTR, etc.
    },
    paymentDate: {
        type: Date, // for manual payments
    },
    remarks: {
        type: String,
    },
    recordedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: false, // User who recorded the payment
    },
    // App references
    supporter: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Supporter",
        required: true,
    },
    bed: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Bed",
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.paymentFilterFields = {
    filterFields: [
        "supporter",
        "bed",
        "status",
        "currency",
        "paymentMode",
        "manualMethod",
        "recordedBy",
    ],
    searchFields: [
        "razorpay_payment_id",
        "razorpay_order_id",
        "transactionReference",
    ],
    sortFields: ["createdAt", "amount", "paymentDate"],
};
exports.Payment = mongoose_1.default.model("Payment", paymentSchema);
