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
const UserService_1 = __importDefault(require("../../user/services/UserService"));
const roles_1 = __importDefault(require("../../base/enums/roles"));
const User_1 = require("../../user/models/User");
const Role_1 = require("../../role/models/Role");
const CountryService_1 = __importDefault(require("../services/CountryService"));
class CountryController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.service = new CountryService_1.default();
        this.userService = new UserService_1.default();
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    next(new ValidationFailedError_1.default({ errors: errors.array() }));
                    return;
                }
                const country = yield this.service.create(req.body);
                const head = yield this.userService.findOne(req.body.head);
                const headRole = yield Role_1.Role.findOne({ slug: roles_1.default.countryHead });
                if (head && headRole) {
                    const roles = head.roles.map((role) => role._id);
                    roles.push(headRole._id);
                    yield User_1.User.findByIdAndUpdate({ _id: head._id }, {
                        roles,
                    });
                }
                this.sendSuccessResponse(res, 201, { data: country });
            }
            catch (e) {
                next(e);
            }
        });
        this.get = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit, skip, search } = req.query;
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
                const country = yield this.service.findOne(req.params.id);
                if (!country) {
                    throw new NotFoundError_1.default({ error: "country not found" });
                }
                this.sendSuccessResponse(res, 200, { data: country });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid country_id" }));
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
                const country = yield this.service.update({
                    id: req.params.id,
                    data: req.body,
                });
                if (!country) {
                    throw new NotFoundError_1.default({ error: "country not found" });
                }
                this.sendSuccessResponse(res, 200, { data: { _id: country._id } });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid country_id" }));
                }
                next(e);
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const country = yield this.service.delete(req.params.id);
                if (!country) {
                    throw new NotFoundError_1.default({ error: "country not found" });
                }
                this.sendSuccessResponse(res, 204, { data: {} });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid country_id" }));
                }
                next(e);
            }
        });
        this.filterByHead = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const countrys = yield this.service.filterByHead(req.params.id);
                this.sendSuccessResponse(res, 200, { data: countrys });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid head_id" }));
                }
                next(e);
            }
        });
    }
}
exports.default = CountryController;
