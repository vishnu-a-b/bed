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
const mongoose_1 = __importDefault(require("mongoose"));
const BadRequestError_1 = __importDefault(require("../../../errors/errorTypes/BadRequestError"));
const SupporterService_1 = __importDefault(require("../services/SupporterService"));
const mailService_1 = __importDefault(require("../../../services/mailService"));
class SupporterController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.service = new SupporterService_1.default();
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            console.log("create supporter", req.body);
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    next(new ValidationFailedError_1.default({ errors: errors.array() }));
                    return;
                }
                const supporter = yield this.service.create(req.body);
                if (supporter && supporter._id) {
                    yield mailService_1.default.sendWelcomeEmail({
                        supporterId: supporter._id.toString(),
                    });
                }
                this.sendSuccessResponse(res, 201, { data: supporter });
            }
            catch (e) {
                next(e);
            }
        });
        this.get = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { limit, skip } = req.query;
                const { filterQuery, sort } = req;
                console.log(req.body);
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
        this.getAllData = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.service.findAllData();
                this.sendSuccessResponseList(res, 200, { data });
            }
            catch (e) {
                next(e);
            }
        });
        this.getSupporterHead = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("getSupporterHead called");
                const data = yield this.service.findHeadingData();
                this.sendSuccessResponseList(res, 200, { data });
            }
            catch (e) {
                next(e);
            }
        });
        // In your controller
        this.getCountryDetails = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const countryId = req.params.id; // Get from URL parameter
                const result = yield this.service.findOneCountryData(countryId);
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
        this.getBedDetails = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bedId = req.params.id; // Get from URL parameter
                const result = yield this.service.findOneBedData(bedId);
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
                const supporter = yield this.service.findOne(req.params.id);
                if (!supporter) {
                    throw new NotFoundError_1.default({ error: "supporter not found" });
                }
                this.sendSuccessResponse(res, 200, { data: supporter });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid supporter_id" }));
                }
                next(e);
            }
        });
        this.getWithUserId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const supporter = yield this.service.findOneWithUserId(req.params.id);
                this.sendSuccessResponse(res, 200, { data: supporter });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid supporter_id" }));
                }
                next(e);
            }
        });
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    next(new ValidationFailedError_1.default({ errors: errors.array() }));
                    return;
                }
                const supporter = yield this.service.update({
                    id: req.params.id,
                    supporter: req.body,
                });
                if (!supporter) {
                    throw new NotFoundError_1.default({ error: "supporter not found" });
                }
                this.sendSuccessResponse(res, 200, { data: { _id: supporter._id } });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid supporter_id" }));
                }
                next(e);
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const supporter = yield this.service.delete(req.params.id);
                if (!supporter) {
                    throw new NotFoundError_1.default({ error: "supporter not found" });
                }
                this.sendSuccessResponse(res, 204, { data: {} });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid supporter_id" }));
                }
                next(e);
            }
        });
    }
}
exports.default = SupporterController;
