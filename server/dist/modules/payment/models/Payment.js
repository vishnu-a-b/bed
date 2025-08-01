"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.paymentFilterFields = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    // PayPal specific fields
    paypal_payment_id: { type: String, unique: true, sparse: true },
    paypal_order_id: { type: String },
    paypal_payer_id: { type: String },
    paypal_payment_status: { type: String }, // COMPLETED, PENDING, FAILED, etc.
    amount: { type: Number, required: true }, // In actual currency units (not cents/paise)
    currency: { type: String, default: "USD" }, // PayPal supports multiple currencies
    status: { type: String, required: true }, // captured, failed, pending
    method: { type: String }, // online: paypal, offline: cash/cheque/etc.
    email: { type: String },
    contact: { type: String },
    created_at: { type: Number }, // Unix timestamp
    notes: { type: Object }, // Custom notes object for metadata
    // Universal payment mode - online or offline
    paymentMode: {
        type: String,
        enum: ["online", "offline"],
        default: "online",
    },
    // Offline method details (only if paymentMode === 'offline')
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
    // PayPal specific additional fields
    paypal_transaction_fee: { type: Number }, // PayPal transaction fee
    paypal_net_amount: { type: Number }, // Amount after PayPal fees
    paypal_exchange_rate: { type: Number }, // If currency conversion occurred
}, { timestamps: true });
exports.paymentFilterFields = {
    filterFields: [
        "supporter",
        "bed",
        "status",
        "currency",
        "paymentMode",
        "manualMethod",
        "paymentDate",
        "recordedBy",
        "paypal_payment_status",
    ],
    searchFields: [
        "paypal_payment_id",
        "paypal_order_id",
        "paypal_payer_id",
        "transactionReference",
    ],
    sortFields: ["createdAt", "amount", "paymentDate"],
};
exports.Payment = mongoose_1.default.model("Payment", paymentSchema);
