// server/src/modules/payment/services/GenerousContributionPaymentService.ts
import paypal from "@paypal/checkout-server-sdk";
import { GenerousContributionPayment } from "../models/GenerousContributionPayment";
import { Types } from "mongoose";
import DonationReceiptMailer from "../../../services/DonationReceiptMailer";

// PayPal SDK Configuration
const environment =
  process.env.NODE_ENV === "production"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      );

const client = new paypal.core.PayPalHttpClient(environment);

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
  paypal_order_id: string;
  paypal_payment_id?: string;
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
  payments: (typeof GenerousContributionPayment)[];
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
  approvalUrl: string;
  paymentId: Types.ObjectId;
}

interface PaymentVerificationResult {
  payment: typeof GenerousContributionPayment;
  paypal_response: any;
}

export default class GenerousContributionPaymentService {
  createPayment = async (
    params: CreatePaymentParams
  ): Promise<{ success: boolean; data: PaymentDetails }> => {
    const {
      amount,
      currency = "USD",
      contributor,
      source = "website",
    } = params;

    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!contributor.name || !contributor.phone) {
      throw new Error("Contributor name and phone no are required");
    }

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not defined in environment variables");
    }

    try {
      const request: any = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toString(),
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: amount.toString(),
                },
              },
            },
            items: [
              {
                name: "Donation",
                quantity: "1",
                unit_amount: {
                  currency_code: currency,
                  value: amount.toString(),
                },
              },
            ],
            custom_id: `contrib_${Date.now()}`,
            description: "Generous contribution payment",
            soft_descriptor: "GENEROUS CONTRIB",
          },
        ],
        payer: {
          name: {
            given_name: contributor.name.split(" ")[0],
            surname: contributor.name.split(" ").slice(1).join(" ") || "",
          },
          email_address: contributor.email,
        },
        application_context: {
          brand_name: "Generous Contributions",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${frontendUrl}/success`,
          cancel_url: `${frontendUrl}`,
        },
      });

      const order = await client.execute(request);
      const payment = await GenerousContributionPayment.create({
        paypal_order_id: order.result.id,
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
        notes: { paypal_order: order.result },
      });

      const approvalUrl = order.result.links?.find(
        (link: any) => link.rel === "approve"
      )?.href;

      return {
        success: true,
        data: {
          orderId: order.result.id,
          amount,
          currency,
          approvalUrl: approvalUrl || "",
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
    const { paypal_order_id, paypal_payment_id } = params;

    const payment: any = await GenerousContributionPayment.findOne({
      paypal_order_id,
    });
    console.warn(payment);
    if (!payment) {
      throw new Error("Payment record not found");
    }

    try {
      const request: any = new paypal.orders.OrdersCaptureRequest(
        paypal_order_id
      );
      request.requestBody({});

      const capture = await client.execute(request);

      if (capture.result.status === "COMPLETED") {
        // Update payment record
        payment.paypal_payment_id = paypal_payment_id || capture.result.id;
        payment.paypal_payer_id = capture.result.payer?.payer_id;
        payment.paypal_capture_id =
          capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        payment.status = "completed";
        payment.isApproved = true;
        payment.paypal_capture_response = capture.result; // Store complete capture response
        payment.notes = { ...payment.notes, paypal_capture: capture.result };

        // Extract payer information from PayPal response
        if (capture.result.payer) {
          payment.payer = {
            email_address: capture.result.payer.email_address,
            payer_id: capture.result.payer.payer_id,
            name: capture.result.payer.name,
            phone: capture.result.payer.phone,
            address: capture.result.payer.address,
          };

          // Also set the top-level fields for easier access

          // payment.email = capture.result.payer.email_address;
          // if (capture.result.payer.name) {
          //   payment.name = `${capture.result.payer.name.given_name || ''} ${capture.result.payer.name.surname || ''}`.trim();
          // }
          // if (capture.result.payer.phone?.phone_number?.national_number) {
          //   payment.phNo = capture.result.payer.phone.phone_number.national_number;
          // }
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
              transactionNumber:
                payment.paypal_capture_id ||
                payment.paypal_payment_id ||
                payment.paypal_order_id,
              receiptNumber: payment.receiptNumber,
              date: new Date(payment.paymentDate).toLocaleDateString("en-AU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              programName:
                payment.contribution?.description ||
                "Generous Contribution Program",
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
            paypal_response: capture.result,
          },
        };
      }

      throw new Error(
        `Payment capture failed with status: ${capture.result.status}`
      );
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      payment.status = "failed";
      payment.error_details = {
        error_code: error.code || "VERIFICATION_FAILED",
        error_message: error.message,
        debug_id: error.debug_id || null,
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

      // Updated to match the actual model structure
      const payments = await GenerousContributionPayment.find(finalFilter)
        .populate([
          {
            path: "recordedBy",
            select: "name email", // Assuming User model has name and email fields
          },
          {
            path: "approvedBy",
            select: "name email",
          },
        ])
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean(); // Use lean() for better performance

      const total = await GenerousContributionPayment.countDocuments(
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
      console.error("Error finding generous contribution payments:", error);
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
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
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
          GenerousContributionPayment.aggregate([
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
          GenerousContributionPayment.aggregate([
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
          GenerousContributionPayment.aggregate([
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
          GenerousContributionPayment.aggregate([
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

  // Route Definition (add this to your routes file)
  // router.get('/generous-payments/stats', controller.getPaymentStats);

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

      // Updated to match the actual model structure
      const payment = await GenerousContributionPayment.find(finalFilter)
        .populate([
          {
            path: "recordedBy",
            select: "name email", // Assuming User model has name and email fields
          },
          {
            path: "approvedBy",
            select: "name email",
          },
        ])
        .sort(sort)
        .limit(limit)
        .skip(skip);

      const total = await GenerousContributionPayment.countDocuments(
        finalFilter
      );

      return {
        total,
        limit,
        skip,
        items: payment,
      };
    } catch (error) {
      console.error("Error finding generous contribution payments:", error);
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
    let queryBuilder = GenerousContributionPayment.find({
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
    const total = await GenerousContributionPayment.countDocuments({
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
    data: { payment: typeof GenerousContributionPayment };
  }> => {
    const payment: any = await GenerousContributionPayment.findById(id)
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
    data: { payment: typeof GenerousContributionPayment };
  }> => {
    const { id, updateData } = params;

    const payment: any = await GenerousContributionPayment.findByIdAndUpdate(
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
    const payment = await GenerousContributionPayment.findByIdAndDelete(id);

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
    data: { payment: typeof GenerousContributionPayment };
  }> => {
    const {
      amount,
      currency = "USD",
      contributor,
      manualMethod,
      transactionReference,
      remarks,
      recordedBy,
    } = params;

    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    const payment: any = await GenerousContributionPayment.create({
      amount,
      currency,
      status: "pending",
      paymentMode: "offline",
      manualMethod,
      transactionReference,
      remarks,
      contributor,
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
    data: { payment: typeof GenerousContributionPayment };
  }> => {
    const payment: any = await GenerousContributionPayment.findById(id);
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
    data: { payment: typeof GenerousContributionPayment };
  }> => {
    const payment: any = await GenerousContributionPayment.findById(id);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "completed") {
      throw new Error("Only completed payments can be refunded");
    }

    try {
      if (payment.paypal_capture_id) {
        const request: any = new paypal.payments.CapturesRefundRequest(
          payment.paypal_capture_id
        );
        request.requestBody({
          amount: {
            currency_code: payment.currency,
            value: refundData.amount?.toString() || payment.amount.toString(),
          },
          note_to_payer: refundData.reason || "Refund processed",
        });

        const refund = await client.execute(request);

        if (refund.result.status === "COMPLETED") {
          payment.status = "refunded";
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
