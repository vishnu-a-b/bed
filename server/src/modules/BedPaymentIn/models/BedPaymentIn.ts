// server/src/modules/BedPaymentIn/models/BedPaymentIn.ts
import mongoose from "mongoose";

// Counter schema for auto-incrementing receipt numbers
const counterBedIndSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const CounterBedInd = mongoose.model("CounterBedInd", counterBedIndSchema);

const BedPaymentIndSchema = new mongoose.Schema(
  {
    // Receipt Number (auto-increment)
    receiptNumber: { type: String, unique: true },

    // Razorpay Payment IDs
    razorpay_payment_id: { type: String, unique: true, sparse: true },
    razorpay_order_id: { type: String },
    razorpay_signature: { type: String },

    // Razorpay Response Data (Complete response objects)
    razorpay_order_response: { type: Object }, // Full order creation response
    razorpay_payment_response: { type: Object }, // Full payment response
    razorpay_refund_response: { type: Object }, // Full refund response (if applicable)

    // Denormalized search fields
    searchFields: {
      supporterName: { type: String }, // Copy from supporter.name
      supporterMobile: { type: String }, // Copy from supporter.user.mobileNo
      bedNumber: { type: String }, // Copy from bed.bedNo
      supporterEmail: { type: String }, // Copy from supporter.email
    },

    // References
    supporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supporter",
      required: true,
    },
    bed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
      required: false,
    },

    // Payer Information (from manual entry or Razorpay)
    name: { type: String },
    phNo: { type: String },
    email: { type: String },
    address: { type: String },

    // Payment Amount Details
    amount: { type: Number, required: true }, // In paise for Razorpay
    currency: { type: String, default: "INR" },

    // Razorpay Fee Information
    razorpay_fee: {
      amount: { type: Number }, // In paise
      currency: { type: String },
    },
    net_amount: { type: Number }, // Amount after Razorpay fees (in paise)

    // Payment Status
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "completed",
        "captured",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
    },

    // Razorpay specific status
    razorpay_status: { type: String }, // created, authorized, captured, failed, etc.

    // Contribution details
    contribution: {
      purpose: {
        type: String,
        default: "bed_donation",
        enum: [
          "bed_donation",
          "general_donation",
          "medical_assistance",
          "education_support",
          "emergency_fund",
          "other",
        ],
      },
      description: { type: String, default: "Bed donation" },
    },

    // Payment timestamps
    paymentDate: { type: Date, default: Date.now },
    razorpay_created_at: { type: Number }, // Unix timestamp from Razorpay
    razorpay_updated_at: { type: Number }, // Unix timestamp from Razorpay

    // Approval/Verification system
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }, // For manual payments
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    approvedAt: { type: Date },

    // Payment Mode
    paymentMode: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },

    // Manual payment fields (for offline payments)
    manualMethod: {
      type: String,
      enum: ["cash", "cheque", "upi", "bank_transfer", "other"],
    },
    transactionReference: { type: String }, // Cheque number, UTR, etc.
    remarks: { type: String },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Source tracking
    source: {
      type: String,
      enum: [
        "website",
        "mobile_app",
        "social_media",
        "email_campaign",
        "other",
      ],
      default: "website",
    },

    // Error tracking
    error_details: {
      error_code: { type: String },
      error_message: { type: String },
      error_description: { type: String },
      error_source: { type: String },
      error_step: { type: String },
      error_reason: { type: String },
    },

    // Additional metadata
    notes: { type: Object }, // Razorpay notes or custom metadata
    ip_address: { type: String }, // User's IP address
    user_agent: { type: String }, // User's browser/device info
  },
  { timestamps: true }
);

// Pre-save middleware to generate receipt number
BedPaymentIndSchema.pre("save", async function (next) {
  if (this.isNew && !this.receiptNumber) {
    try {
      const counterBedInd = await CounterBedInd.findByIdAndUpdate(
        "bed_ind_receipt",
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      // Format: BEDIND-YYYY-000001
      const currentYear = new Date().getFullYear();
      this.receiptNumber = `BEDIND-${currentYear}-${counterBedInd.seq
        .toString()
        .padStart(6, "0")}`;
    } catch (error: any) {
      return next(error);
    }
  }
  next();
});

export const BedPaymentIndFilterFields = {
  filterFields: [
    "status",
    "razorpay_status",
    "currency",
    "paymentMode",
    "manualMethod",
    "contribution.purpose",
    "source",
    "isVerified",
    "isApproved",
    "paymentDate",
    "recordedBy",
    "approvedBy",
    "receiptNumber",
    "supporter",
    "bed",
  ],
  searchFields: [
    "searchFields.supporterName",
    "searchFields.supporterMobile",
    "searchFields.bedNumber",
    "searchFields.supporterEmail",
    "razorpay_payment_id",
    "razorpay_order_id",
    "transactionReference",
    "receiptNumber",
    "name",
    "phNo",
    "email",
  ],
  sortFields: [
    "createdAt",
    "amount",
    "paymentDate",
    "name",
    "receiptNumber",
  ],
};

export const BedPaymentInd = mongoose.model("BedPaymentInd", BedPaymentIndSchema);
