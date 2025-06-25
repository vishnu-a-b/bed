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
const BaseController_1 = __importDefault(require("../../base/controllers.ts/BaseController"));
const express_validator_1 = require("express-validator");
const ValidationFailedError_1 = __importDefault(require("../../../errors/errorTypes/ValidationFailedError"));
const NotFoundError_1 = __importDefault(require("../../../errors/errorTypes/NotFoundError"));
const BadRequestError_1 = __importDefault(require("../../../errors/errorTypes/BadRequestError"));
const mongoose_1 = __importDefault(require("mongoose"));
const PaymentService_1 = __importDefault(require("../services/PaymentService"));
class PaymentController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.service = new PaymentService_1.default();
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            console.log("create payment", req.body);
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    next(new ValidationFailedError_1.default({ errors: errors.array() }));
                    return;
                }
                const payment = yield this.service.create(req.body);
                this.sendSuccessResponse(res, 201, { data: payment });
            }
            catch (e) {
                next(e);
            }
        });
        this.get = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit, skip } = req.query;
                const { filterQuery, sort } = req;
                const data = yield this.service.find({
                    limit: Number(limit),
                    skip: Number(skip),
                    filterQuery,
                    sort,
                });
                this.sendSuccessResponseList(res, 200, { data });
            }
            catch (e) {
                next(e);
            }
        });
        this.countTotalDocuments = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield this.service.countTotalDocuments();
                this.sendSuccessResponse(res, 200, { data: { count } });
            }
            catch (e) {
                next(e);
            }
        });
        this.getOne = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const payment = yield this.service.findOne(req.params.id);
                if (!payment) {
                    throw new NotFoundError_1.default({ error: "payment not found" });
                }
                this.sendSuccessResponse(res, 200, { data: payment });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid payment_id" }));
                }
                else {
                    next(e);
                }
            }
        });
        this.getSupporterDetails = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const supporterId = req.params.id; // Get from URL parameter
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
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    next(new ValidationFailedError_1.default({ errors: errors.array() }));
                    return;
                }
                console.log("update payment", req.body, req.params.id);
                const payment = yield this.service.update({
                    id: req.params.id,
                    payment: req.body,
                });
                if (!payment) {
                    throw new NotFoundError_1.default({ error: "payment not found" });
                }
                this.sendSuccessResponse(res, 200, { data: { _id: payment._id } });
            }
            catch (e) {
                console.error("Error in update payment:", e);
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid payment_id" }));
                }
                else {
                    next(e);
                }
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const payment = yield this.service.delete(req.params.id);
                if (!payment) {
                    throw new NotFoundError_1.default({ error: "payment not found" });
                }
                this.sendSuccessResponse(res, 204, { data: {} });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid payment_id" }));
                }
                else {
                    next(e);
                }
            }
        });
        this.createOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("create order", req.body);
                const { supporterId } = req.body;
                const order = yield this.service.createOrder({
                    supporterId,
                });
                res.json(order);
            }
            catch (error) {
                console.error(error);
                if (error instanceof Error) {
                    if (error instanceof Error) {
                        if (error instanceof Error) {
                            res
                                .status(500)
                                .json({
                                error: error instanceof Error
                                    ? error.message
                                    : "An unknown error occurred",
                            });
                        }
                        else {
                            res.status(500).json({ error: "An unknown error occurred" });
                        }
                    }
                    else {
                        res.status(500).json({ error: "An unknown error occurred" });
                    }
                }
                else {
                    res.status(500).json({ error: "An unknown error occurred" });
                }
            }
        });
        this.verifyPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
                const payment = yield this.service.verifyPayment({
                    razorpay_payment_id,
                    razorpay_order_id,
                    razorpay_signature,
                });
                res.json(payment);
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({
                    error: error instanceof Error
                        ? error.message
                        : "An unknown error occurred",
                });
            }
        });
    }
}
exports.default = PaymentController;
