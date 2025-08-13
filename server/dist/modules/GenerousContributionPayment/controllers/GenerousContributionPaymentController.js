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
const GenerousContributionPaymentService_1 = __importDefault(require("../services/GenerousContributionPaymentService"));
const BaseController_1 = __importDefault(require("../../base/controllers.ts/BaseController"));
class GenerousContributionPaymentController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.service = new GenerousContributionPaymentService_1.default();
        // Create a new payment order
        this.createPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            try {
                const { amount, currency, contributor, contribution, source } = req.body;
                // Validation
                if (!amount || !contributor) {
                    return res.status(400).json({
                        success: false,
                        error: "Amount, contributor, and contribution details are required",
                    });
                }
                if (!contributor.name || !contributor.phone) {
                    return res.status(400).json({
                        success: false,
                        error: "Contributor name and email are required",
                    });
                }
                const result = yield this.service.createPayment({
                    amount,
                    currency,
                    contributor,
                    source,
                });
                return res.status(201).json(result);
            }
            catch (error) {
                console.error("Error in createPayment controller:", error);
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
        // Verify PayPal payment
        this.verifyPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { paypal_order_id, paypal_payment_id } = req.body;
                if (!paypal_order_id) {
                    return res.status(400).json({
                        success: false,
                        error: "PayPal order ID is required",
                    });
                }
                const result = yield this.service.verifyPayment({
                    paypal_order_id,
                });
                return res.json(result);
            }
            catch (error) {
                console.error("Error in verifyPayment controller:", error);
                return res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "An unknown error occurred",
                });
            }
        });
        // Get all payments with filtering and pagination
        this.getAllPayments = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.query, { page, limit, sort, status, currency, purpose, source, campaign, email, startDate, endDate } = _a, otherFilters = __rest(_a, ["page", "limit", "sort", "status", "currency", "purpose", "source", "campaign", "email", "startDate", "endDate"]);
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
                if (campaign)
                    query.campaign = campaign;
                if (email)
                    query["contributor.email"] = { $regex: email, $options: "i" };
                // Date range filter
                if (startDate || endDate) {
                    query.paymentDate = {};
                    if (startDate)
                        query.paymentDate.$gte = new Date(startDate);
                    if (endDate)
                        query.paymentDate.$lte = new Date(endDate);
                }
                // Add other filters
                Object.assign(query, otherFilters);
                const options = {
                    page: page ? parseInt(page) : 1,
                    limit: limit ? parseInt(limit) : 10,
                    sort: sort || "-createdAt",
                    populate: true,
                };
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
                const { paypal_payment_id, paypal_order_id, status, isVerified } = updateData, allowedUpdates = __rest(updateData, ["paypal_payment_id", "paypal_order_id", "status", "isVerified"]);
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
        this.getPaymentStats = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.service.getPaymentStatistics();
                this.sendSuccessResponse(res, 200, {
                    message: "Payment statistics retrieved successfully",
                    data: stats
                });
            }
            catch (e) {
                console.error("Error in getPaymentStats controller:", e);
                next(e);
            }
        });
        this.search = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { limit, skip } = req.query;
                const { filterQuery, sort } = req;
                const filters = ((_a = req.body) === null || _a === void 0 ? void 0 : _a.filters) || {};
                const startDate = filters.startDate;
                const endDate = filters.endDate;
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
        // Create manual/offline payment
        this.createManualPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { amount, currency, contributor, contribution, manualMethod, transactionReference, remarks, } = req.body;
                // Get recorded by user (from auth middleware)
                const recordedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = yield this.service.createManualPayment({
                    amount,
                    currency,
                    contributor,
                    manualMethod,
                    transactionReference,
                    remarks,
                    recordedBy,
                });
                return res.status(201).json(result);
            }
            catch (error) {
                console.error("Error in createManualPayment controller:", error);
                return res.status(500).json({
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
        this.getPaymentStats1 = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate, groupBy = "day" } = req.query;
                // Build date filter
                const dateFilter = {};
                if (startDate)
                    dateFilter.$gte = new Date(startDate);
                if (endDate)
                    dateFilter.$lte = new Date(endDate);
                const matchStage = dateFilter ? { paymentDate: dateFilter } : {};
                // Aggregation pipeline for statistics
                const stats = yield this.service.getAllPayments(matchStage);
                // You can add more complex aggregation logic here
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
        this.getPayments = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { limit, skip } = req.query;
                const { filterQuery, sort } = req;
                console.log("Request body:", req.body);
                const filters = ((_a = req.body) === null || _a === void 0 ? void 0 : _a.filters) || {};
                const startDate = filters.startDate;
                const endDate = filters.endDate;
                const data = yield this.service.findPayments({
                    limit: Number(limit) || 10,
                    skip: Number(skip) || 0,
                    filterQuery: filterQuery || {},
                    sort: sort || { paymentDate: -1 }, // Default sort by payment date descending
                }, startDate, endDate);
                this.sendSuccessResponseList(res, 200, { data });
            }
            catch (e) {
                console.error("Error in getPayments controller:", e);
                next(e);
            }
        });
    }
}
exports.default = GenerousContributionPaymentController;
