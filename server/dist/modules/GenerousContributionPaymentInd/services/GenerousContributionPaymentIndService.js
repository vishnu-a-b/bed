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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/modules/GenerousContributionPaymentInd/services/GenerousContributionPaymentIndService.ts
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const GenerousContributionPaymentInd_1 = require("../models/GenerousContributionPaymentInd");
const DonationReceiptMailerIndia_1 = __importDefault(require("../../../services/DonationReceiptMailerIndia"));
// Razorpay SDK Configuration
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
class GenerousContributionPaymentIndService {
    constructor() {
        this.createPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            const { amount, currency = "INR", contributor, source = "website", } = params;
            if (!amount || amount <= 0) {
                throw new Error("Amount must be greater than 0");
            }
            if (!contributor.name || !contributor.phone) {
                throw new Error("Contributor name and phone no are required");
            }
            try {
                // Create Razorpay order
                const options = {
                    amount: Math.round(amount * 100), // Convert to paise for Razorpay
                    currency: currency,
                    receipt: `receipt_${Date.now()}`,
                    notes: {
                        contributor_name: contributor.name,
                        contributor_email: contributor.email,
                        contributor_phone: contributor.phone,
                    },
                };
                const order = yield razorpay.orders.create(options);
                // Create payment record in database
                const payment = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.create({
                    razorpay_order_id: order.id,
                    amount, // Store in rupees
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
                        key: process.env.RAZORPAY_KEY_ID,
                    },
                };
            }
            catch (error) {
                console.error("Error creating payment:", error);
                throw new Error("Failed to create payment");
            }
        });
        this.verifyPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;
            const payment = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.findOne({
                razorpay_order_id,
            });
            if (!payment) {
                throw new Error("Payment record not found");
            }
            try {
                // Verify signature
                const body = razorpay_order_id + "|" + razorpay_payment_id;
                const expectedSignature = crypto_1.default
                    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                    .update(body.toString())
                    .digest("hex");
                if (expectedSignature !== razorpay_signature) {
                    throw new Error("Invalid payment signature");
                }
                // Fetch payment details from Razorpay
                const razorpayPayment = yield razorpay.payments.fetch(razorpay_payment_id);
                if (razorpayPayment.status === "captured" || razorpayPayment.status === "authorized") {
                    // Update payment record
                    payment.razorpay_payment_id = razorpay_payment_id;
                    payment.razorpay_signature = razorpay_signature;
                    payment.status = "completed";
                    payment.isApproved = true;
                    payment.razorpay_status = razorpayPayment.status;
                    payment.razorpay_payment_response = razorpayPayment;
                    payment.notes = Object.assign(Object.assign({}, payment.notes), { razorpay_payment: razorpayPayment });
                    // Extract payer information from Razorpay response
                    if (razorpayPayment.email) {
                        payment.payer = {
                            email_address: razorpayPayment.email,
                            name: {
                                given_name: ((_a = payment.name) === null || _a === void 0 ? void 0 : _a.split(" ")[0]) || "",
                                surname: ((_b = payment.name) === null || _b === void 0 ? void 0 : _b.split(" ").slice(1).join(" ")) || "",
                            },
                            phone: {
                                phone_number: razorpayPayment.contact || payment.phNo,
                            },
                        };
                    }
                    yield payment.save();
                    // Send receipt email after successful payment verification
                    try {
                        const payerEmail = payment.email;
                        const payerName = payment.name;
                        const address = payment.address || "";
                        if (payerEmail) {
                            yield DonationReceiptMailerIndia_1.default.sendDonationReceiptEmail({
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
                                programName: ((_c = payment.contribution) === null || _c === void 0 ? void 0 : _c.description) ||
                                    "Generous Contribution Program (India)",
                            });
                            console.log(`Donation receipt email sent successfully to ${payerEmail}`);
                        }
                        else {
                            console.warn(`No email address found for payment ${payment.receiptNumber}`);
                        }
                    }
                    catch (emailError) {
                        // Log email error but don't fail the payment verification
                        console.error("Failed to send donation receipt email:", emailError);
                        // Optionally, you could add a flag to retry email sending later
                        payment.notes = Object.assign(Object.assign({}, payment.notes), { email_failed: true, email_error: emailError.message, email_retry_needed: true });
                        yield payment.save();
                    }
                    return {
                        success: true,
                        data: {
                            payment,
                            razorpay_response: razorpayPayment,
                        },
                    };
                }
                throw new Error(`Payment verification failed with status: ${razorpayPayment.status}`);
            }
            catch (error) {
                console.error("Error verifying payment:", error);
                payment.status = "failed";
                payment.error_details = {
                    error_code: error.code || "VERIFICATION_FAILED",
                    error_message: error.message,
                    error_description: error.description || null,
                };
                yield payment.save();
                throw error;
            }
        });
        this.findPayments = (_a, startDate_1, endDate_1) => __awaiter(this, [_a, startDate_1, endDate_1], void 0, function* ({ limit, skip, filterQuery, sort }, startDate, endDate) {
            console.log("Service received dates:", startDate, endDate);
            console.log("Service received filterQuery:", filterQuery);
            try {
                limit = limit || 10;
                skip = skip || 0;
                let dateFilter = {};
                if (startDate || endDate) {
                    dateFilter = {
                        paymentDate: Object.assign(Object.assign({}, (startDate && {
                            $gte: new Date(startDate),
                        })), (endDate && {
                            $lte: new Date(endDate),
                        })),
                    };
                }
                const finalFilter = Object.assign(Object.assign({}, filterQuery), dateFilter);
                console.log("Final filter query:", JSON.stringify(finalFilter, null, 2));
                const payments = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.find(finalFilter)
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
                const total = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.countDocuments(finalFilter);
                console.log(`Found ${payments.length} payments out of ${total} total`);
                return {
                    total,
                    limit,
                    skip,
                    items: payments,
                };
            }
            catch (error) {
                console.error("Error finding generous contribution payments (India):", error);
                throw error;
            }
        });
        // Payment Statistics Service
        this.getPaymentStatistics = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date();
                // Calculate date ranges
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                console.log("Date ranges:", {
                    today: { start: todayStart, end: todayEnd },
                    week: { start: weekStart, end: weekEnd },
                    month: { start: monthStart, end: monthEnd },
                });
                // Aggregate queries
                const [totalStats, todayStats, weekStats, monthStats] = yield Promise.all([
                    // Total completed payments
                    GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.aggregate([
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
                    GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.aggregate([
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
                    GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.aggregate([
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
                    GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.aggregate([
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
                ]);
                // Format results
                const formatStats = (stats) => {
                    var _a, _b, _c;
                    return ({
                        amount: ((_a = stats[0]) === null || _a === void 0 ? void 0 : _a.totalAmount) || 0,
                        count: ((_b = stats[0]) === null || _b === void 0 ? void 0 : _b.totalCount) || 0,
                        avgAmount: ((_c = stats[0]) === null || _c === void 0 ? void 0 : _c.avgAmount) || 0,
                    });
                };
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
            }
            catch (error) {
                console.error("Error getting payment statistics:", error);
                throw error;
            }
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
                const payment = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.find(finalFilter)
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
                const total = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.countDocuments(finalFilter);
                return {
                    total,
                    limit,
                    skip,
                    items: payment,
                };
            }
            catch (error) {
                console.error("Error finding generous contribution payments (India):", error);
                throw error;
            }
        });
        this.getAllPayments = (...args_1) => __awaiter(this, [...args_1], void 0, function* (query = {}, options = {}) {
            const { page = 1, limit = 10, sort = "-createdAt", populate = false } = options, filters = __rest(options, ["page", "limit", "sort", "populate"]);
            const skip = (page - 1) * limit;
            let queryBuilder = GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.find(Object.assign(Object.assign({}, query), filters))
                .sort(sort)
                .skip(skip)
                .limit(limit);
            if (populate) {
                queryBuilder = queryBuilder
                    .populate("recordedBy", "name email")
                    .populate("approvedBy", "name email");
            }
            const payments = yield queryBuilder.exec();
            const total = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.countDocuments(Object.assign(Object.assign({}, query), filters));
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
        });
        this.getPaymentById = (id) => __awaiter(this, void 0, void 0, function* () {
            const payment = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.findById(id)
                .populate("recordedBy", "name email")
                .populate("approvedBy", "name email");
            if (!payment) {
                throw new Error("Payment not found");
            }
            return {
                success: true,
                data: { payment },
            };
        });
        this.updatePayment = (params) => __awaiter(this, void 0, void 0, function* () {
            const { id, updateData } = params;
            const payment = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
            if (!payment) {
                throw new Error("Payment not found");
            }
            return {
                success: true,
                data: { payment },
            };
        });
        this.deletePayment = (id) => __awaiter(this, void 0, void 0, function* () {
            const payment = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.findByIdAndDelete(id);
            if (!payment) {
                throw new Error("Payment not found");
            }
            return {
                success: true,
                message: "Payment deleted successfully",
            };
        });
        this.createManualPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            const { amount, currency = "INR", contributor, manualMethod, transactionReference, remarks, recordedBy, } = params;
            if (!amount || amount <= 0) {
                throw new Error("Amount must be greater than 0");
            }
            const payment = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.create({
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
        });
        this.approvePayment = (id, approvedBy) => __awaiter(this, void 0, void 0, function* () {
            const payment = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.findById(id);
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
            yield payment.save();
            return {
                success: true,
                data: { payment },
            };
        });
        this.refundPayment = (id, refundData) => __awaiter(this, void 0, void 0, function* () {
            const payment = yield GenerousContributionPaymentInd_1.GenerousContributionPaymentInd.findById(id);
            if (!payment) {
                throw new Error("Payment not found");
            }
            if (payment.status !== "completed") {
                throw new Error("Only completed payments can be refunded");
            }
            try {
                if (payment.razorpay_payment_id) {
                    const refundAmount = refundData.amount
                        ? Math.round(refundData.amount * 100) // Convert to paise for Razorpay
                        : Math.round(payment.amount * 100); // Convert to paise for Razorpay
                    const refund = yield razorpay.payments.refund(payment.razorpay_payment_id, {
                        amount: refundAmount,
                        notes: {
                            reason: refundData.reason || "Refund processed",
                        },
                    });
                    if (refund.status === "processed") {
                        payment.status = "refunded";
                        payment.razorpay_refund_response = refund;
                        yield payment.save();
                    }
                }
                return {
                    success: true,
                    data: { payment },
                };
            }
            catch (error) {
                console.error("Error refunding payment:", error);
                throw error;
            }
        });
    }
}
exports.default = GenerousContributionPaymentIndService;
