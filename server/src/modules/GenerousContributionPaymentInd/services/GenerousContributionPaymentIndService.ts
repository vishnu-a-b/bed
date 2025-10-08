// server/src/modules/GenerousContributionPaymentInd/services/GenerousContributionPaymentIndService.ts
import Razorpay from "razorpay";
import crypto from "crypto";
import { GenerousContributionPaymentInd } from "../models/GenerousContributionPaymentInd";
import { Types } from "mongoose";
import DonationReceiptMailer from "../../../services/DonationReceiptMailer";

// Razorpay SDK Configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Type Definitions
type Contributor = {
  email: string;
  name: string;
  phone?: string;
  address?: string;
};

type ContributionPurpose =
  | "general_donation"
  | "medical_assistance"
  | "education_support"
  | "emergency_fund"
  | "other";

type Contribution = {
  purpose: ContributionPurpose;
  description?: string;
};

type PaymentSource =
  | "website"
  | "mobile_app"
  | "social_media"
  | "email_campaign"
  | "other";

type ManualPaymentMethod = "cash" | "cheque" | "bank_transfer" | "other";

type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

interface CreatePaymentParams {
  amount: number;
  currency?: string;
  contributor: Contributor;
  source?: PaymentSource;
  campaign?: string;
}

interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface UpdatePaymentParams {
  id: string;
  updateData: Partial<{
    status: PaymentStatus;
    isApproved: boolean;
    remarks: string;
    notes: Record<string, any>;
  }>;
}

interface ManualPaymentParams extends Omit<CreatePaymentParams, "source"> {
  manualMethod: ManualPaymentMethod;
  transactionReference?: string;
  remarks?: string;
  recordedBy: Types.ObjectId;
}

interface RefundPaymentParams {
  amount?: number;
  reason?: string;
}

