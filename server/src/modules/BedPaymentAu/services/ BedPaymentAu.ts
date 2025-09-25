// server/src/modules/payment/services/ BedPaymentAuService.ts
import paypal from "@paypal/checkout-server-sdk";
import { BedPaymentAu } from "../models/ BedPaymentAu";
import mongoose, { Types } from "mongoose";
import DonationReceiptMailer from "../../../services/DonationReceiptMailer";
import { Supporter } from "../../supporter/models/Supporter";
import whatsappHelper from "../../../services/whatsapp-simple-helper";
import supporterMailer from "../../../services/mailService";
// PayPal SDK Configuration
interface ReminderOptions {
  phoneNumber: string;
  email: string;
  name: string;
  amount: string; // e.g. "120 AUD"
  bedNo: string;
  supportLink: string;
  vcLink: string;
}

interface ManualPaymentParam {
  amount: number;
  currency: string;
  name?: string;
  email?: string;
  phNo?: string;
  address?: string;
  manualMethod: ManualPaymentMethod;
  transactionReference?: string;
  paymentDate?: Date;
  remarks?: string;
  contribution?: {
    purpose: ContributionPurpose;
    description?: string;
  };
  source?: PaymentSource;
  recordedBy: Types.ObjectId;
  supporter?: Types.ObjectId;
  bed?: Types.ObjectId;
}

interface ApproveManualPaymentParams {
  id: string;
  approved: boolean;
  approvedBy: Types.ObjectId;
  remarks?: string;
}

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
  supporter: any;
  source?: PaymentSource;
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
  payments: (typeof BedPaymentAu)[];
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
  payment: typeof BedPaymentAu;
  paypal_response: any;
}

export default class BedPaymentAuService {
  createPayment = async (
    params: CreatePaymentParams
  ): Promise<{ success: boolean; data: PaymentDetails }> => {
    const { supporter, source = "website" } = params;

    if (!supporter) {
      throw new Error("Supporter ID is required");
    }

    const frontendUrl = process.env.FRONTEND_URL_BED;
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not defined in environment variables");
    }

