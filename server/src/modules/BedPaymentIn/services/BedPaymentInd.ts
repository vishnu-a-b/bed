// server/src/modules/BedPaymentIn/services/BedPaymentInd.ts
import Razorpay from "razorpay";
import { BedPaymentInd } from "../models/BedPaymentIn";
import mongoose, { Types } from "mongoose";
import crypto from "crypto";
import { Supporter } from "../../supporter/models/Supporter";
import ListFilterData from "../../../interfaces/ListFilterData";
import DonationReceiptMailerIndia from "../../../services/DonationReceiptMailerIndia";
import whatsappHelper from "../../../services/whatsapp-simple-helper";
import supporterMailer from "../../../services/mailService";

// Razorpay SDK Configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Type Definitions
interface ReminderOptions {
  phoneNumber: string;
  email: string;
  name: string;
  amount: string;
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

type ContributionPurpose =
  | "bed_donation"
  | "general_donation"
  | "medical_assistance"
  | "education_support"
  | "emergency_fund"
  | "other";

type PaymentSource =
  | "website"
  | "mobile_app"
  | "social_media"
  | "email_campaign"
  | "other";

type ManualPaymentMethod = "cash" | "cheque" | "upi" | "bank_transfer" | "other";

type PaymentStatus =
  | "pending"
  | "completed"
  | "captured"
  | "failed"
  | "cancelled"
  | "refunded";

interface CreateOrderParams {
  supporterId: string;
}

interface VerifyPaymentParams {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface UpdatePaymentParams {
  id: string;
  updateData: Partial<{
    status: PaymentStatus;
    isApproved: boolean;
    isVerified: boolean;
    remarks: string;
    notes: Record<string, any>;
  }>;
}

interface RefundPaymentParams {
  amount?: number;
  reason?: string;
}

export default class BedPaymentIndService {
  // Create Razorpay order
  createOrder = async (params: CreateOrderParams) => {
    const { supporterId } = params;

    if (!supporterId) {
      throw new Error("Supporter ID is required");
    }

    try {
      const supporter: any = await Supporter.findById(supporterId)
        .populate("user")
        .populate({
          path: "bed",
          populate: {
            path: "country",
            select: "currency",
          },
        })
        .exec();

      if (!supporter) {
        throw new Error("Supporter not found");
      }

      if (!supporter.isActive) {
        throw new Error("Supporter is not active");
      }

      const userEmail = supporter.user?.email;
      const bed = supporter.bed;
      const currency = bed?.country?.currency || "INR";
      const amount = supporter.amount || bed?.amount || bed?.fixedAmount;

      if (!userEmail) {
        throw new Error("Supporter email not found");
      }

      if (!amount) {
        throw new Error("Payment amount not found");
      }

      // Create Razorpay order
      const options = {
        amount: Math.round(Number(amount) * 100), // Convert to paise for Razorpay
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          supporterId: supporter._id.toString(),
          bedId: supporter.bed._id.toString(),
          bedNo: supporter.bed?.bedNo?.toString() || "",
        },
      };

      const order = await razorpay.orders.create(options);

      // Create payment record
      const searchFieldsData = {
        supporterName: supporter.name,
        supporterEmail: supporter.email,
        supporterMobile: supporter.user?.mobileNo,
        bedNumber: supporter.bed?.bedNo?.toString() || "",
      };

      const payment = await BedPaymentInd.create({
        razorpay_order_id: order.id,
        supporter: supporter._id,
        bed: supporter.bed._id,
        amount: Number(amount), // Store in rupees
        currency: order.currency,
        status: "pending",
        razorpay_status: order.status,
        paymentMode: "online",
        paymentDate: new Date(),
        source: "website",
        email: userEmail,
        phNo: supporter.user?.mobileNo,
        name: supporter.name,
        razorpay_created_at: Math.floor(Date.now() / 1000),
        notes: options.notes,
        searchFields: searchFieldsData,
      });

      return {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
          paymentId: payment._id,
        },
      };
    } catch (error: any) {
      console.error("Error creating order:", error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  };

  // Create Razorpay order for Hosted Checkout (CollectNow requirement)
  createOrderHosted = async (params: CreateOrderParams & { callback_url: string; cancel_url: string }) => {
    const { supporterId, callback_url, cancel_url } = params;

    if (!supporterId) {
      throw new Error("Supporter ID is required");
    }

    try {
      const supporter: any = await Supporter.findById(supporterId)
        .populate("user")
        .populate({
          path: "bed",
          populate: {
            path: "country",
            select: "currency",
          },
        })
        .exec();

      if (!supporter) {
        throw new Error("Supporter not found");
      }

      if (!supporter.isActive) {
        throw new Error("Supporter is not active");
      }

      const userEmail = supporter.user?.email;
      const userName = supporter.name || supporter.user?.name;
      const userPhone = supporter.user?.mobileNo;
      const bed = supporter.bed;
      const currency = bed?.country?.currency || "INR";
      const amount = supporter.amount || bed?.amount || bed?.fixedAmount;

      if (!userEmail) {
        throw new Error("Supporter email not found");
      }

      if (!amount) {
        throw new Error("Payment amount not found");
      }

      // Create Razorpay order with hosted checkout configuration
      const options = {
        amount: Math.round(Number(amount) * 100), // Convert to paise for Razorpay
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          supporterId: supporter._id.toString(),
          bedId: supporter.bed._id.toString(),
          bedNo: supporter.bed?.bedNo?.toString() || "",
        },
      };

      const order = await razorpay.orders.create(options);

      // Create payment record
      const searchFieldsData = {
        supporterName: supporter.name,
        supporterEmail: supporter.email,
        supporterMobile: supporter.user?.mobileNo,
        bedNumber: supporter.bed?.bedNo?.toString() || "",
      };

      const payment = await BedPaymentInd.create({
        razorpay_order_id: order.id,
        supporter: supporter._id,
        bed: supporter.bed._id,
        amount: Number(amount), // Store in rupees
        currency: order.currency,
        status: "pending",
        razorpay_status: order.status,
        paymentMode: "online",
        paymentDate: new Date(),
        source: "website",
        email: userEmail,
        phNo: userPhone,
        name: userName,
        razorpay_created_at: Math.floor(Date.now() / 1000),
        notes: options.notes,
        searchFields: searchFieldsData,
      });

      // Construct Razorpay Hosted Checkout URL
      const hostedCheckoutUrl = `https://api.razorpay.com/v1/checkout/embedded?key_id=${process.env.RAZORPAY_KEY_ID}&order_id=${order.id}&name=Generous Contributions&description=Bed Payment Contribution&prefill[name]=${encodeURIComponent(userName || "")}&prefill[email]=${encodeURIComponent(userEmail || "")}&prefill[contact]=${encodeURIComponent(userPhone || "")}&callback_url=${encodeURIComponent(callback_url)}&cancel_url=${encodeURIComponent(cancel_url)}`;

      return {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
          paymentId: payment._id,
          hostedCheckoutUrl: hostedCheckoutUrl,
        },
      };
    } catch (error: any) {
      console.error("Error creating hosted checkout order:", error);
      throw new Error(`Failed to create hosted checkout order: ${error.message}`);
    }
  };

