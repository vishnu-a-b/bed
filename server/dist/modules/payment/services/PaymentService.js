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
const mongoose_1 = __importDefault(require("mongoose"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const Payment_1 = require("../models/Payment");
const Supporter_1 = require("../../supporter/models/Supporter");
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
class PaymentService {
    constructor() {
        this.create = (payment) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Payment_1.Payment.create(payment);
            }
            catch (e) {
                console.log("Error creating payment:", e);
                throw e;
            }
        });
        this.find = (_a) => __awaiter(this, [_a], void 0, function* ({ limit, skip, filterQuery, sort }) {
            limit = limit ? limit : 10;
            skip = skip ? skip : 0;
            const payments = yield Payment_1.Payment.find(filterQuery)
                .populate(["supporter", "bed"])
                .sort(sort)
                .limit(limit)
                .skip(skip);
            const total = yield Payment_1.Payment.countDocuments(filterQuery);
            return {
                total,
                limit,
                skip,
                items: payments,
            };
        });
        this.countTotalDocuments = () => __awaiter(this, void 0, void 0, function* () {
            return yield Payment_1.Payment.countDocuments();
        });
        this.findOne = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Payment_1.Payment.findById(id).populate(["supporter", "bed"]);
        });
        this.update = (_a) => __awaiter(this, [_a], void 0, function* ({ id, payment }) {
            return yield Payment_1.Payment.findByIdAndUpdate(id, payment);
        });
        this.delete = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Payment_1.Payment.findByIdAndDelete(id);
        });
        this.findOneSupporterPayments = (supporterId) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            // Validate supporterId
            if (!supporterId || !mongoose_1.default.Types.ObjectId.isValid(supporterId)) {
                throw new Error("Invalid supporter ID");
            }
            // 1. Get basic supporter information
            const supporterData = yield Supporter_1.Supporter.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(supporterId),
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
            const paymentsData = yield Payment_1.Payment.aggregate([
                {
                    $match: {
                        supporter: new mongoose_1.default.Types.ObjectId(supporterId),
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
            const totals = yield Payment_1.Payment.aggregate([
                {
                    $match: {
                        supporter: new mongoose_1.default.Types.ObjectId(supporterId),
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
                totalPayments: ((_a = totals[0]) === null || _a === void 0 ? void 0 : _a.totalPayments) || 0,
                totalAmount: ((_b = totals[0]) === null || _b === void 0 ? void 0 : _b.totalAmount) || 0,
                totalOnlinePayments: ((_c = totals[0]) === null || _c === void 0 ? void 0 : _c.totalOnlinePayments) || 0,
                totalOfflinePayments: ((_d = totals[0]) === null || _d === void 0 ? void 0 : _d.totalOfflinePayments) || 0,
                payments: paymentsData.map((payment) => ({
                    amount: payment.amount,
                    status: payment.status,
                    paymentMode: payment.paymentMode,
                    method: payment.method,
                    date: payment.createdAt,
                    paymentDate: payment.paymentDate,
                    isVerified: payment.isVerified,
                    reference: payment.paymentMode === "online"
                        ? payment.razorpay_payment_id
                        : payment.transactionReference,
                    // Include any other payment fields you need
                })),
            };
        });
    }
    createOrder(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { supporterId } = params;
            // Validate input
            if (!supporterId) {
                throw new Error("supporterId is required");
            }
            console.log("Creating order for supporter:", supporterId);
            try {
                // Get supporter details with proper typing
                const supporter = yield Supporter_1.Supporter.findById(supporterId).populate([{ path: "user" }, { path: "bed", populate: { path: "country" } }]);
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
                    currency: ((_a = supporter.bed.country) === null || _a === void 0 ? void 0 : _a.currency) || "INR",
                    receipt: `receipt_${Date.now()}`,
                };
                const order = yield razorpay.orders.create(options);
                // Create payment record
                const payment = new Payment_1.Payment({
                    razorpay_order_id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    status: "pending",
                    method: "online",
                    paymentMode: "online",
                    supporter: supporterId,
                    bed: supporter.bed._id,
                    email: (_b = supporter.user) === null || _b === void 0 ? void 0 : _b.email,
                    contact: (_c = supporter.user) === null || _c === void 0 ? void 0 : _c.phoneNumber,
                    created_at: Math.floor(Date.now() / 1000),
                    notes: order.notes,
                });
                yield payment.save();
                return {
                    success: true,
                    data: {
                        orderId: order.id,
                        amount: order.amount,
                        currency: order.currency,
                        key: process.env.RAZORPAY_KEY_ID,
                    },
                };
            }
            catch (error) {
                console.error("Error in createOrder service:", error);
                throw error; // Re-throw for controller to handle
            }
        });
    }
    ;
    verifyPayment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = params;
            // Find the payment record
            const payment = yield Payment_1.Payment.findOne({ razorpay_order_id });
            if (!payment) {
                throw new Error("Payment record not found");
            }
            // Verify the signature
            const generatedSignature = crypto_1.default
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
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
            yield payment.save();
            return payment;
        });
    }
}
exports.default = PaymentService;