    try {
      // Find supporter and populate user data and bed data to get email, phone, and currency
      const contributorData: any = await Supporter.findById(supporter)
        .populate("user") // Populate user field with email, phone, and address
        .populate("bed") // Populate bed info including amount and organization
        .populate({
          path: "bed",
          populate: {
            path: "country",
            select: "currency", // Assuming country model has currency field
          },
        })
        .exec();

      if (!contributorData) {
        throw new Error("Supporter not found");
      }

      if (!contributorData.isActive) {
        throw new Error("Supporter is not active");
      }

      // Extract user data
      const userEmail = contributorData.user?.email;

      // Extract bed and payment data
      const bed = contributorData.bed;
      const currency = bed?.country?.currency || "USD"; // Default to USD if currency not found
      const amount = contributorData.amount || bed?.amount || bed?.fixedAmount; // Use supporter amount, or fallback to bed amount/fixedAmount

      if (!userEmail) {
        throw new Error("Supporter email not found");
      }

      if (!amount) {
        throw new Error("Payment amount not found");
      }

      if (!currency) {
        throw new Error("Currency not found");
      }

      const searchFieldsData = {
        supporterName: contributorData.name,
        supporterEmail: contributorData.email,
        supporterMobile: contributorData.mobileNo,
        bedNumber: contributorData.bed?.bedNo?.toString() || "",
      };

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
            given_name: contributorData.name.split(" ")[0],
            surname: contributorData.name.split(" ").slice(1).join(" ") || "",
          },
          email_address: userEmail,
        },
        application_context: {
          brand_name: "Generous Contributions",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${frontendUrl}/payment/success`,
          cancel_url: `${frontendUrl}`,
        },
      });

      const order = await client.execute(request);

      // Create payment record with supporter data
      const payment = await BedPaymentAu.create({
        paypal_order_id: order.result.id,
        supporter: contributorData._id, // Add supporter reference
        bed: contributorData.bed._id,
        amount,
        currency,
        status: "pending",
        paymentMode: "online",
        paymentDate: new Date(),
        source,
        isApproved: true,
        notes: {
          paypal_order: order.result,
          bed: contributorData.bed?._id,
          bedNo: contributorData.bed?.bedNo,
          currency: currency,
        },
        searchFields: searchFieldsData,
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
    } catch (error: any) {
      console.error("Error creating payment:", error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  };
  verifyPayment = async (
    params: VerifyPaymentParams
  ): Promise<{ success: boolean; data: PaymentVerificationResult }> => {
    const { paypal_order_id, paypal_payment_id } = params;

    const payment: any = await BedPaymentAu.findOne({
      paypal_order_id,
    }).populate({
      path: "supporter",
      populate: {
        path: "user", // assuming supporter.user is a ref to the User model
      },
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
          const payerEmail = payment?.supporter?.user?.email;
          const payerName = payment?.supporter?.user?.name;
          const address = payment?.supporter?.user?.address || "";
          const phone = payment?.supporter?.user?.mobileNo || "";

          if (payerEmail) {
            await DonationReceiptMailer.sendDonationReceiptEmail({
              email: payerEmail,
              name: payerName,
              phoneNo: phone,
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
    let queryBuilder = BedPaymentAu.find({
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
    const total = await BedPaymentAu.countDocuments({
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
    data: { payment: typeof BedPaymentAu };
  }> => {
    const payment: any = await BedPaymentAu.findById(id)
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
    data: { payment: typeof BedPaymentAu };
  }> => {
    const { id, updateData } = params;

    const payment: any = await BedPaymentAu.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

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
    const payment = await BedPaymentAu.findByIdAndDelete(id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      success: true,
      message: "Payment deleted successfully",
    };
  };

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
          BedPaymentAu.aggregate([
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
          BedPaymentAu.aggregate([
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
          BedPaymentAu.aggregate([
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
          BedPaymentAu.aggregate([
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
      const payment = await BedPaymentAu.find(finalFilter)
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

      const total = await BedPaymentAu.countDocuments(finalFilter);

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
  // createManualPayment = async (
  //   params: ManualPaymentParams
  // ): Promise<{
  //   success: boolean;
  //   data: { payment: typeof BedPaymentAu };
  // }> => {
  //   const {
  //     amount,
  //     currency = "USD",
  //     contributor,
  //     manualMethod,
  //     transactionReference,
  //     remarks,
  //     recordedBy,
  //   } = params;

  //   if (!amount || amount <= 0) {
  //     throw new Error("Amount must be greater than 0");
  //   }

  //   // if (!contributor.name || !contributor.email) {
  //   //   throw new Error("Contributor name and email are required");
  //   // }

  //   // if (!contribution.purpose) {
  //   //   throw new Error("Contribution purpose is required");
  //   // }

  //   const payment: any = await BedPaymentAu.create({
  //     amount,
  //     currency,
  //     status: "pending",
  //     paymentMode: "offline",
  //     manualMethod,
  //     transactionReference,
  //     remarks,
  //     contributor,
  //     paymentDate: new Date(),
  //     recordedBy,
  //     isApproved: false,
  //   });

  //   return {
  //     success: true,
  //     data: { payment },
  //   };
  // };

  approvePayment = async (
    id: string,
    approvedBy: Types.ObjectId
  ): Promise<{
    success: boolean;
    data: { payment: typeof BedPaymentAu };
  }> => {
    const payment: any = await BedPaymentAu.findById(id);
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
    data: { payment: typeof BedPaymentAu };
  }> => {
    const payment: any = await BedPaymentAu.findById(id);
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

  findOneSupporterPayments = async (supporterId: string) => {
    // Validate supporterId
    if (!supporterId || !mongoose.Types.ObjectId.isValid(supporterId)) {
      throw new Error("Invalid supporter ID");
    }

    // 1. Get basic supporter information
    const supporterData = await Supporter.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(supporterId),
        },
      },
      {
        $lookup: {
          from: "beds",
          localField: "bed",
          foreignField: "_id",
          as: "bed",
        },
      },
      { $unwind: "$bed" },
      {
        $lookup: {
          from: "countries",
          localField: "bed.country",
          foreignField: "_id",
          as: "country",
        },
      },
      { $unwind: "$country" },
    ]);

    if (supporterData.length === 0) {
      throw new Error("Supporter not found");
    }

    const supporter = supporterData[0];

    // 2. Get all payments for this supporter
    const paymentsData = await BedPaymentAu.aggregate([
      {
        $match: {
          supporter: new mongoose.Types.ObjectId(supporterId),
        },
      },
      {
        $project: {
          amount: 1,
          status: 1,
          paymentMode: 1,
          method: 1,
          createdAt: 1,
          paymentDate: 1,
          isApproved: 1,
          paypal_payment_id: 1, // Changed from razorpay_payment_id
          transactionReference: 1,
          // Include any other payment fields you need
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by newest first
    ]);

    // 3. Calculate payment totals
    const totals = await BedPaymentAu.aggregate([
      {
        $match: {
          supporter: new mongoose.Types.ObjectId(supporterId),
          status: "captured", // Only count successful payments
        },
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          totalOnlinePayments: {
            $sum: {
              $cond: [{ $eq: ["$paymentMode", "online"] }, 1, 0],
            },
          },
          totalOfflinePayments: {
            $sum: {
              $cond: [{ $eq: ["$paymentMode", "offline"] }, 1, 0],
            },
          },
        },
      },
    ]);

    return {
      supporterId: supporter._id,
      supporterName: supporter.nameVisible ? supporter.name : "Anonymous",
      bedNo: supporter.bed.bedNo,
      qrPhoto: supporter.bed.qrPhoto,
      fixedAmount: supporter.bed.fixedAmount,
      bedId: supporter.bed._id,
      countryId: supporter.country._id,
      countryName: supporter.country.name,
      currency: supporter.country.currency,
      totalPayments: totals[0]?.totalPayments || 0,
      totalAmount: totals[0]?.totalAmount || 0,
      totalOnlinePayments: totals[0]?.totalOnlinePayments || 0,
      totalOfflinePayments: totals[0]?.totalOfflinePayments || 0,
      payments: paymentsData.map((payment) => ({
        amount: payment.amount,
        status: payment.status,
        paymentMode: payment.paymentMode,
        method: payment.method,
        date: payment.createdAt,
        paymentDate: payment.paymentDate,
        isVerified: payment.isVerified,
        reference:
          payment.paymentMode === "online"
            ? payment.paypal_payment_id // Changed from razorpay_payment_id
            : payment.transactionReference,
        // Include any other payment fields you need
      })),
    };
  };

  sendPaymentReminder = async (options: ReminderOptions) => {
    const { phoneNumber, email, name, amount, bedNo, supportLink, vcLink } =
      options;

    if (!phoneNumber && !email) {
      throw new Error("Either phoneNumber or email is required.");
    }
    if (!name || !supportLink) {
      throw new Error("name and supportLink are required.");
    }

    // Default to current month/year

    // if (phoneNumber) {
    //    await whatsappHelper.sendPaymentReminderMessage(
    //     phoneNumber,
    //     name,
    //     amount,
    //     bedNo,
    //     supportLink,
    //   );
    // }

    if (email) {
      await supporterMailer.sendPaymentReminderEmail({
        to: email,
        name,
        amount,
        bedNo,
        supportLink,
        vcLink,
      });
    }

    return { phoneNumber, email, name, amount, bedNo, supportLink };
  };

  findPayments = async (
    { limit, skip, filterQuery, sort, search }: any,
    startDate?: string,
    endDate?: string
  ) => {
    console.log("Service received dates:", startDate, endDate);
    console.log("Service received search:", search);
    console.log("Service received filterQuery:", filterQuery);

    try {
      limit = limit || 10;
      skip = skip || 0;

      // Date filter - only apply if dates are provided and not empty
      let dateFilter = {};
      if ((startDate && startDate.trim()) || (endDate && endDate.trim())) {
        dateFilter = {
          paymentDate: {
            ...(startDate &&
              startDate.trim() && {
                $gte: (() => {
                  const d = new Date(startDate);
                  d.setHours(0, 0, 0, 0);
                  return d;
                })(),
              }),
            ...(endDate &&
              endDate.trim() && {
                $lte: (() => {
                  const d = new Date(endDate);
                  d.setHours(23, 59, 59, 999);
                  return d;
                })(),
              }),
          },
        };
      }

      // Enhanced search filter
      let searchFilter = {};
      if (search && search.trim()) {
        const searchTerm = search.trim();
        searchFilter = {
          $or: [
            // Search in denormalized fields
            {
              "searchFields.supporterName": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            {
              "searchFields.supporterMobile": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            { "searchFields.bedNumber": { $regex: searchTerm, $options: "i" } },
            {
              "searchFields.supporterEmail": {
                $regex: searchTerm,
                $options: "i",
              },
            },

            // Payment fields
            { receiptNumber: { $regex: searchTerm, $options: "i" } },
            { paypal_payment_id: { $regex: searchTerm, $options: "i" } },
            { paypal_order_id: { $regex: searchTerm, $options: "i" } },
            { "payer.email_address": { $regex: searchTerm, $options: "i" } },
            { "payer.name.given_name": { $regex: searchTerm, $options: "i" } },
            { "payer.name.surname": { $regex: searchTerm, $options: "i" } },
          ],
        };
      }

      const finalFilter = {
        ...filterQuery, // This now includes status and paymentMode filters
        ...dateFilter,
        ...searchFilter,
      };

      console.log("Final filter query:", JSON.stringify(finalFilter, null, 2));

      const payments = await BedPaymentAu.find(finalFilter)
        .populate([
          {
            path: "recordedBy",
            select: "name email",
          },
          {
            path: "approvedBy",
            select: "name email",
          },
          {
            path: "supporter",
            populate: [{ path: "bed" }, { path: "user" }],
          },
        ])
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await BedPaymentAu.countDocuments(finalFilter);

      console.log(`Found ${payments.length} payments out of ${total} total`);

      return {
        total,
        limit,
        skip,
        items: payments,
      };
    } catch (error) {
      console.error("Error finding bed payments:", error);
      throw error;
    }
  };

// Add these methods to your BedPaymentAuService class



createManualPayment = async (
  params: ManualPaymentParam
): Promise<{
  success: boolean;
  data: { payment: typeof BedPaymentAu };
}> => {
  const {
    amount,
    currency = "AUD",
    name,
    email,
    phNo,
    address,
    manualMethod,
    transactionReference,
    paymentDate = new Date(),
    remarks,
    contribution = {
      purpose: "general_donation",
      description: "Manual donation"
    },
    source = "website",
    recordedBy,
    supporter,
    bed
  } = params;
  console.log(params)
  if (!amount || amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  if (!manualMethod) {
    throw new Error("Manual payment method is required");
  }

  try {
    // Build search fields for manual payments
    const searchFieldsData = {
      supporterName: name || "",
      supporterEmail: email || "",
      supporterMobile: phNo || "",
      bedNumber: "", // Will be populated if bed is provided
    };

    // If bed is provided, get bed details
    if (bed) {
      // You might need to import Bed model to get bedNo
      // const bedData = await Bed.findById(bed);
      // searchFieldsData.bedNumber = bedData?.bedNo?.toString() || "";
    }

    const payment: any = await BedPaymentAu.create({
      amount,
      currency,
      status: "pending", // Manual payments start as pending
      paymentMode: "offline",
      manualMethod,
      transactionReference,
      remarks,
      paymentDate,
      contribution,
      source,
      recordedBy,
      isApproved: false, // Manual payments require approval
      
      // Store basic payer info for manual payments
      payer: email || name ? {
        email_address: email,
        name: name ? {
          given_name: name.split(" ")[0] || "",
          surname: name.split(" ").slice(1).join(" ") || ""
        } : undefined
      } : undefined,

      // References
      ...(supporter && { supporter }),
      ...(bed && { bed }),

      searchFields: searchFieldsData,

      notes: {
        manual_payment: true,
        created_by: recordedBy,
        payer_info: {
          name,
          email,
          phNo,
          address
        }
      }
    });
    console.log(payment)
    return {
      success: true,
      data: { payment },
    };

  } catch (error: any) {
    console.error("Error creating manual payment:", error);
    throw new Error(`Failed to create manual payment: ${error.message}`);
  }
};

approveManualPayment = async (
  params: ApproveManualPaymentParams
): Promise<{
  success: boolean;
  data: { payment: typeof BedPaymentAu };
}> => {
  console.log(params)
  const { id, approved, approvedBy, remarks } = params;

  const payment: any = await BedPaymentAu.findById(id)
    .populate({
      path: "supporter",
      populate: {
        path: "user"
      }
    });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.paymentMode !== "offline") {
    throw new Error("Only offline payments can be manually approved");
  }

  if (payment.isApproved && approved) {
    throw new Error("Payment is already approved");
  }

  try {
    // Update payment status
    payment.isApproved = approved;
    payment.approvedBy = approvedBy;
    payment.approvedAt = new Date();
    payment.status = approved ? "completed" : "cancelled";
    
    if (remarks) {
      payment.remarks = payment.remarks 
        ? `${payment.remarks}\n\nApproval: ${remarks}`
        : `Approval: ${remarks}`;
    }

    await payment.save();

    // If approved, send receipt email
    if (approved) {
      try {
        // Determine email and name from various sources
        const payerEmail = payment.payer?.email_address || 
                          payment.supporter?.user?.email || 
                          payment.notes?.payer_info?.email;

        const payerName = payment.payer?.name?.given_name 
          ? `${payment.payer.name.given_name} ${payment.payer.name.surname || ''}`.trim()
          : payment.supporter?.user?.name || 
            payment.notes?.payer_info?.name || 
            "Donor";

        const payerPhone = payment.supporter?.user?.mobileNo || 
                          payment.notes?.payer_info?.phNo || 
                          "";

        const payerAddress = payment.supporter?.user?.address || 
                            payment.notes?.payer_info?.address || 
                            "";

        if (payerEmail) {
          await DonationReceiptMailer.sendDonationReceiptEmail({
            email: payerEmail,
            name: payerName,
            phoneNo: payerPhone,
            amount: payment.amount,
            address: payerAddress,
            transactionNumber: payment.transactionReference || payment.receiptNumber,
            receiptNumber: payment.receiptNumber,
            date: new Date(payment.paymentDate).toLocaleDateString("en-AU", {
              year: "numeric",
              month: "long", 
              day: "numeric",
            }),
            programName: payment.contribution?.description || "Manual Contribution",
          });

          console.log(`Manual payment receipt email sent to ${payerEmail}`);

          // Update notes to indicate email was sent
          payment.notes = {
            ...payment.notes,
            receipt_email_sent: true,
            receipt_email_sent_at: new Date(),
          };
          await payment.save();
        } else {
          console.warn(`No email address found for manual payment ${payment.receiptNumber}`);
          
          // Update notes to indicate email could not be sent
          payment.notes = {
            ...payment.notes,
            receipt_email_failed: true,
            receipt_email_error: "No email address available",
          };
          await payment.save();
        }

      } catch (emailError: any) {
        console.error("Failed to send manual payment receipt email:", emailError);
        
        // Update notes with email error but don't fail the approval
        payment.notes = {
          ...payment.notes,
          receipt_email_failed: true,
          receipt_email_error: emailError.message,
          receipt_email_retry_needed: true,
        };
        await payment.save();
      }
    }

    return {
      success: true,
      data: { payment },
    };

  } catch (error: any) {
    console.error("Error approving manual payment:", error);
    throw new Error(`Failed to approve manual payment: ${error.message}`);
  }
};


  // findPayments = async (
  //   { limit, skip, filterQuery, sort }: any,
  //   startDate?: string,
  //   endDate?: string
  // ) => {
  //   console.log("Service received dates:", startDate, endDate);
  //   console.log("Service received filterQuery:", filterQuery);

  //   try {
  //     limit = limit || 10;
  //     skip = skip || 0;

  //     let dateFilter = {};
  //     if (startDate || endDate) {
  //       dateFilter = {
  //         paymentDate: {
  //           ...(startDate && {
  //             $gte: new Date(startDate),
  //           }),
  //           ...(endDate && {
  //             $lte: new Date(endDate),
  //           }),
  //         },
  //       };
  //     }

  //     const finalFilter = {
  //       ...filterQuery,
  //       ...dateFilter,
  //     };

  //     console.log("Final filter query:", JSON.stringify(finalFilter, null, 2));

  //     // Updated to match the actual model structure
  //     const payments = await BedPaymentAu.find(finalFilter)
  //       .populate([
  //         {
  //           path: "recordedBy",
  //           select: "name email", // Assuming User model has name and email fields
  //         },
  //         {
  //           path: "approvedBy",
  //           select: "name email",
  //         },
  // {
  //   path: "supporter",
  //   populate: {
  //     path: "bed",
  //   },
  // },
  //       ])
  //       .sort(sort)
  //       .limit(limit)
  //       .skip(skip)
  //       .lean(); // Use lean() for better performance

  //     const total = await BedPaymentAu.countDocuments(finalFilter);

  //     console.log(`Found ${payments.length} payments out of ${total} total`);

  //     return {
  //       total,
  //       limit,
  //       skip,
  //       items: payments,
  //     };
  //   } catch (error) {
  //     console.error("Error finding generous contribution payments:", error);
  //     throw error;
  //   }
  // };
}