  // Verify Razorpay payment
  verifyPayment = async (params: VerifyPaymentParams) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = params;

    try {
      // Find payment record
      const payment: any = await BedPaymentInd.findOne({ razorpay_order_id })
        .populate("supporter")
        .populate("bed");

      if (!payment) {
        throw new Error("Payment record not found");
      }

      // Verify signature
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        throw new Error("Invalid payment signature");
      }

      // Fetch payment details from Razorpay
      const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

      // Update payment record
      payment.razorpay_payment_id = razorpay_payment_id;
      payment.razorpay_signature = razorpay_signature;
      payment.status = "captured";
      payment.razorpay_status = razorpayPayment.status;
      payment.isVerified = true;
      payment.razorpay_payment_response = razorpayPayment;
      payment.razorpay_updated_at = Math.floor(Date.now() / 1000);

      // Calculate fees if available
      if (razorpayPayment.fee) {
        payment.razorpay_fee = {
          amount: razorpayPayment.fee,
          currency: razorpayPayment.currency,
        };
        payment.net_amount = Number(razorpayPayment.amount) - Number(razorpayPayment.fee);
      }

      await payment.save();

      // Send receipt email
      try {
        const payerEmail = payment.email || payment.supporter?.user?.email;
        const payerName = payment.name || payment.supporter?.name;
        const payerPhone = payment.phNo || payment.supporter?.user?.mobileNo;
        const payerAddress = payment.address || "";

        if (payerEmail) {
          await DonationReceiptMailerIndia.sendDonationReceiptEmail({
            email: payerEmail,
            name: payerName || "Supporter",
            phoneNo: payerPhone || "",
            amount: payment.amount, // Already in rupees
            address: payerAddress,
            transactionNumber: payment.razorpay_payment_id || payment.razorpay_order_id,
            receiptNumber: payment.receiptNumber || "",
            date: new Date(payment.paymentDate).toLocaleDateString(),
          });
        }
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
      }

