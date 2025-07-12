import mongoose from "mongoose";
import NotFoundError from "../../../errors/errorTypes/NotFoundError";
import ListFilterData from "../../../interfaces/ListFilterData";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Payment } from "../models/Payment";
import { Supporter } from "../../supporter/models/Supporter";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface CreateOrderParams {
  supporterId: string;
}

interface VerifyPaymentParams {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default class PaymentService {
  create = async (payment: any) => {
    try {
      return await Payment.create(payment);
    } catch (e: any) {
      console.log("Error creating payment:", e);
      throw e;
    }
  };

  findPaymentHeadingData = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return await Payment.aggregate([
      // 1. Join with related collections
      {
        $lookup: {
          from: "supporters",
          localField: "supporter",
          foreignField: "_id",
          as: "supporter",
        },
      },
      { $unwind: { path: "$supporter", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "beds",
          localField: "bed",
          foreignField: "_id",
          as: "bed",
        },
      },
      { $unwind: { path: "$bed", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "countries",
          localField: "bed.country",
          foreignField: "_id",
          as: "country",
        },
      },
      { $unwind: { path: "$country", preserveNullAndEmptyArrays: false } },

      // 2. Group by Organization and Country
      {
        $group: {
          _id: {
            organization: "$bed.organization",
            country: "$country._id",
            countryName: "$country.name",
            currency: "$country.currency",
            paymentMethod: "$paymentMethod",
            status: "$status",
          },
          // Payment counts
          totalPayments: { $sum: 1 },
          thisDayPayments: {
            $sum: {
              $cond: [{ $gte: ["$paymentDate", startOfDay] }, 1, 0],
            },
          },
          thisMonthPayments: {
            $sum: {
              $cond: [{ $gte: ["$paymentDate", startOfMonth] }, 1, 0],
            },
          },
          thisWeekPayments: {
            $sum: {
              $cond: [{ $gte: ["paymentDate", startOfWeek] }, 1, 0],
            },
          },
          // Amount calculations
          totalAmount: { $sum: "$amount" },
          thisDayAmount: {
            $sum: {
              $cond: [{ $gte: ["$paymentDate", startOfDay] }, "$amount", 0],
            },
          },
          thisMonthAmount: {
            $sum: {
              $cond: [{ $gte: ["$paymentDate", startOfMonth] }, "$amount", 0],
            },
          },
          thisWeekAmount: {
            $sum: {
              $cond: [{ $gte: ["$paymentDate", startOfWeek] }, "$amount", 0],
            },
          },
        },
      },

      // 3. Reshape into organization-centric format
      {
        $group: {
          _id: "$_id.organization",
          organizationId: { $first: "$_id.organization" },
          data: {
            $push: {
              country: "$_id.countryName",
              currency: "$_id.currency",
              paymentMethod: "$_id.paymentMethod",
              status: "$_id.status",
              totalPayments: "$totalPayments",
              thisDayPayments: "$thisDayPayments",
              thisMonthPayments: "$thisMonthPayments",
              thisWeekPayments: "$thisWeekPayments",
              totalAmount: "$totalAmount",
              thisDayAmount: "$thisDayAmount",
              thisMonthAmount: "$thisMonthAmount",
              thisWeekAmount: "$thisWeekAmount",
            },
          },
          // Calculate organization-wide totals
          totalPayments: { $sum: "$totalPayments" },
          thisDayPayments: { $sum: "$thisDayPayments" },
          thisMonthPayments: { $sum: "$thisMonthPayments" },
          thisWeekPayments: { $sum: "$thisWeekPayments" },
          
        },
      },

      // 4. Join organization details
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "organization",
        },
      },
      { $unwind: "$organization" },
      {
        $project: {
          organizationId: 1,
          organizationName: "$organization.name",
          data: 1,
          totalPayments: 1,
          thisDayPayments: 1,
          thisMonthPayments: 1,
          thisWeekPayments: 1,
          totalAmount: 1,
          thisDayAmount: 1,
          thisMonthAmount: 1,
          thisWeekAmount: 1,
          _id: 0,
        },
      },
    ]);
  };

  find = async (
    { limit, skip, filterQuery, sort }: ListFilterData,
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

      const payment = await Payment.find(finalFilter)
        .populate([
          {
            path: "bed",
            populate: [{ path: "organization" }, { path: "country" }],
          },
          "supporter",
        ])
        .sort(sort)
        .limit(limit)
        .skip(skip);

      const total = await Payment.countDocuments(finalFilter);
      return {
        total,
        limit,
        skip,
        items: payment,
      };
    } catch (error) {
      console.error("Error finding supporters:", error);
      throw error;
    }
  };

  countTotalDocuments = async () => {
    return await Payment.countDocuments();
  };

  findOne = async (id: string) => {
    return await Payment.findById(id).populate(["supporter", "bed"]);
  };

  update = async ({ id, payment }: { id: string; payment: any }) => {
    return await Payment.findByIdAndUpdate(id, payment);
  };

  delete = async (id: string) => {
    return await Payment.findByIdAndDelete(id);
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
    const paymentsData = await Payment.aggregate([
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
          isVerified: 1,
          razorpay_payment_id: 1,
          transactionReference: 1,
          // Include any other payment fields you need
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by newest first
    ]);

    // 3. Calculate payment totals
    const totals = await Payment.aggregate([
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
            ? payment.razorpay_payment_id
            : payment.transactionReference,
        // Include any other payment fields you need
      })),
    };
  };

  async createOrder(params: CreateOrderParams) {
    const { supporterId } = params;

    // Validate input
    if (!supporterId) {
      throw new Error("supporterId is required");
    }

    console.log("Creating order for supporter:", supporterId);

    try {
      // Get supporter details with proper typing
      const supporter = await Supporter.findById(supporterId).populate<{
        user: any;
        bed: { _id: any; country: any };
      }>([{ path: "user" }, { path: "bed", populate: { path: "country" } }]);

      if (!supporter) {
        throw new Error("Supporter not found");
      }

      // Validate amount
      if (!supporter.amount || isNaN(Number(supporter.amount))) {
        throw new Error("Invalid amount specified for supporter");
      }

      // Create Razorpay order
      const options = {
        amount: Math.round(Number(supporter.amount) * 100), // Convert to paise
        currency: supporter.bed.country?.currency || "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      // Create payment record
      const payment = new Payment({
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: "pending",
        method: "online",
        paymentMode: "online",
        supporter: supporterId,
        bed: supporter.bed._id,
        email: supporter.user?.email,
        contact: supporter.user?.phoneNumber,
        created_at: Math.floor(Date.now() / 1000),
        notes: order.notes,
      });

      await payment.save();

      return {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
        },
      };
    } catch (error) {
      console.error("Error in createOrder service:", error);
      throw error; // Re-throw for controller to handle
    }
  }

  async verifyPayment(params: VerifyPaymentParams) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      params;

    // Find the payment record
    const payment = await Payment.findOne({ razorpay_order_id });
    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Verify the signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new Error("Invalid signature");
    }

    // Update payment record
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.status = "captured";
    payment.isVerified = true;
    await payment.save();

    return payment;
  }
}
