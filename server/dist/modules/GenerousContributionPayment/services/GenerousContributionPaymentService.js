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
// server/src/modules/payment/services/GenerousContributionPaymentService.ts
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
const GenerousContributionPayment_1 = require("../models/GenerousContributionPayment");
const DonationReceiptMailer_1 = __importDefault(require("../../../services/DonationReceiptMailer"));
// PayPal SDK Configuration
const environment = process.env.NODE_ENV === "production"
    ? new checkout_server_sdk_1.default.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new checkout_server_sdk_1.default.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new checkout_server_sdk_1.default.core.PayPalHttpClient(environment);
class GenerousContributionPaymentService {
    constructor() {
        this.createPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { amount, currency = "USD", contributor, source = "website", } = params;
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
                const request = new checkout_server_sdk_1.default.orders.OrdersCreateRequest();
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
                const order = yield client.execute(request);
                const payment = yield GenerousContributionPayment_1.GenerousContributionPayment.create({
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
                const approvalUrl = (_b = (_a = order.result.links) === null || _a === void 0 ? void 0 : _a.find((link) => link.rel === "approve")) === null || _b === void 0 ? void 0 : _b.href;
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
            }
            catch (error) {
                console.error("Error creating payment:", error);
                throw new Error("Failed to create payment");
            }
        });
        this.verifyPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const { paypal_order_id, paypal_payment_id } = params;
            const payment = yield GenerousContributionPayment_1.GenerousContributionPayment.findOne({
                paypal_order_id,
            });
            console.warn(payment);
            if (!payment) {
                throw new Error("Payment record not found");
            }
            try {
                const request = new checkout_server_sdk_1.default.orders.OrdersCaptureRequest(paypal_order_id);
                request.requestBody({});
                const capture = yield client.execute(request);
                if (capture.result.status === "COMPLETED") {
                    // Update payment record
                    payment.paypal_payment_id = paypal_payment_id || capture.result.id;
                    payment.paypal_payer_id = (_a = capture.result.payer) === null || _a === void 0 ? void 0 : _a.payer_id;
                    payment.paypal_capture_id =
                        (_f = (_e = (_d = (_c = (_b = capture.result.purchase_units) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.payments) === null || _d === void 0 ? void 0 : _d.captures) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.id;
                    payment.status = "completed";
                    payment.isApproved = true;
                    payment.paypal_capture_response = capture.result; // Store complete capture response
                    payment.notes = Object.assign(Object.assign({}, payment.notes), { paypal_capture: capture.result });
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
                    yield payment.save();
                    // Send receipt email after successful payment verification
                    try {
                        const payerEmail = payment.email;
                        const payerName = payment.name;
                        const address = payment.address || "";
                        if (payerEmail) {
                            yield DonationReceiptMailer_1.default.sendDonationReceiptEmail({
                                email: payerEmail,
                                name: payerName,
                                phoneNo: payment.phNo,
                                amount: payment.amount,
                                address: address,
                                transactionNumber: payment.paypal_capture_id ||
                                    payment.paypal_payment_id ||
                                    payment.paypal_order_id,
                                receiptNumber: payment.receiptNumber,
                                date: new Date(payment.paymentDate).toLocaleDateString("en-AU", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                }),
                                programName: ((_g = payment.contribution) === null || _g === void 0 ? void 0 : _g.description) ||
                                    "Generous Contribution Program",
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
                            paypal_response: capture.result,
                        },
                    };
                }
                throw new Error(`Payment capture failed with status: ${capture.result.status}`);
            }
            catch (error) {
                console.error("Error verifying payment:", error);
                payment.status = "failed";
                payment.error_details = {
                    error_code: error.code || "VERIFICATION_FAILED",
                    error_message: error.message,
                    debug_id: error.debug_id || null,
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
                // Updated to match the actual model structure
                const payments = yield GenerousContributionPayment_1.GenerousContributionPayment.find(finalFilter)
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
                const total = yield GenerousContributionPayment_1.GenerousContributionPayment.countDocuments(finalFilter);
                console.log(`Found ${payments.length} payments out of ${total} total`);
                return {
                    total,
                    limit,
                    skip,
                    items: payments,
                };
            }
            catch (error) {
                console.error("Error finding generous contribution payments:", error);
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
                weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                console.log("Date ranges:", {
                    today: { start: todayStart, end: todayEnd },
                    week: { start: weekStart, end: weekEnd },
                    month: { start: monthStart, end: monthEnd }
                });
                // Aggregate queries
                const [totalStats, todayStats, weekStats, monthStats] = yield Promise.all([
                    // Total completed payments
                    GenerousContributionPayment_1.GenerousContributionPayment.aggregate([
                        {
                            $match: {
                                status: "completed"
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amount" },
                                totalCount: { $sum: 1 },
                                avgAmount: { $avg: "$amount" }
                            }
                        }
                    ]),
                    // Today's completed payments
                    GenerousContributionPayment_1.GenerousContributionPayment.aggregate([
                        {
                            $match: {
                                status: "completed",
                                paymentDate: {
                                    $gte: todayStart,
                                    $lte: todayEnd
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amount" },
                                totalCount: { $sum: 1 }
                            }
                        }
                    ]),
                    // This week's completed payments
                    GenerousContributionPayment_1.GenerousContributionPayment.aggregate([
                        {
                            $match: {
                                status: "completed",
                                paymentDate: {
                                    $gte: weekStart,
                                    $lte: weekEnd
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amount" },
                                totalCount: { $sum: 1 }
                            }
                        }
                    ]),
                    // This month's completed payments
                    GenerousContributionPayment_1.GenerousContributionPayment.aggregate([
                        {
                            $match: {
                                status: "completed",
                                paymentDate: {
                                    $gte: monthStart,
                                    $lte: monthEnd
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amount" },
                                totalCount: { $sum: 1 }
                            }
                        }
                    ])
                ]);
                // Format results
                const formatStats = (stats) => {
                    var _a, _b, _c;
                    return ({
                        amount: ((_a = stats[0]) === null || _a === void 0 ? void 0 : _a.totalAmount) || 0,
                        count: ((_b = stats[0]) === null || _b === void 0 ? void 0 : _b.totalCount) || 0,
                        avgAmount: ((_c = stats[0]) === null || _c === void 0 ? void 0 : _c.avgAmount) || 0
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
                        month: { start: monthStart, end: monthEnd }
                    }
                };
                console.log("Payment statistics result:", result);
                return result;
            }
            catch (error) {
                console.error("Error getting payment statistics:", error);
                throw error;
            }
        });
        // Route Definition (add this to your routes file)
        // router.get('/generous-payments/stats', controller.getPaymentStats);
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
                // Updated to match the actual model structure
                const payment = yield GenerousContributionPayment_1.GenerousContributionPayment.find(finalFilter)
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
                const total = yield GenerousContributionPayment_1.GenerousContributionPayment.countDocuments(finalFilter);
                return {
                    total,
                    limit,
                    skip,
                    items: payment,
                };
            }
            catch (error) {
                console.error("Error finding generous contribution payments:", error);
                throw error;
            }
        });
        this.getAllPayments = (...args_1) => __awaiter(this, [...args_1], void 0, function* (query = {}, options = {}) {
            const { page = 1, limit = 10, sort = "-createdAt", populate = false } = options, filters = __rest(options, ["page", "limit", "sort", "populate"]);
            const skip = (page - 1) * limit;
            let queryBuilder = GenerousContributionPayment_1.GenerousContributionPayment.find(Object.assign(Object.assign({}, query), filters))
                .sort(sort)
                .skip(skip)
                .limit(limit);
            if (populate) {
                queryBuilder = queryBuilder
                    .populate("recordedBy", "name email")
                    .populate("approvedBy", "name email");
            }
            const payments = yield queryBuilder.exec();
            const total = yield GenerousContributionPayment_1.GenerousContributionPayment.countDocuments(Object.assign(Object.assign({}, query), filters));
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
            const payment = yield GenerousContributionPayment_1.GenerousContributionPayment.findById(id)
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
            const payment = yield GenerousContributionPayment_1.GenerousContributionPayment.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
            if (!payment) {
                throw new Error("Payment not found");
            }
            return {
                success: true,
                data: { payment },
            };
        });
        this.deletePayment = (id) => __awaiter(this, void 0, void 0, function* () {
            const payment = yield GenerousContributionPayment_1.GenerousContributionPayment.findByIdAndDelete(id);
            if (!payment) {
                throw new Error("Payment not found");
            }
            return {
                success: true,
                message: "Payment deleted successfully",
            };
        });
        this.createManualPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            const { amount, currency = "USD", contributor, manualMethod, transactionReference, remarks, recordedBy, } = params;
            if (!amount || amount <= 0) {
                throw new Error("Amount must be greater than 0");
            }
            // if (!contributor.name || !contributor.email) {
            //   throw new Error("Contributor name and email are required");
            // }
            // if (!contribution.purpose) {
            //   throw new Error("Contribution purpose is required");
            // }
            const payment = yield GenerousContributionPayment_1.GenerousContributionPayment.create({
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
        });
        this.approvePayment = (id, approvedBy) => __awaiter(this, void 0, void 0, function* () {
            const payment = yield GenerousContributionPayment_1.GenerousContributionPayment.findById(id);
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
            var _a;
            const payment = yield GenerousContributionPayment_1.GenerousContributionPayment.findById(id);
            if (!payment) {
                throw new Error("Payment not found");
            }
            if (payment.status !== "completed") {
                throw new Error("Only completed payments can be refunded");
            }
            try {
                if (payment.paypal_capture_id) {
                    const request = new checkout_server_sdk_1.default.payments.CapturesRefundRequest(payment.paypal_capture_id);
                    request.requestBody({
                        amount: {
                            currency_code: payment.currency,
                            value: ((_a = refundData.amount) === null || _a === void 0 ? void 0 : _a.toString()) || payment.amount.toString(),
                        },
                        note_to_payer: refundData.reason || "Refund processed",
                    });
                    const refund = yield client.execute(request);
                    if (refund.result.status === "COMPLETED") {
                        payment.status = "refunded";
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
exports.default = GenerousContributionPaymentService;
