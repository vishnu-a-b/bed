// server/src/modules/payment/models/GenerousContributionPayment.ts
import mongoose from "mongoose";

// Counter schema for auto-incrementing receipt numbers
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const generousContributionPaymentSchema = new mongoose.Schema(
  {
    // Receipt Number (auto-increment)
    receiptNumber: { type: String, unique: true },
    
    // PayPal Order/Payment IDs - NO unique constraints here
    paypal_order_id: { type: String },
    paypal_payment_id: { type: String },
    paypal_payer_id: { type: String },
    paypal_capture_id: { type: String },
    
    // PayPal Response Data (Complete response objects)
    paypal_order_response: { type: Object }, // Full order creation response
    paypal_capture_response: { type: Object }, // Full capture response
    paypal_refund_response: { type: Object }, // Full refund response (if applicable)
    
    // PayPal Payer Information (extracted from response)
    name: { type: String },
    phNo: { type: String },
    email: { type: String },
    payer: {
      email_address: { type: String },
      payer_id: { type: String },
      name: {
        given_name: { type: String },
        surname: { type: String }
      },
      phone: {
        phone_type: { type: String },
        phone_number: {
          national_number: { type: String }
        }
      },
      address: {
        country_code: { type: String },
        address_line_1: { type: String },
        admin_area_1: { type: String }, // State
        admin_area_2: { type: String }, // City
        postal_code: { type: String }
      }
    },
    
    // Payment Amount Details
    amount: { type: Number, required: true },
    currency: { type: String, default: "AUD" },
    
    // PayPal Fee Information
    paypal_fee: {
      amount: { type: Number },
      currency: { type: String }
    },
    net_amount: { type: Number }, // Amount after PayPal fees
    
    // Payment Status
    status: { 
      type: String, 
      required: true,
      enum: ["pending", "completed", "failed", "cancelled", "refunded", "partially_refunded"],
      default: "pending"
    },
    
    // PayPal specific status
    paypal_status: { type: String }, // CREATED, APPROVED, COMPLETED, etc.
    
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
    paypal_create_time: { type: String }, // PayPal's create time
    paypal_update_time: { type: String }, // PayPal's update time
    
    // Approval system (for manual verification if needed)
    isApproved: { type: Boolean, default: true }, // Auto-approve PayPal payments
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
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
      debug_id: { type: String } // PayPal debug ID for troubleshooting
    },
    
    // Additional metadata
    notes: { type: Object }, // Any additional notes
    ip_address: { type: String }, // User's IP address
    user_agent: { type: String }, // User's browser/device info
  },
  { timestamps: true }
);

// Pre-save middleware to generate receipt number
generousContributionPaymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.receiptNumber) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'generous_contribution_receipt',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      // Format: GC-YYYY-000001
      const currentYear = new Date().getFullYear();
      this.receiptNumber = `GC-${currentYear}-${counter.seq.toString().padStart(6, '0')}`;
    } catch (error:any) {
      return next(error);
    }
  }
  next();
});

// Virtual for full payer name
generousContributionPaymentSchema.virtual('payer.full_name').get(function() {
  if (this.payer?.name) {
    return `${this.payer.name.given_name || ''} ${this.payer.name.surname || ''}`.trim();
  }
  return '';
});

export const generousContributionPaymentFilterFields = {
  filterFields: [
    "status",
    "paypal_status",
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
    "paypal_payment_id",
    "paypal_order_id",
    "paypal_payer_id",
    "payer.email_address",
    "payer.name.given_name",
    "payer.name.surname",
    "transactionReference",
    "receiptNumber"
  ],
  sortFields: ["createdAt", "amount", "paymentDate", "payer.name.given_name", "receiptNumber"],
};

export const GenerousContributionPayment = mongoose.model(
  "GenerousContributionPayment", 
  generousContributionPaymentSchema
);