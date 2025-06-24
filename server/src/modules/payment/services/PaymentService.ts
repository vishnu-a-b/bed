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

  find = async ({ limit, skip, filterQuery, sort }: ListFilterData) => {
    limit = limit ? limit : 10;
    skip = skip ? skip : 0;

    const payments = await Payment.find(filterQuery)
      .populate(["supporter", "bed"])
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Payment.countDocuments(filterQuery);

    return {
      total,
      limit,
      skip,
      items: payments,
    };
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
    console.log("Creating order for supporter:", supporterId);
    // Get supporter details
    const supporter: any = await Supporter.findById(supporterId)
      .populate([
      { path: "user" },
      { 
        path: "bed",
        populate: { path: "country" }
      }
      ]);
    if (!supporter) {
      throw new Error("Supporter not found");
    }

    const options = {
      amount: supporter.amount.toString(),
      currency: supporter.bed.country?.currency || "INR", // Default to INR if not set
      receipt: `receipt_${Date.now()}`,
    };

    try {
      const order = await razorpay.orders.create(options);

      // Create a payment record in database (status: pending)
      const payment = new Payment({
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: "pending",
        method: "online",
        paymentMode: "online",
        supporter: supporterId,
        bed: supporter.bed._id,
        email: supporter.user.email, // assuming user has email
        contact: supporter.user.phoneNumber, // assuming user has phoneNumber
        created_at: Math.floor(Date.now() / 1000),
        notes: order.notes,
      });

      await payment.save();

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw error;
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
