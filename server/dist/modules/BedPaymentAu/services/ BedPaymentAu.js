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
// PayPal SDK Configuration
const environment = process.env.NODE_ENV === "production"
    ? new checkout_server_sdk_1.default.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new checkout_server_sdk_1.default.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new checkout_server_sdk_1.default.core.PayPalHttpClient(environment);
class BedPaymentAuService {
    constructor() {
        this.createPayment = (params) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
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
                    .populate("user", "email phone address") // Populate user field with email, phone, and address
                    .populate("bed", "bedNo") // Populate bed info including amount and organization
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
                const userPhone = (_b = contributorData.user) === null || _b === void 0 ? void 0 : _b.phone;
                const userAddress = (_c = contributorData.user) === null || _c === void 0 ? void 0 : _c.address;
                // Extract bed and payment data
                const bed = contributorData.bed;
                const currency = ((_d = bed === null || bed === void 0 ? void 0 : bed.country) === null || _d === void 0 ? void 0 : _d.currency) || "USD"; // Default to USD if currency not found
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
                        bed: (_e = contributorData.bed) === null || _e === void 0 ? void 0 : _e._id,
                        bedNo: (_f = contributorData.bed) === null || _f === void 0 ? void 0 : _f.bedNo,
                        currency: currency,
                    },
                });
                const approvalUrl = (_h = (_g = order.result.links) === null || _g === void 0 ? void 0 : _g.find((link) => link.rel === "approve")) === null || _h === void 0 ? void 0 : _h.href;
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
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
                                programName: ((_o = payment.contribution) === null || _o === void 0 ? void 0 : _o.description) ||
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
}
exports.default = BedPaymentAuService;
