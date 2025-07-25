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
const Payment_1 = require("../models/Payment");
const Supporter_1 = require("../../supporter/models/Supporter");
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
// PayPal client setup - moved to top and fixed
const environment = process.env.NODE_ENV === 'production'
    ? new checkout_server_sdk_1.default.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new checkout_server_sdk_1.default.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const paypalClient = new checkout_server_sdk_1.default.core.PayPalHttpClient(environment);
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
        this.findPaymentHeadingData = () => __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            return yield Payment_1.Payment.aggregate([
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
        });
        this.find = (_a, startDate_1, endDate_1) => __awaiter(this, [_a, startDate_1, endDate_1], void 0, function* ({ limit, skip, filterQuery, sort }, startDate, endDate) {
            console.log("Service received dates:", startDate, endDate);
            try {
                limit = limit ? limit : 10;
                skip = skip ? skip : 0;
                let dateFilter = {};
                if (startDate || endDate) {
                    dateFilter = {
                        paymentDate: Object.assign(Object.assign({}, (startDate && {
                            $gte: (() => {
                                const d = new Date(startDate);
                                d.setHours(0, 0, 0, 0);
                                return d;
                            })(),
                        })), (endDate && {
                            $lte: (() => {
                                const d = new Date(endDate);
                                d.setHours(23, 59, 59, 999);
                                return d;
                            })(),
                        })),
                    };
                }
                const finalFilter = Object.assign(Object.assign({}, filterQuery), dateFilter);
                console.log("Final filter query:", finalFilter);
                const payment = yield Payment_1.Payment.find(finalFilter)
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
                const total = yield Payment_1.Payment.countDocuments(finalFilter);
                return {
                    total,
                    limit,
                    skip,
                    items: payment,
                };
            }
            catch (error) {
                console.error("Error finding supporters:", error);
                throw error;
            }
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
                        paypal_payment_id: 1, // Changed from razorpay_payment_id
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
                        ? payment.paypal_payment_id // Changed from razorpay_payment_id
                        : payment.transactionReference,
                    // Include any other payment fields you need
                })),
            };
        });
    }
    createOrder(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const { supporterId } = params;
            if (!supporterId) {
                throw new Error("supporterId is required");
            }
            console.log("Creating PayPal order for supporter:", supporterId);
            try {
                // Get supporter details
                const supporter = yield Supporter_1.Supporter.findById(supporterId).populate([{ path: "user" }, { path: "bed", populate: { path: "country" } }]);
                if (!supporter) {
                    throw new Error("Supporter not found");
                }
                if (!supporter.amount || isNaN(Number(supporter.amount))) {
                    throw new Error("Invalid amount specified for supporter");
                }
                // Create PayPal order
                const request = new checkout_server_sdk_1.default.orders.OrdersCreateRequest();
                request.prefer("return=representation");
                request.requestBody({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: ((_a = supporter.bed.country) === null || _a === void 0 ? void 0 : _a.currency) || "USD",
                                value: supporter.amount.toFixed(2), // PayPal expects string with 2 decimal places
                            },
                            description: `Payment for bed support - ${supporter.bed._id}`,
                            custom_id: supporterId.toString(),
                            reference_id: `supporter_${supporterId}_${Date.now()}`,
                        },
                    ],
                    application_context: {
                        brand_name: "Your App Name",
                        landing_page: "BILLING",
                        user_action: "PAY_NOW",
                        return_url: `${process.env.CLIENT_URL}/payment/success`,
                        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
                    },
                });
                // Use the properly declared paypalClient
                const order = yield paypalClient.execute(request);
                // Create payment record
                const payment = new Payment_1.Payment({
                    paypal_order_id: order.result.id,
                    amount: Number(supporter.amount),
                    currency: ((_b = supporter.bed.country) === null || _b === void 0 ? void 0 : _b.currency) || "USD",
                    status: "pending",
                    method: "paypal",
                    paymentMode: "online",
                    supporter: supporterId,
                    bed: supporter.bed._id,
                    email: (_c = supporter.user) === null || _c === void 0 ? void 0 : _c.email,
                    contact: (_d = supporter.user) === null || _d === void 0 ? void 0 : _d.phoneNumber,
                    created_at: Math.floor(Date.now() / 1000),
                    paypal_payment_status: order.result.status,
                    notes: {
                        order_id: order.result.id,
                        supporter_id: supporterId,
                    },
                });
                yield payment.save();
                // Get approval URL
                const approvalUrl = (_f = (_e = order.result.links) === null || _e === void 0 ? void 0 : _e.find((link) => link.rel === "approve")) === null || _f === void 0 ? void 0 : _f.href;
                return {
                    success: true,
                    data: {
                        orderId: order.result.id,
                        amount: Number(supporter.amount),
                        currency: ((_g = supporter.bed.country) === null || _g === void 0 ? void 0 : _g.currency) || "USD",
                        clientId: process.env.PAYPAL_CLIENT_ID,
                        approvalUrl: approvalUrl,
                    },
                };
            }
            catch (error) {
                console.error("Error in createOrder service:", error);
                throw error;
            }
        });
    }
    verifyPayment(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { paypal_order_id, paypal_payment_id, paypal_payer_id } = params;
            // Find the payment record
            const payment = yield Payment_1.Payment.findOne({ paypal_order_id });
            if (!payment) {
                throw new Error("Payment record not found");
            }
            try {
                // Capture the PayPal order
                const request = new checkout_server_sdk_1.default.orders.OrdersCaptureRequest(paypal_order_id);
                request.requestBody({});
                // Use the properly declared paypalClient
                const capture = yield paypalClient.execute(request);
                if (capture.result.status === "COMPLETED") {
                    // Extract payment details from capture result
                    const captureDetails = capture.result.purchase_units[0].payments.captures[0];
                    // Update payment record
                    payment.paypal_payment_id = captureDetails.id;
                    payment.paypal_payer_id = paypal_payer_id;
                    payment.status = "captured";
                    payment.paypal_payment_status = "COMPLETED";
                    payment.isVerified = true;
                    // Store PayPal fees and net amount if available
                    if (captureDetails.seller_receivable_breakdown) {
                        payment.paypal_transaction_fee = parseFloat(((_a = captureDetails.seller_receivable_breakdown.paypal_fee) === null || _a === void 0 ? void 0 : _a.value) || "0");
                        payment.paypal_net_amount = parseFloat(((_b = captureDetails.seller_receivable_breakdown.net_amount) === null || _b === void 0 ? void 0 : _b.value) || "0");
                    }
                    yield payment.save();
                    return payment;
                }
                else {
                    throw new Error(`Payment capture failed with status: ${capture.result.status}`);
                }
            }
            catch (error) {
                // Update payment status to failed
                payment.status = "failed";
                payment.paypal_payment_status = "FAILED";
                yield payment.save();
                throw error;
            }
        });
    }
}
exports.default = PaymentService;
