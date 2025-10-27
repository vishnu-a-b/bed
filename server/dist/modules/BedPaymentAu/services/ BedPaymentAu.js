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
// server/src/modules/payment/services/ BedPaymentAuService.ts
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
const _BedPaymentAu_1 = require("../models/ BedPaymentAu");
const mongoose_1 = __importDefault(require("mongoose"));
const DonationReceiptMailer_1 = __importDefault(require("../../../services/DonationReceiptMailer"));
const Supporter_1 = require("../../supporter/models/Supporter");
const mailService_1 = __importDefault(require("../../../services/mailService"));
const environment = process.env.NODE_ENV === "production"
    ? new checkout_server_sdk_1.default.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new checkout_server_sdk_1.default.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new checkout_server_sdk_1.default.core.PayPalHttpClient(environment);
class BedPaymentAuService {
    constructor() {
        this.createPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
                const contributorData = yield Supporter_1.Supporter.findById(supporter)
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
                const userEmail = (_a = contributorData.user) === null || _a === void 0 ? void 0 : _a.email;
                // Extract bed and payment data
                const bed = contributorData.bed;
                const currency = ((_b = bed === null || bed === void 0 ? void 0 : bed.country) === null || _b === void 0 ? void 0 : _b.currency) || "USD"; // Default to USD if currency not found
                const amount = contributorData.amount || (bed === null || bed === void 0 ? void 0 : bed.amount) || (bed === null || bed === void 0 ? void 0 : bed.fixedAmount); // Use supporter amount, or fallback to bed amount/fixedAmount
                if (!userEmail) {
                    throw new Error("Supporter email not found");
                }
                if (!amount) {
                    throw new Error("Payment amount not found");
                }
                if (!currency) {
                    throw new Error("Currency not found");
                }
                // Check for existing pending payment for this supporter
                // This check looks for payments created within the last 30 minutes that are still pending
                const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
                const existingPendingPayment = yield _BedPaymentAu_1.BedPaymentAu.findOne({
                    supporter: contributorData._id,
                    status: "pending",
                    paymentMode: "online",
                    createdAt: { $gte: thirtyMinutesAgo },
                }).sort({ createdAt: -1 });
                // If there's an existing pending payment, reuse it
                if (existingPendingPayment && existingPendingPayment.paypal_order_id) {
                    console.log("Reusing existing PayPal order:", existingPendingPayment.paypal_order_id);
                    // Verify the PayPal order is still valid
                    try {
                        const orderRequest = new checkout_server_sdk_1.default.orders.OrdersGetRequest(existingPendingPayment.paypal_order_id);
                        const orderDetails = yield client.execute(orderRequest);
                        // If order is still valid and not expired, reuse it
                        if (orderDetails.result.status === "CREATED" || orderDetails.result.status === "APPROVED") {
                            const approvalUrl = (_d = (_c = orderDetails.result.links) === null || _c === void 0 ? void 0 : _c.find((link) => link.rel === "approve")) === null || _d === void 0 ? void 0 : _d.href;
                            return {
                                success: true,
                                data: {
                                    orderId: existingPendingPayment.paypal_order_id,
                                    amount: existingPendingPayment.amount,
                                    currency: existingPendingPayment.currency,
                                    approvalUrl: approvalUrl || "",
                                    paymentId: existingPendingPayment._id,
                                },
                            };
                        }
                    }
                    catch (orderError) {
                        console.log("Existing PayPal order is no longer valid, creating new one");
                        // If order is no longer valid, mark old payment as cancelled and create new one
                        existingPendingPayment.status = "cancelled";
                        existingPendingPayment.notes = Object.assign(Object.assign({}, existingPendingPayment.notes), { cancelled_reason: "Order expired or invalid", cancelled_at: new Date() });
                        yield existingPendingPayment.save();
                    }
                }
                const searchFieldsData = {
                    supporterName: contributorData.name,
                    supporterEmail: contributorData.email,
                    supporterMobile: contributorData.mobileNo,
                    bedNumber: ((_f = (_e = contributorData.bed) === null || _e === void 0 ? void 0 : _e.bedNo) === null || _f === void 0 ? void 0 : _f.toString()) || "",
                };
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
                const order = yield client.execute(request);
                // Create payment record with supporter data
                const payment = yield _BedPaymentAu_1.BedPaymentAu.create({
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
                        bed: (_g = contributorData.bed) === null || _g === void 0 ? void 0 : _g._id,
                        bedNo: (_h = contributorData.bed) === null || _h === void 0 ? void 0 : _h.bedNo,
                        currency: currency,
                    },
                    searchFields: searchFieldsData,
                });
                const approvalUrl = (_k = (_j = order.result.links) === null || _j === void 0 ? void 0 : _j.find((link) => link.rel === "approve")) === null || _k === void 0 ? void 0 : _k.href;
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
                throw new Error(`Failed to create payment: ${error.message}`);
            }
        });
        this.verifyPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            const { paypal_order_id, paypal_payment_id } = params;
            const payment = yield _BedPaymentAu_1.BedPaymentAu.findOne({
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
                        const payerEmail = (_h = (_g = payment === null || payment === void 0 ? void 0 : payment.supporter) === null || _g === void 0 ? void 0 : _g.user) === null || _h === void 0 ? void 0 : _h.email;
                        const payerName = (_k = (_j = payment === null || payment === void 0 ? void 0 : payment.supporter) === null || _j === void 0 ? void 0 : _j.user) === null || _k === void 0 ? void 0 : _k.name;
                        const address = ((_m = (_l = payment === null || payment === void 0 ? void 0 : payment.supporter) === null || _l === void 0 ? void 0 : _l.user) === null || _m === void 0 ? void 0 : _m.address) || "";
                        const phone = ((_p = (_o = payment === null || payment === void 0 ? void 0 : payment.supporter) === null || _o === void 0 ? void 0 : _o.user) === null || _p === void 0 ? void 0 : _p.mobileNo) || "";
                        if (payerEmail) {
                            yield DonationReceiptMailer_1.default.sendDonationReceiptEmail({
                                email: payerEmail,
                                name: payerName,
                                phoneNo: phone,
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
                                programName: ((_q = payment.contribution) === null || _q === void 0 ? void 0 : _q.description) ||
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
        this.getAllPayments = (...args_1) => __awaiter(this, [...args_1], void 0, function* (query = {}, options = {}) {
            const { page = 1, limit = 10, sort = "-createdAt", populate = false } = options, filters = __rest(options, ["page", "limit", "sort", "populate"]);
            const skip = (page - 1) * limit;
            let queryBuilder = _BedPaymentAu_1.BedPaymentAu.find(Object.assign(Object.assign({}, query), filters))
                .sort(sort)
                .skip(skip)
                .limit(limit);
            if (populate) {
                queryBuilder = queryBuilder
                    .populate("recordedBy", "name email")
                    .populate("approvedBy", "name email");
            }
            const payments = yield queryBuilder.exec();
            const total = yield _BedPaymentAu_1.BedPaymentAu.countDocuments(Object.assign(Object.assign({}, query), filters));
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
            const payment = yield _BedPaymentAu_1.BedPaymentAu.findById(id)
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
            const payment = yield _BedPaymentAu_1.BedPaymentAu.findByIdAndUpdate(id, updateData, {
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
        });
        this.deletePayment = (id) => __awaiter(this, void 0, void 0, function* () {
            const payment = yield _BedPaymentAu_1.BedPaymentAu.findByIdAndDelete(id);
            if (!payment) {
                throw new Error("Payment not found");
            }
            return {
                success: true,
                message: "Payment deleted successfully",
            };
        });
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
                    month: { start: monthStart, end: monthEnd },
                });
                // Aggregate queries
                const [totalStats, todayStats, weekStats, monthStats] = yield Promise.all([
                    // Total completed payments
                    _BedPaymentAu_1.BedPaymentAu.aggregate([
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
                    _BedPaymentAu_1.BedPaymentAu.aggregate([
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
                    _BedPaymentAu_1.BedPaymentAu.aggregate([
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
                    _BedPaymentAu_1.BedPaymentAu.aggregate([
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
                const payment = yield _BedPaymentAu_1.BedPaymentAu.find(finalFilter)
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
                const total = yield _BedPaymentAu_1.BedPaymentAu.countDocuments(finalFilter);
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
        this.approvePayment = (id, approvedBy) => __awaiter(this, void 0, void 0, function* () {
            const payment = yield _BedPaymentAu_1.BedPaymentAu.findById(id);
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
            const payment = yield _BedPaymentAu_1.BedPaymentAu.findById(id);
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
            const paymentsData = yield _BedPaymentAu_1.BedPaymentAu.aggregate([
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
                        isApproved: 1,
                        paypal_payment_id: 1, // Changed from razorpay_payment_id
                        transactionReference: 1,
                        // Include any other payment fields you need
                    },
                },
                { $sort: { createdAt: -1 } }, // Sort by newest first
            ]);
            // 3. Calculate payment totals
            const totals = yield _BedPaymentAu_1.BedPaymentAu.aggregate([
                {
                    $match: {
                        supporter: new mongoose_1.default.Types.ObjectId(supporterId),
                        status: { $in: ["captured", "completed"] }, // Count both captured and completed payments
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
        this.sendPaymentReminder = (options) => __awaiter(this, void 0, void 0, function* () {
            const { phoneNumber, email, name, amount, bedNo, supportLink, vcLink } = options;
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
                yield mailService_1.default.sendPaymentReminderEmail({
                    to: email,
                    name,
                    amount,
                    bedNo,
                    supportLink,
                    vcLink,
                });
            }
            return { phoneNumber, email, name, amount, bedNo, supportLink };
        });
        this.findPayments = (_a, startDate_1, endDate_1) => __awaiter(this, [_a, startDate_1, endDate_1], void 0, function* ({ limit, skip, filterQuery, sort, search }, startDate, endDate) {
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
                        paymentDate: Object.assign(Object.assign({}, (startDate &&
                            startDate.trim() && {
                            $gte: (() => {
                                const d = new Date(startDate);
                                d.setHours(0, 0, 0, 0);
                                return d;
                            })(),
                        })), (endDate &&
                            endDate.trim() && {
                            $lte: (() => {
                                const d = new Date(endDate);
                                d.setHours(23, 59, 59, 999);
                                return d;
                            })(),
                        })),
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
                const finalFilter = Object.assign(Object.assign(Object.assign({}, filterQuery), dateFilter), searchFilter);
                console.log("Final filter query:", JSON.stringify(finalFilter, null, 2));
                const payments = yield _BedPaymentAu_1.BedPaymentAu.find(finalFilter)
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
                const total = yield _BedPaymentAu_1.BedPaymentAu.countDocuments(finalFilter);
                console.log(`Found ${payments.length} payments out of ${total} total`);
                return {
                    total,
                    limit,
                    skip,
                    items: payments,
                };
            }
            catch (error) {
                console.error("Error finding bed payments:", error);
                throw error;
            }
        });
        // Add these methods to your BedPaymentAuService class
        this.createManualPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            const { amount, currency = "AUD", name, email, phNo, address, manualMethod, transactionReference, paymentDate = new Date(), remarks, contribution = {
                purpose: "general_donation",
                description: "Manual donation"
            }, source = "website", recordedBy, supporter, bed } = params;
            console.log(params);
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
                const payment = yield _BedPaymentAu_1.BedPaymentAu.create(Object.assign(Object.assign(Object.assign({ amount,
                    currency, status: "pending", paymentMode: "offline", manualMethod,
                    transactionReference,
                    remarks,
                    paymentDate,
                    contribution,
                    source,
                    recordedBy, isApproved: false, 
                    // Store basic payer info for manual payments
                    payer: email || name ? {
                        email_address: email,
                        name: name ? {
                            given_name: name.split(" ")[0] || "",
                            surname: name.split(" ").slice(1).join(" ") || ""
                        } : undefined
                    } : undefined }, (supporter && { supporter })), (bed && { bed })), { searchFields: searchFieldsData, notes: {
                        manual_payment: true,
                        created_by: recordedBy,
                        payer_info: {
                            name,
                            email,
                            phNo,
                            address
                        }
                    } }));
                console.log(payment);
                return {
                    success: true,
                    data: { payment },
                };
            }
            catch (error) {
                console.error("Error creating manual payment:", error);
                throw new Error(`Failed to create manual payment: ${error.message}`);
            }
        });
        this.approveManualPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
            console.log(params);
            const { id, approved, approvedBy, remarks } = params;
            const payment = yield _BedPaymentAu_1.BedPaymentAu.findById(id)
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
                yield payment.save();
                // If approved, send receipt email
                if (approved) {
                    try {
                        // Determine email and name from various sources
                        const payerEmail = ((_a = payment.payer) === null || _a === void 0 ? void 0 : _a.email_address) ||
                            ((_c = (_b = payment.supporter) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.email) ||
                            ((_e = (_d = payment.notes) === null || _d === void 0 ? void 0 : _d.payer_info) === null || _e === void 0 ? void 0 : _e.email);
                        const payerName = ((_g = (_f = payment.payer) === null || _f === void 0 ? void 0 : _f.name) === null || _g === void 0 ? void 0 : _g.given_name)
                            ? `${payment.payer.name.given_name} ${payment.payer.name.surname || ''}`.trim()
                            : ((_j = (_h = payment.supporter) === null || _h === void 0 ? void 0 : _h.user) === null || _j === void 0 ? void 0 : _j.name) ||
                                ((_l = (_k = payment.notes) === null || _k === void 0 ? void 0 : _k.payer_info) === null || _l === void 0 ? void 0 : _l.name) ||
                                "Donor";
                        const payerPhone = ((_o = (_m = payment.supporter) === null || _m === void 0 ? void 0 : _m.user) === null || _o === void 0 ? void 0 : _o.mobileNo) ||
                            ((_q = (_p = payment.notes) === null || _p === void 0 ? void 0 : _p.payer_info) === null || _q === void 0 ? void 0 : _q.phNo) ||
                            "";
                        const payerAddress = ((_s = (_r = payment.supporter) === null || _r === void 0 ? void 0 : _r.user) === null || _s === void 0 ? void 0 : _s.address) ||
                            ((_u = (_t = payment.notes) === null || _t === void 0 ? void 0 : _t.payer_info) === null || _u === void 0 ? void 0 : _u.address) ||
                            "";
                        if (payerEmail) {
                            yield DonationReceiptMailer_1.default.sendDonationReceiptEmail({
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
                                programName: ((_v = payment.contribution) === null || _v === void 0 ? void 0 : _v.description) || "Manual Contribution",
                            });
                            console.log(`Manual payment receipt email sent to ${payerEmail}`);
                            // Update notes to indicate email was sent
                            payment.notes = Object.assign(Object.assign({}, payment.notes), { receipt_email_sent: true, receipt_email_sent_at: new Date() });
                            yield payment.save();
                        }
                        else {
                            console.warn(`No email address found for manual payment ${payment.receiptNumber}`);
                            // Update notes to indicate email could not be sent
                            payment.notes = Object.assign(Object.assign({}, payment.notes), { receipt_email_failed: true, receipt_email_error: "No email address available" });
                            yield payment.save();
                        }
                    }
                    catch (emailError) {
                        console.error("Failed to send manual payment receipt email:", emailError);
                        // Update notes with email error but don't fail the approval
                        payment.notes = Object.assign(Object.assign({}, payment.notes), { receipt_email_failed: true, receipt_email_error: emailError.message, receipt_email_retry_needed: true });
                        yield payment.save();
                    }
                }
                return {
                    success: true,
                    data: { payment },
                };
            }
            catch (error) {
                console.error("Error approving manual payment:", error);
                throw new Error(`Failed to approve manual payment: ${error.message}`);
            }
        });
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
}
exports.default = BedPaymentAuService;
