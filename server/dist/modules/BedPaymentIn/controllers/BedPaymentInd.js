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
const BedPaymentInd_1 = __importDefault(require("../services/BedPaymentInd"));
const BaseController_1 = __importDefault(require("../../base/controllers.ts/BaseController"));
class BedPaymentIndController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.service = new BedPaymentInd_1.default();
        // Create a new Razorpay order
        this.createOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { supporterId } = req.body;
                if (!supporterId) {
                    return res.status(400).json({
                        success: false,
                        error: "Supporter ID is required",
                    });
                }
                const result = yield this.service.createOrder({ supporterId });
                return res.json({
                    success: true,
                    data: {
                        orderId: result.data.orderId,
                        amount: result.data.amount,
                        currency: result.data.currency,
                        key: result.data.key,
                    },
                });
            }
            catch (error) {
                console.error("Error in createOrder controller:", error);
                let statusCode = 500;
                let errorMessage = "An unknown error occurred";
                if (error instanceof Error) {
                    errorMessage = error.message;
                    if (error.message.includes("not found")) {
                        statusCode = 404;
                    }
                    else if (error.message.includes("required") ||
                        error.message.includes("Invalid")) {
                        statusCode = 400;
                    }
                }
                return res.status(statusCode).json({
                    success: false,
                    error: errorMessage,
                });
            }
        });
        // Create Razorpay order for Hosted Checkout (Embedded Checkout)
        this.createOrderHosted = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { supporterId, callback_url, cancel_url } = req.body;
                if (!supporterId) {
                    return res.status(400).json({
                        success: false,
                        error: "Supporter ID is required",
                    });
                }
                if (!callback_url || !cancel_url) {
                    return res.status(400).json({
                        success: false,
                        error: "Callback URL and Cancel URL are required for hosted checkout",
                    });
                }
                const result = yield this.service.createOrderHosted({
                    supporterId,
                    callback_url,
                    cancel_url
                });
                return res.json({
                    success: true,
                    data: {
                        orderId: result.data.orderId,
                        amount: result.data.amount,
                        currency: result.data.currency,
                        key: result.data.key,
                        customerName: result.data.customerName,
                        customerEmail: result.data.customerEmail,
                        customerContact: result.data.customerContact,
                        callbackUrl: result.data.callbackUrl,
                        cancelUrl: result.data.cancelUrl,
                        hostedCheckoutUrl: result.data.hostedCheckoutUrl,
                        description: result.data.description,
                        image: result.data.image,
                        name: result.data.name,
                    },
                });
            }
            catch (error) {
                console.error("Error in createOrderHosted controller:", error);
                let statusCode = 500;
                let errorMessage = "An unknown error occurred";
                if (error instanceof Error) {
                    errorMessage = error.message;
                    if (error.message.includes("not found")) {
                        statusCode = 404;
                    }
                    else if (error.message.includes("required") ||
                        error.message.includes("Invalid")) {
                        statusCode = 400;
                    }
                }
                return res.status(statusCode).json({
                    success: false,
                    error: errorMessage,
                });
            }
        });
        // Verify Razorpay payment
        this.verifyPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
                if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
                    return res.status(400).json({
                        success: false,
                        error: "Payment ID, Order ID, and Signature are required",
                    });
                }
                const payment = yield this.service.verifyPayment({
                    razorpay_payment_id,
                    razorpay_order_id,
                    razorpay_signature,
                });
                return res.json(payment);
            }
            catch (error) {
                console.error("Error in verifyPayment controller:", error);
                return res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                });
            }
        });
        // Send payment reminder
        this.sendPaymentReminderController = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { phoneNumber, email, name, amount, bedNo, supportLink, vcLink } = req.body;
                const result = yield this.service.sendPaymentReminder({
                    phoneNumber,
                    email,
                    name,
                    amount,
                    bedNo,
                    supportLink,
                    vcLink,
                });
                res.status(200).json({
                    success: true,
                    message: `Payment reminder sent successfully`,
                    results: result,
                });
            }
            catch (error) {
                console.error("Error sending payment reminder:", error.message || error);
                res.status(500).json({
                    success: false,
                    message: error.message || "Failed to send payment reminder",
                });
            }
        });
        // Get all payments with filtering
        this.getAllPayments = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.query, { page, limit, sort, status, currency, purpose, source, email, startDate, endDate } = _a, otherFilters = __rest(_a, ["page", "limit", "sort", "status", "currency", "purpose", "source", "email", "startDate", "endDate"]);
                // Build query filters
                const query = {};
                if (status)
                    query.status = status;
                if (currency)
                    query.currency = currency;
                if (purpose)
                    query["contribution.purpose"] = purpose;
                if (source)
                    query.source = source;
                if (email)
                    query.email = { $regex: email, $options: "i" };
                // Date range filter
                if (startDate || endDate) {
                    query.paymentDate = {};
                    if (startDate)
                        query.paymentDate.$gte = new Date(startDate);
                    if (endDate)
                        query.paymentDate.$lte = new Date(endDate);
                }
                Object.assign(query, otherFilters);
                const result = yield this.service.getAllPayments(query);
                return res.json(result);
            }
            catch (error) {
                console.error("Error in getAllPayments controller:", error);
                return res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                });
            }
        });
        // Get payment by ID
        this.getPaymentById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: "Payment ID is required",
                    });
                }
                const result = yield this.service.getPaymentById(id);
                return res.json(result);
            }
            catch (error) {
                console.error("Error in getPaymentById controller:", error);
                const statusCode = error instanceof Error && error.message.includes("not found")
                    ? 404
                    : 500;
                return res.status(statusCode).json({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                });
            }
        });
        // Get payment statistics
        this.getPaymentStats1 = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.service.getPaymentStatistics();
                this.sendSuccessResponse(res, 200, {
                    message: "Payment statistics retrieved successfully",
                    data: stats,
                });
            }
            catch (e) {
                console.error("Error in getPaymentStats controller:", e);
                next(e);
            }
        });
        // Get payments with filters
        this.get = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit, skip, startDate, endDate } = req.query;
                const { filterQuery, sort } = req;
                const data = yield this.service.find({
                    limit: Number(limit),
                    skip: Number(skip),
                    filterQuery,
                    sort,
                }, startDate, endDate);
                this.sendSuccessResponseList(res, 200, { data });
            }
            catch (e) {
                next(e);
            }
        });
        // Get payments with advanced search
        this.getPayments = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { limit, skip, search, status__eq, paymentMode__eq } = req.query;
                const { filterQuery, sort } = req;
                const filters = ((_a = req.body) === null || _a === void 0 ? void 0 : _a.filters) || {};
                const startDate = filters.startDate && filters.startDate.trim()
                    ? filters.startDate
                    : undefined;
                const endDate = filters.endDate && filters.endDate.trim() ? filters.endDate : undefined;
                let additionalFilters = {};
                if (status__eq && status__eq !== "all") {
                    additionalFilters.status = status__eq;
                }
                if (paymentMode__eq && paymentMode__eq !== "all") {
                    additionalFilters.paymentMode = paymentMode__eq;
                }
                const data = yield this.service.findPayments({
                    limit: Number(limit) || 10,
                    skip: Number(skip) || 0,
                    filterQuery: Object.assign(Object.assign({}, filterQuery), additionalFilters),
                    sort: sort || { paymentDate: -1 },
                    search: search,
                }, startDate, endDate);
                this.sendSuccessResponseList(res, 200, { data });
            }
            catch (e) {
                console.error("Error in getPayments controller:", e);
                next(e);
            }
        });
        // Update payment
        this.updatePayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updateData = req.body;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: "Payment ID is required",
                    });
                }
                // Remove fields that shouldn't be updated directly
                const { razorpay_payment_id, razorpay_order_id, status, isVerified } = updateData, allowedUpdates = __rest(updateData, ["razorpay_payment_id", "razorpay_order_id", "status", "isVerified"]);
                const result = yield this.service.updatePayment({
                    id,
                    updateData: allowedUpdates,
                });
                return res.json(result);
            }
            catch (error) {
                console.error("Error in updatePayment controller:", error);
                const statusCode = error instanceof Error && error.message.includes("not found")
                    ? 404
                    : 500;
                return res.status(statusCode).json({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                });
            }
        });
        // Delete payment
        this.deletePayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: "Payment ID is required",
                    });
                }
                const result = yield this.service.deletePayment(id);
                return res.json(result);
            }
            catch (error) {
                console.error("Error in deletePayment controller:", error);
                const statusCode = error instanceof Error && error.message.includes("not found")
                    ? 404
                    : 500;
                return res.status(statusCode).json({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                });
            }
        });
        // Get supporter details with payments
        this.getSupporterDetails = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const supporterId = req.params.id;
                const result = yield this.service.findOneSupporterPayments(supporterId);
                res.json(result);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(404).json({ message: error.message });
                }
                else {
                    res.status(404).json({ message: "An unknown error occurred" });
                }
            }
        });
        // Create manual/offline payment
        this.createManualPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { amount, currency = "INR", name, email, phNo, address, manualMethod, transactionReference, paymentDate, remarks, contribution, source = "website", supporter, bed, } = req.body;
                const recordedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!amount || amount <= 0) {
                    return res.status(400).json({
                        success: false,
                        error: "Amount must be greater than 0",
                    });
                }
                if (!manualMethod) {
                    return res.status(400).json({
                        success: false,
                        error: "Manual payment method is required",
                    });
                }
                const result = yield this.service.createManualPayment({
                    amount,
                    currency,
                    name,
                    email,
                    phNo,
                    address,
                    manualMethod,
                    transactionReference,
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                    remarks,
                    contribution,
                    source,
                    recordedBy,
                    supporter,
                    bed,
                });
                return res.status(201).json(result);
            }
            catch (error) {
                console.error("Error in createManualPayment controller:", error);
                let statusCode = 500;
                let errorMessage = "An unknown error occurred";
                if (error instanceof Error) {
                    errorMessage = error.message;
                    if (error.message.includes("not found")) {
                        statusCode = 404;
                    }
                    else if (error.message.includes("required") ||
                        error.message.includes("Invalid")) {
                        statusCode = 400;
                    }
                }
                return res.status(statusCode).json({
                    success: false,
                    error: errorMessage,
                });
            }
        });
        // Approve/reject manual payment
        this.approveManualPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const { approved = true, remarks } = req.body;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: "Payment ID is required",
                    });
                }
                const approvedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!approvedBy) {
                    return res.status(401).json({
                        success: false,
                        error: "User authentication required",
                    });
                }
                const result = yield this.service.approveManualPayment({
                    id,
                    approved,
                    approvedBy,
                    remarks,
                });
                return res.json(result);
            }
            catch (error) {
                console.error("Error in approveManualPayment controller:", error);
                const statusCode = error instanceof Error && error.message.includes("not found")
                    ? 404
                    : 500;
                return res.status(statusCode).json({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                });
            }
        });
        // Refund payment
        this.refundPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { amount, reason } = req.body;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: "Payment ID is required",
                    });
                }
                const result = yield this.service.refundPayment(id, {
                    amount,
                    reason,
                });
                return res.json(result);
            }
            catch (error) {
                console.error("Error in refundPayment controller:", error);
                const statusCode = error instanceof Error && error.message.includes("not found")
                    ? 404
                    : 500;
                return res.status(statusCode).json({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                });
            }
        });
        // Get payment statistics
        this.getPaymentStats = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate } = req.query;
                const dateFilter = {};
                if (startDate)
                    dateFilter.$gte = new Date(startDate);
                if (endDate)
                    dateFilter.$lte = new Date(endDate);
                const matchStage = dateFilter ? { paymentDate: dateFilter } : {};
                const stats = yield this.service.getAllPayments(matchStage);
                return res.json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                console.error("Error in getPaymentStats controller:", error);
                return res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                });
            }
        });
    }
}
exports.default = BedPaymentIndController;
