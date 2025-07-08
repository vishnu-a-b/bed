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
const BedService_1 = __importDefault(require("../services/BedService"));
const configs_1 = __importDefault(require("../../../configs/configs"));
class BedController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.service = new BedService_1.default();
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    next(new ValidationFailedError_1.default({ errors: errors.array() }));
                    return;
                }
                let body = req.body;
                if (req.file) {
                    console.log("req.files", req.file);
                    const file = req.file;
                    body.qrPhoto = configs_1.default.domain + "bed/" + file.filename;
                }
                req.body.createdBy = req.user._id;
                const bed = yield this.service.create(req.body);
                this.sendSuccessResponse(res, 201, { data: bed });
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
                const bed = yield this.service.findOne(req.params.id);
                if (!bed) {
                    throw new NotFoundError_1.default({ error: "bed not found" });
                }
                this.sendSuccessResponse(res, 200, { data: bed });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid bed_id" }));
                }
                next(e);
            }
        });
        this.getWithUserId = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bed = yield this.service.findOneWithUserId(req.params.id);
                this.sendSuccessResponse(res, 200, { data: bed });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid bed_id" }));
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
                let body = req.body;
                if (req.file) {
                    console.log("req.files", req.file);
                    const file = req.file;
                    body.qrPhoto = configs_1.default.domain + "bed/" + file.filename;
                }
                req.body.createdBy = req.user._id;
                const bed = yield this.service.update({
                    id: req.params.id,
                    bed: req.body,
                });
                if (!bed) {
                    throw new NotFoundError_1.default({ error: "bed not found" });
                }
                this.sendSuccessResponse(res, 200, { data: { _id: bed._id } });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid bed_id" }));
                }
                next(e);
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const bed = yield this.service.delete(req.params.id);
                if (!bed) {
                    throw new NotFoundError_1.default({ error: "bed not found" });
                }
                this.sendSuccessResponse(res, 204, { data: {} });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid bed_id" }));
                }
                next(e);
            }
        });
    }
}
exports.default = BedController;