interface PaymentPaginationResult {
  payments: (typeof GenerousContributionPaymentInd)[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

interface PaymentDetails {
  orderId: string;
  amount: number;
  currency: string;
  paymentId: Types.ObjectId;
}

interface PaymentVerificationResult {
  payment: typeof GenerousContributionPaymentInd;
  razorpay_response: any;
}

export default class GenerousContributionPaymentIndService {
  createPayment = async (
    params: CreatePaymentParams
  ): Promise<{ success: boolean; data: PaymentDetails }> => {
    const {
      amount,
      currency = "INR",
      contributor,
      source = "website",
    } = params;

    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!contributor.name || !contributor.phone) {
      throw new Error("Contributor name and phone no are required");
    }

    try {
      // Create Razorpay order
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          contributor_name: contributor.name,
          contributor_email: contributor.email,
          contributor_phone: contributor.phone,
        },
      };

      const order = await razorpay.orders.create(options);

      // Create payment record in database
      const payment = await GenerousContributionPaymentInd.create({
        razorpay_order_id: order.id,
        amount,
        currency,
        status: "pending",
        paymentMode: "online",
        name: contributor.name,
        phNo: contributor.phone,
        email: contributor.email,
        address: contributor.address || "",
        paymentDate: new Date(),
        source,
        isApproved: true,
        razorpay_created_at: order.created_at,
        notes: { razorpay_order: order },
      });

      return {
        success: true,
        data: {
          orderId: order.id,
          amount,
          currency,
          paymentId: payment._id,
        },
      };
    } catch (error) {
      console.error("Error creating payment:", error);
      throw new Error("Failed to create payment");
    }
  };

  verifyPayment = async (
    params: VerifyPaymentParams
  ): Promise<{ success: boolean; data: PaymentVerificationResult }> => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

    const payment: any = await GenerousContributionPaymentInd.findOne({
      razorpay_order_id,
    });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    try {
      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        throw new Error("Invalid payment signature");
      }

      // Fetch payment details from Razorpay
      const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

      if (razorpayPayment.status === "captured" || razorpayPayment.status === "authorized") {
        // Update payment record
        payment.razorpay_payment_id = razorpay_payment_id;
        payment.razorpay_signature = razorpay_signature;
        payment.status = "completed";
        payment.isApproved = true;
        payment.razorpay_status = razorpayPayment.status;
        payment.razorpay_payment_response = razorpayPayment;
        payment.notes = { ...payment.notes, razorpay_payment: razorpayPayment };

        // Extract payer information from Razorpay response
        if (razorpayPayment.email) {
          payment.payer = {
            email_address: razorpayPayment.email,
            name: {
              given_name: payment.name?.split(" ")[0] || "",
              surname: payment.name?.split(" ").slice(1).join(" ") || "",
            },
            phone: {
              phone_number: razorpayPayment.contact || payment.phNo,
            },
          };
        }

        await payment.save();

        // Send receipt email after successful payment verification
        try {
          const payerEmail = payment.email;
          const payerName = payment.name;
          const address = payment.address || "";

          if (payerEmail) {
            await DonationReceiptMailer.sendDonationReceiptEmail({
              email: payerEmail,
              name: payerName,
              phoneNo: payment.phNo,
              amount: payment.amount,
              address: address,
              transactionNumber: payment.razorpay_payment_id || payment.razorpay_order_id,
              receiptNumber: payment.receiptNumber,
              date: new Date(payment.paymentDate).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              programName:
                payment.contribution?.description ||
                "Generous Contribution Program (India)",
            });

            console.log(
              `Donation receipt email sent successfully to ${payerEmail}`
            );
          } else {
            console.warn(
              `No email address found for payment ${payment.receiptNumber}`
            );
          }
        } catch (emailError: any) {
          // Log email error but don't fail the payment verification
          console.error("Failed to send donation receipt email:", emailError);

          // Optionally, you could add a flag to retry email sending later
          payment.notes = {
            ...payment.notes,
            email_failed: true,
            email_error: emailError.message,
            email_retry_needed: true,
          };
          await payment.save();
        }

        return {
          success: true,
          data: {
            payment,
            razorpay_response: razorpayPayment,
          },
        };
      }

      throw new Error(
        `Payment verification failed with status: ${razorpayPayment.status}`
      );
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      payment.status = "failed";
      payment.error_details = {
        error_code: error.code || "VERIFICATION_FAILED",
        error_message: error.message,
        error_description: error.description || null,
      };
      await payment.save();
      throw error;
    }
  };

  findPayments = async (
    { limit, skip, filterQuery, sort }: any,
    startDate?: string,
    endDate?: string
  ) => {
    console.log("Service received dates:", startDate, endDate);
    console.log("Service received filterQuery:", filterQuery);

    try {
      limit = limit || 10;
      skip = skip || 0;

      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter = {
          paymentDate: {
            ...(startDate && {
              $gte: new Date(startDate),
            }),
            ...(endDate && {
              $lte: new Date(endDate),
            }),
          },
        };
      }

      const finalFilter = {
        ...filterQuery,
        ...dateFilter,
      };

      console.log("Final filter query:", JSON.stringify(finalFilter, null, 2));

      const payments = await GenerousContributionPaymentInd.find(finalFilter)
        .populate([
          {
            path: "recordedBy",
            select: "name email",
          },
          {
            path: "approvedBy",
            select: "name email",
          },
        ])
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await GenerousContributionPaymentInd.countDocuments(
        finalFilter
      );

      console.log(`Found ${payments.length} payments out of ${total} total`);

      return {
        total,
        limit,
        skip,
        items: payments,
      };
    } catch (error) {
      console.error("Error finding generous contribution payments (India):", error);
      throw error;
    }
  };

  // Payment Statistics Service
  getPaymentStatistics = async () => {
    try {
      const now = new Date();

      // Calculate date ranges
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const todayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      );

      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      console.log("Date ranges:", {
        today: { start: todayStart, end: todayEnd },
        week: { start: weekStart, end: weekEnd },
        month: { start: monthStart, end: monthEnd },
      });

      // Aggregate queries
      const [totalStats, todayStats, weekStats, monthStats] = await Promise.all(
        [
          // Total completed payments
          GenerousContributionPaymentInd.aggregate([
            {
              $match: {
                status: "completed",
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                totalCount: { $sum: 1 },
                avgAmount: { $avg: "$amount" },
              },
            },
          ]),

          // Today's completed payments
          GenerousContributionPaymentInd.aggregate([
            {
              $match: {
                status: "completed",
                paymentDate: {
                  $gte: todayStart,
                  $lte: todayEnd,
                },
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                totalCount: { $sum: 1 },
              },
            },
          ]),

          // This week's completed payments
          GenerousContributionPaymentInd.aggregate([
            {
              $match: {
                status: "completed",
                paymentDate: {
                  $gte: weekStart,
                  $lte: weekEnd,
                },
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                totalCount: { $sum: 1 },
              },
            },
          ]),

          // This month's completed payments
          GenerousContributionPaymentInd.aggregate([
            {
              $match: {
                status: "completed",
                paymentDate: {
                  $gte: monthStart,
                  $lte: monthEnd,
                },
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                totalCount: { $sum: 1 },
              },
            },
          ]),
        ]
      );

      // Format results
      const formatStats = (stats: any[]) => ({
        amount: stats[0]?.totalAmount || 0,
        count: stats[0]?.totalCount || 0,
        avgAmount: stats[0]?.avgAmount || 0,
      });

      const result = {
        total: formatStats(totalStats),
        today: formatStats(todayStats),
        week: formatStats(weekStats),
        month: formatStats(monthStats),
        dateRanges: {
          today: { start: todayStart, end: todayEnd },
          week: { start: weekStart, end: weekEnd },
          month: { start: monthStart, end: monthEnd },
        },
      };

      console.log("Payment statistics result:", result);
      return result;
    } catch (error) {
      console.error("Error getting payment statistics:", error);
      throw error;
    }
  };

  find = async (
    { limit, skip, filterQuery, sort }: any,
    startDate?: string,
    endDate?: string
  ) => {
    console.log("Service received dates:", startDate, endDate);

    try {
      limit = limit ? limit : 10;
      skip = skip ? skip : 0;

      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter = {
          paymentDate: {
            ...(startDate && {
              $gte: (() => {
                const d = new Date(startDate);
                d.setHours(0, 0, 0, 0);
                return d;
              })(),
            }),
            ...(endDate && {
              $lte: (() => {
                const d = new Date(endDate!);
                d.setHours(23, 59, 59, 999);
                return d;
              })(),
            }),
          },
        };
      }

      const finalFilter = {
        ...filterQuery,
        ...dateFilter,
      };

      console.log("Final filter query:", finalFilter);

      const payment = await GenerousContributionPaymentInd.find(finalFilter)
        .populate([
          {
            path: "recordedBy",
            select: "name email",
          },
          {
            path: "approvedBy",
            select: "name email",
          },
        ])
        .sort(sort)
        .limit(limit)
        .skip(skip);

      const total = await GenerousContributionPaymentInd.countDocuments(
        finalFilter
      );

      return {
        total,
        limit,
        skip,
        items: payment,
      };
    } catch (error) {
      console.error("Error finding generous contribution payments (India):", error);
      throw error;
    }
  };

  getAllPayments = async (
    query: Record<string, any> = {},
    options: {
      page?: number;
      limit?: number;
      sort?: string;
      populate?: boolean;
    } = {}
  ): Promise<{ success: boolean; data: PaymentPaginationResult }> => {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      populate = false,
      ...filters
    } = options;

    const skip = (page - 1) * limit;
    let queryBuilder = GenerousContributionPaymentInd.find({
      ...query,
      ...filters,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (populate) {
      queryBuilder = queryBuilder
        .populate("recordedBy", "name email")
        .populate("approvedBy", "name email");
    }

    const payments: any = await queryBuilder.exec();
    const total = await GenerousContributionPaymentInd.countDocuments({
      ...query,
      ...filters,
    });

    return {
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    };
  };

  getPaymentById = async (
    id: string
  ): Promise<{
    success: boolean;
    data: { payment: typeof GenerousContributionPaymentInd };
  }> => {
    const payment: any = await GenerousContributionPaymentInd.findById(id)
      .populate("recordedBy", "name email")
      .populate("approvedBy", "name email");

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      success: true,
      data: { payment },
    };
  };

  updatePayment = async (
    params: UpdatePaymentParams
  ): Promise<{
    success: boolean;
    data: { payment: typeof GenerousContributionPaymentInd };
  }> => {
    const { id, updateData } = params;

    const payment: any = await GenerousContributionPaymentInd.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      success: true,
      data: { payment },
    };
  };

  deletePayment = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const payment = await GenerousContributionPaymentInd.findByIdAndDelete(id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      success: true,
      message: "Payment deleted successfully",
    };
  };

  createManualPayment = async (
    params: ManualPaymentParams
  ): Promise<{
    success: boolean;
    data: { payment: typeof GenerousContributionPaymentInd };
  }> => {
    const {
      amount,
      currency = "INR",
      contributor,
      manualMethod,
      transactionReference,
      remarks,
      recordedBy,
    } = params;

    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const payment: any = await GenerousContributionPaymentInd.create({
      amount,
      currency,
      status: "pending",
      paymentMode: "offline",
      manualMethod,
      transactionReference,
      remarks,
      name: contributor.name,
      phNo: contributor.phone,
      email: contributor.email,
      address: contributor.address,
      paymentDate: new Date(),
      recordedBy,
      isApproved: false,
    });

    return {
      success: true,
      data: { payment },
    };
  };

  approvePayment = async (
    id: string,
    approvedBy: Types.ObjectId
  ): Promise<{
    success: boolean;
    data: { payment: typeof GenerousContributionPaymentInd };
  }> => {
    const payment: any = await GenerousContributionPaymentInd.findById(id);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.paymentMode !== "offline") {
      throw new Error("Only offline payments need approval");
    }

    if (payment.isApproved) {
      throw new Error("Payment is already approved");
    }

    payment.isApproved = true;
    payment.approvedBy = approvedBy;
    payment.approvedAt = new Date();
    payment.status = "completed";

    await payment.save();

    return {
      success: true,
      data: { payment },
    };
  };

  refundPayment = async (
    id: string,
    refundData: RefundPaymentParams
  ): Promise<{
    success: boolean;
    data: { payment: typeof GenerousContributionPaymentInd };
  }> => {
    const payment: any = await GenerousContributionPaymentInd.findById(id);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "completed") {
      throw new Error("Only completed payments can be refunded");
    }

    try {
      if (payment.razorpay_payment_id) {
        const refundAmount = refundData.amount
          ? refundData.amount * 100
          : payment.amount * 100;

        const refund = await razorpay.payments.refund(
          payment.razorpay_payment_id,
          {
            amount: refundAmount,
            notes: {
              reason: refundData.reason || "Refund processed",
            },
          }
        );

        if (refund.status === "processed") {
          payment.status = "refunded";
          payment.razorpay_refund_response = refund;
          await payment.save();
        }
      }

      return {
        success: true,
        data: { payment },
      };
    } catch (error) {
      console.error("Error refunding payment:", error);
      throw error;
    }
  };
}
