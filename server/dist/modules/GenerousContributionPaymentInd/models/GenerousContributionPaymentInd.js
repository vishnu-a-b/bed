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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerousContributionPaymentInd = exports.generousContributionPaymentIndFilterFields = void 0;
// server/src/modules/GenerousContributionPaymentInd/models/GenerousContributionPaymentInd.ts
const mongoose_1 = __importDefault(require("mongoose"));
// CounterGIN schema for auto-incrementing receipt numbers
const counterGINSchema = new mongoose_1.default.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});
const CounterGIN = mongoose_1.default.model('CounterGIN', counterGINSchema);
const generousContributionPaymentIndSchema = new mongoose_1.default.Schema({
    // Receipt Number (auto-increment)
    receiptNumber: { type: String, unique: true },
    // Razorpay Order/Payment IDs - NO unique constraints here
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    // Razorpay Response Data (Complete response objects)
    razorpay_order_response: { type: Object }, // Full order creation response
    razorpay_payment_response: { type: Object }, // Full payment response
    razorpay_refund_response: { type: Object }, // Full refund response (if applicable)
    // Payer Information
    name: { type: String },
    phNo: { type: String },
    email: { type: String },
    address: { type: String },
    payer: {
        email_address: { type: String },
        name: {
            given_name: { type: String },
            surname: { type: String }
        },
        phone: {
            phone_number: { type: String }
        },
        address: {
            country_code: { type: String },
            address_line_1: { type: String },
            state: { type: String },
            city: { type: String },
            postal_code: { type: String }
        }
    },
    // Payment Amount Details
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    // Razorpay Fee Information
    razorpay_fee: {
        amount: { type: Number },
        currency: { type: String }
    },
    net_amount: { type: Number }, // Amount after Razorpay fees
    // Payment Status
    status: {
        type: String,
        required: true,
        enum: ["pending", "completed", "failed", "cancelled", "refunded", "partially_refunded"],
        default: "pending"
    },
    // Razorpay specific status
    razorpay_status: { type: String }, // created, authorized, captured, failed, etc.
    // Contribution details (minimal since no frontend data)
    contribution: {
        purpose: {
            type: String,
            default: "general_donation",
            enum: ["general_donation", "medical_assistance", "education_support", "emergency_fund", "other"]
        },
        description: { type: String, default: "General donation" }
    },
    // Payment timestamps
    paymentDate: { type: Date, default: Date.now },
    razorpay_created_at: { type: Number }, // Razorpay's create timestamp (Unix)
    // Approval system (for manual verification if needed)
    isApproved: { type: Boolean, default: true }, // Auto-approve Razorpay payments
    approvedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    approvedAt: { type: Date },
    // Manual payment fields (for offline payments)
    paymentMode: {
        type: String,
        enum: ["online", "offline"],
        default: "online",
    },
    manualMethod: {
        type: String,
        enum: ["cash", "cheque", "bank_transfer", "other"],
    },
    transactionReference: { type: String },
    remarks: { type: String },
    recordedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    // Source tracking
    source: {
        type: String,
        enum: ["website", "mobile_app", "social_media", "email_campaign", "other"],
        default: "website"
    },
    // Error tracking
    error_details: {
        error_code: { type: String },
        error_message: { type: String },
        error_description: { type: String }
    },
    // Additional metadata
    notes: { type: Object }, // Any additional notes
    ip_address: { type: String }, // User's IP address
    user_agent: { type: String }, // User's browser/device info
}, { timestamps: true });
// Pre-save middleware to generate receipt number
generousContributionPaymentIndSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew && !this.receiptNumber) {
            try {
                const counterGIN = yield CounterGIN.findByIdAndUpdate('generous_contribution_ind_receipt', { $inc: { seq: 1 } }, { new: true, upsert: true });
                // Format: GCI-YYYY-000001 (GCI = Generous Contribution India)
                const currentYear = new Date().getFullYear();
                this.receiptNumber = `GCI-${currentYear}-${counterGIN.seq.toString().padStart(6, '0')}`;
            }
            catch (error) {
                return next(error);
            }
        }
        next();
    });
});
// Virtual for full payer name
generousContributionPaymentIndSchema.virtual('payer.full_name').get(function () {
    var _a;
    if ((_a = this.payer) === null || _a === void 0 ? void 0 : _a.name) {
        return `${this.payer.name.given_name || ''} ${this.payer.name.surname || ''}`.trim();
    }
    return '';
});
exports.generousContributionPaymentIndFilterFields = {
    filterFields: [
        "status",
        "razorpay_status",
        "currency",
        "paymentMode",
        "contribution.purpose",
        "payer.email_address",
        "source",
        "isApproved",
        "paymentDate",
        "recordedBy",
        "approvedBy",
        "receiptNumber"
    ],
    searchFields: [
        "name",
        "phNo",
        "amount"
    ],
    sortFields: ["createdAt", "amount", "paymentDate", "payer.name.given_name", "receiptNumber"],
};
exports.GenerousContributionPaymentInd = mongoose_1.default.model("GenerousContributionPaymentInd", generousContributionPaymentIndSchema);