      return {
        success: true,
        data: {
          payment,
          message: "Payment verified successfully",
        },
      };
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  };

  // Send payment reminder
  sendPaymentReminder = async (options: ReminderOptions) => {
    const { phoneNumber, email, name, amount, bedNo, supportLink, vcLink } = options;

    try {
      const results = {
        whatsapp: null,
        email: null,
      };

      // Send WhatsApp reminder
      if (phoneNumber) {
        try {
          // Note: Implement WhatsApp reminder if available
          // const whatsappMessage = await whatsappHelper.sendPaymentReminderMessage(
          //   phoneNumber,
          //   name,
          //   amount,
          //   bedNo,
          //   supportLink,
          //   vcLink
          // );
          // results.whatsapp = whatsappMessage;
          console.log("WhatsApp reminder not implemented yet");
        } catch (error) {
          console.error("WhatsApp reminder failed:", error);
        }
      }

      // Send email reminder
      if (email) {
        try {
          const emailResult = await supporterMailer.sendPaymentReminderEmail({
            to: email,
            name,
            amount,
            bedNo,
            supportLink,
            vcLink,
          });
          results.email = emailResult;
        } catch (error) {
          console.error("Email reminder failed:", error);
        }
      }

      return results;
    } catch (error: any) {
      throw new Error(`Failed to send payment reminder: ${error.message}`);
    }
  };

  // Get all payments
  getAllPayments = async (query: any = {}) => {
    try {
      const payments = await BedPaymentInd.find(query)
        .populate("supporter")
        .populate("bed")
        .populate("recordedBy", "name email")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: payments,
        count: payments.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  };

  // Get payment by ID
  getPaymentById = async (id: string) => {
    try {
      const payment = await BedPaymentInd.findById(id)
        .populate("supporter")
        .populate("bed")
        .populate("recordedBy", "name email")
        .populate("approvedBy", "name email");

      if (!payment) {
        throw new Error("Payment not found");
      }

      return {
        success: true,
        data: payment,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  };

  // Find payments with filters
  find = async (
    { limit, skip, filterQuery, sort }: ListFilterData,
    startDate?: string,
    endDate?: string
  ) => {
    limit = limit ? limit : 10;
    skip = skip ? skip : 0;

    const query: any = { ...filterQuery };

    // Add date range filter
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) {
        query.paymentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = end;
      }
    }

    const payments = await BedPaymentInd.find(query)
      .populate({
        path: "supporter",
        populate: {
          path: "user bed",
        },
      })
      .populate("bed")
      .populate("recordedBy", "name email")
      .populate("approvedBy", "name email")
      .sort(sort || { paymentDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await BedPaymentInd.countDocuments(query);

    return {
      total,
      limit,
      skip,
      items: payments,
    };
  };

  // Find payments with search
  findPayments = async (
    { limit, skip, filterQuery, sort, search }: any,
    startDate?: string,
    endDate?: string
  ) => {
    limit = limit ? limit : 10;
    skip = skip ? skip : 0;

    const query: any = { ...filterQuery };

    // Add search functionality
    if (search) {
      query.$or = [
        { "searchFields.supporterName": { $regex: search, $options: "i" } },
        { "searchFields.supporterMobile": { $regex: search, $options: "i" } },
        { "searchFields.bedNumber": { $regex: search, $options: "i" } },
        { "searchFields.supporterEmail": { $regex: search, $options: "i" } },
        { razorpay_payment_id: { $regex: search, $options: "i" } },
        { razorpay_order_id: { $regex: search, $options: "i" } },
        { receiptNumber: { $regex: search, $options: "i" } },
        { transactionReference: { $regex: search, $options: "i" } },
      ];
    }

    // Add date range filter
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) {
        query.paymentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = end;
      }
    }

    const payments = await BedPaymentInd.find(query)
      .populate({
        path: "supporter",
        populate: {
          path: "user bed",
        },
      })
      .populate("bed")
      .populate("recordedBy", "name email")
      .populate("approvedBy", "name email")
      .sort(sort || { paymentDate: -1 })
      .limit(limit)
      .skip(skip);

    const total = await BedPaymentInd.countDocuments(query);

    return {
      total,
      limit,
      skip,
      items: payments,
    };
  };

  // Update payment
  updatePayment = async (params: UpdatePaymentParams) => {
    const { id, updateData } = params;

    try {
      const payment = await BedPaymentInd.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!payment) {
        throw new Error("Payment not found");
      }

      return {
        success: true,
        data: payment,
      };
    } catch (error: any) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }
  };

  // Delete payment
  deletePayment = async (id: string) => {
    try {
      const payment = await BedPaymentInd.findByIdAndDelete(id);

      if (!payment) {
        throw new Error("Payment not found");
      }

      return {
        success: true,
        message: "Payment deleted successfully",
      };
    } catch (error: any) {
      throw new Error(`Failed to delete payment: ${error.message}`);
    }
  };

  // Get supporter details with payments
  findOneSupporterPayments = async (supporterId: string) => {
    if (!supporterId || !mongoose.Types.ObjectId.isValid(supporterId)) {
      throw new Error("Invalid supporter ID");
    }

    const supporterData: any = await Supporter.aggregate([
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

    const paymentsData = await BedPaymentInd.aggregate([
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
          manualMethod: 1,
          createdAt: 1,
          paymentDate: 1,
          isVerified: 1,
          isApproved: 1,
          razorpay_payment_id: 1,
          transactionReference: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const totals = await BedPaymentInd.aggregate([
      {
        $match: {
          supporter: new mongoose.Types.ObjectId(supporterId),
          status: { $in: ["captured", "completed"] }, // Include both captured and completed payments
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
      fixedAmount: supporter.amount || supporter.bed.amount || supporter.bed.fixedAmount,
      bedId: supporter.bed._id,
      countryId: supporter.country._id,
      countryName: supporter.country.name,
      currency: supporter.country.currency,
      totalPayments: totals[0]?.totalPayments || 0,
      totalAmount: totals[0]?.totalAmount || 0,
      totalOnlinePayments: totals[0]?.totalOnlinePayments || 0,
      totalOfflinePayments: totals[0]?.totalOfflinePayments || 0,
      payments: paymentsData,
    };
  };

  // Create manual/offline payment
  createManualPayment = async (params: ManualPaymentParam) => {
    try {
      const {
        amount,
        currency,
        name,
        email,
        phNo,
        address,
        manualMethod,
        transactionReference,
        paymentDate,
        remarks,
        contribution,
        source,
        recordedBy,
        supporter,
        bed,
      } = params;

      // Get supporter data for search fields
      let searchFieldsData = {};
      if (supporter) {
        const supporterData: any = await Supporter.findById(supporter)
          .populate("user")
          .populate("bed");

        if (supporterData) {
          searchFieldsData = {
            supporterName: supporterData.name,
            supporterEmail: supporterData.email,
            supporterMobile: supporterData.user?.mobileNo,
            bedNumber: supporterData.bed?.bedNo?.toString() || "",
          };
        }
      }

      const payment = await BedPaymentInd.create({
        amount: Number(amount), // Store in rupees
        currency: currency || "INR",
        name,
        email,
        phNo,
        address,
        status: "pending",
        paymentMode: "offline",
        manualMethod,
        transactionReference,
        paymentDate: paymentDate || new Date(),
        remarks,
        contribution,
        source: source || "website",
        recordedBy,
        supporter,
        bed,
        isApproved: false,
        isVerified: false,
        searchFields: searchFieldsData,
      });

      return {
        success: true,
        data: payment,
        message: "Manual payment created successfully. Pending approval.",
      };
    } catch (error: any) {
      throw new Error(`Failed to create manual payment: ${error.message}`);
    }
  };

  // Approve/reject manual payment
  approveManualPayment = async (params: ApproveManualPaymentParams) => {
    try {
      const { id, approved, approvedBy, remarks } = params;

      const payment: any = await BedPaymentInd.findById(id)
        .populate("supporter")
        .populate("bed");

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.paymentMode !== "offline") {
        throw new Error("Only offline payments can be manually approved");
      }

      payment.isApproved = approved;
      payment.approvedBy = approvedBy;
      payment.approvedAt = new Date();
      payment.status = approved ? "completed" : "cancelled";

      if (remarks) {
        payment.remarks = remarks;
      }

      await payment.save();

      // Send receipt if approved
      if (approved) {
        try {
          const payerEmail = payment.email || payment.supporter?.user?.email;
          const payerName = payment.name || payment.supporter?.name;
          const payerPhone = payment.phNo || payment.supporter?.user?.mobileNo;
          const payerAddress = payment.address || "";

          if (payerEmail) {
            await DonationReceiptMailerIndia.sendDonationReceiptEmail({
              email: payerEmail,
              name: payerName || "Supporter",
              phoneNo: payerPhone || "",
              amount: payment.amount, // Already in rupees
              address: payerAddress,
              transactionNumber: payment.transactionReference || payment.receiptNumber,
              receiptNumber: payment.receiptNumber || "",
              date: new Date(payment.paymentDate).toLocaleDateString(),
            });
          }
        } catch (emailError) {
          console.error("Failed to send approval receipt:", emailError);
        }
      }

      return {
        success: true,
        data: payment,
        message: `Payment ${approved ? "approved" : "rejected"} successfully`,
      };
    } catch (error: any) {
      throw new Error(`Failed to approve payment: ${error.message}`);
    }
  };

  // Refund payment
  refundPayment = async (id: string, params: RefundPaymentParams) => {
    try {
      const { amount, reason } = params;

      const payment: any = await BedPaymentInd.findById(id);

      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.status !== "captured" && payment.status !== "completed") {
        throw new Error("Only captured/completed payments can be refunded");
      }

      if (!payment.razorpay_payment_id) {
        throw new Error("Cannot refund: Missing Razorpay payment ID");
      }

      // Create refund in Razorpay
      const refundOptions: any = {
        payment_id: payment.razorpay_payment_id,
      };

      if (amount) {
        refundOptions.amount = Math.round(amount * 100); // Convert to paise for Razorpay
      }

      if (reason) {
        refundOptions.notes = { reason };
      }

      const refund = await razorpay.payments.refund(
        payment.razorpay_payment_id,
        refundOptions
      );

      // Update payment record
      payment.status = refund.amount === payment.amount ? "refunded" : "partially_refunded";
      payment.razorpay_refund_response = refund;

      await payment.save();

      return {
        success: true,
        data: {
          payment,
          refund,
        },
        message: "Payment refunded successfully",
      };
    } catch (error: any) {
      throw new Error(`Failed to refund payment: ${error.message}`);
    }
  };

  // Get payment statistics
  getPaymentStatistics = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const stats = await BedPaymentInd.aggregate([
        {
          $facet: {
            total: [
              {
                $match: {
                  status: { $in: ["captured", "completed"] },
                },
              },
              {
                $group: {
                  _id: null,
                  amount: { $sum: "$amount" },
                  count: { $sum: 1 },
                },
              },
            ],
            today: [
              {
                $match: {
                  status: { $in: ["captured", "completed"] },
                  paymentDate: { $gte: today },
                },
              },
              {
                $group: {
                  _id: null,
                  amount: { $sum: "$amount" },
                  count: { $sum: 1 },
                },
              },
            ],
            week: [
              {
                $match: {
                  status: { $in: ["captured", "completed"] },
                  paymentDate: { $gte: weekAgo },
                },
              },
              {
                $group: {
                  _id: null,
                  amount: { $sum: "$amount" },
                  count: { $sum: 1 },
                },
              },
            ],
            month: [
              {
                $match: {
                  status: { $in: ["captured", "completed"] },
                  paymentDate: { $gte: monthAgo },
                },
              },
              {
                $group: {
                  _id: null,
                  amount: { $sum: "$amount" },
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);

      const result = stats[0];

      return {
        total: {
          amount: result.total[0]?.amount || 0, // Already in rupees
          count: result.total[0]?.count || 0,
          avgAmount:
            result.total[0]?.count > 0
              ? result.total[0].amount / result.total[0].count
              : 0,
        },
        today: {
          amount: result.today[0]?.amount || 0,
          count: result.today[0]?.count || 0,
        },
        week: {
          amount: result.week[0]?.amount || 0,
          count: result.week[0]?.count || 0,
        },
        month: {
          amount: result.month[0]?.amount || 0,
          count: result.month[0]?.count || 0,
        },
        dateRanges: {
          today: { start: today.toISOString(), end: new Date().toISOString() },
          week: { start: weekAgo.toISOString(), end: new Date().toISOString() },
          month: { start: monthAgo.toISOString(), end: new Date().toISOString() },
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch payment statistics: ${error.message}`);
    }
  };
}
