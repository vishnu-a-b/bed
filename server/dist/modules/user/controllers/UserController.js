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
const UserService_1 = __importDefault(require("../services/UserService"));
const express_validator_1 = require("express-validator");
const ValidationFailedError_1 = __importDefault(require("../../../errors/errorTypes/ValidationFailedError"));
const NotFoundError_1 = __importDefault(require("../../../errors/errorTypes/NotFoundError"));
const mongoose_1 = __importDefault(require("mongoose"));
const BadRequestError_1 = __importDefault(require("../../../errors/errorTypes/BadRequestError"));
const configs_1 = __importDefault(require("../../../configs/configs"));
const User_1 = require("../models/User");
const createPasswordHash_1 = require("../../authentication/utils/createPasswordHash");
class UserController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.service = new UserService_1.default();
        this.getList = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit, skip, search } = req.query;
                const { filterQuery, sort } = req;
                const data = yield this.service.list({
                    limit: Number(limit),
                    skip: Number(skip),
                    filterQuery,
                    sort,
                });
                this.sendSuccessResponseList(res, 200, { data });
            }
            catch (e) {
                console.log("error in user list", e);
                next(e);
            }
        });
        this.filterByRole = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit, skip, search } = req.query;
                const { filterQuery, sort } = req;
                const data = yield this.service.filterByRole(req.params.slug, {
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
        this.create = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    next(new ValidationFailedError_1.default({ errors: errors.array() }));
                    return;
                }
                let photoUrls = [];
                if (req.files) {
                    const files = req.files;
                    if (files.photos) {
                        files.photos.forEach((file) => {
                            photoUrls.push(configs_1.default.domain + file.filename);
                        });
                        req.body.photos = photoUrls;
                    }
                    if ((_a = files.profilePicture) === null || _a === void 0 ? void 0 : _a[0]) {
                        req.body.profilePicture =
                            configs_1.default.domain + ((_b = files.profilePicture) === null || _b === void 0 ? void 0 : _b[0].filename);
                    }
                }
                const user = yield this.service.create(req.body);
                if (req.files) {
                    const files = req.files;
                }
                this.sendSuccessResponse(res, 201, { data: user });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid data" }));
                }
                next(e);
            }
        });
        this.getOne = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.service.findOne(req.params.id);
                if (!user) {
                    throw new NotFoundError_1.default({ error: "user not found" });
                }
                this.sendSuccessResponse(res, 200, { data: user });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid user_id" }));
                }
                next(e);
            }
        });
        this.update = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    next(new ValidationFailedError_1.default({ errors: errors.array() }));
                    return;
                }
                let photoUrls = [];
                if (req.files) {
                    const files = req.files;
                    if (files.photos) {
                        files.photos.forEach((file) => {
                            photoUrls.push(configs_1.default.domain + file.filename);
                        });
                        req.body.photos = photoUrls;
                    }
                    if ((_a = files.profilePicture) === null || _a === void 0 ? void 0 : _a[0]) {
                        req.body.profilePicture =
                            configs_1.default.domain + ((_b = files.profilePicture) === null || _b === void 0 ? void 0 : _b[0].filename);
                    }
                }
                if (req.body.mobileNo) {
                    const availableUser = yield User_1.User.findOne({
                        mobileNo: req.body.mobileNo,
                    });
                    if (availableUser && availableUser.id != req.params.id) {
                        next(new ValidationFailedError_1.default({
                            errors: ["user with this mobile number already exists"],
                        }));
                        return;
                    }
                }
                const { name, mobileNo, email, dateOfBirth, gender, maritalStatus, roles, isActive, password, } = req.body;
                const body = {
                    name,
                    mobileNo,
                    password: password ? yield (0, createPasswordHash_1.createPasswordHash)(password) : undefined,
                    email,
                    dateOfBirth,
                    gender,
                    maritalStatus,
                    roles,
                    isActive,
                };
                if (req.body.photo) {
                    body.photo = req.body.photo;
                }
                const user = yield this.service.update(req.params.id, body);
                if (!user) {
                    throw new NotFoundError_1.default({ error: "user not found" });
                }
                this.sendSuccessResponse(res, 200, { data: { _id: user._id } });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid user_id" }));
                }
                next(e);
            }
        });
        this.updatePassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    next(new ValidationFailedError_1.default({ errors: errors.array() }));
                    return;
                }
                const { oldPassword, newPassword } = req.body;
                const user = yield this.service.updatePassword(req.params.id, oldPassword, newPassword);
                this.sendSuccessResponse(res, 200, { data: { _id: user._id } });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid user_id" }));
                }
                next(e);
            }
        });
        this.delete = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.service.delete(req.params.id);
                if (!user) {
                    throw new NotFoundError_1.default({ error: "user not found" });
                }
                this.sendSuccessResponse(res, 204, { data: {} });
            }
            catch (e) {
                if (e instanceof mongoose_1.default.Error.CastError) {
                    next(new BadRequestError_1.default({ error: "invalid user id" }));
                }
                next(e);
            }
        });
        // createAverageFaceDescriptors = async (
        //   req: Request,
        //   res: Response,
        //   next: NextFunction
        // ) => {
        //   try {
        //     const users = await User.find().limit(1000);
        //     let completedUsers = 0;
        //     for (const user of users) {
        //       console.log("user", user.name);
        //       const descriptors = await FaceDescriptor.find({ user: user.id });
        //       if(descriptors.length>0) {
        //         console.log("got descriptors", descriptors.length);
        //         const averageDescriptor = this.averageDescriptors(
        //           descriptors.map((des) => new Float32Array(des.descriptor))
        //         );
        //         console.log("average descriptor");
        //         console.log(averageDescriptor);
        //         try {
        //           await AverageFaceDescriptor.create({
        //             user: user.id,
        //             descriptor: [...averageDescriptor],
        //           });
        //           console.log("average descriptor created");
        //           completedUsers = completedUsers + 1;
        //         } catch (e) {
        //           console.log("creation error");
        //         }
        //       }
        //     }
        //     this.sendSuccessResponse(res, 204, { data: { total: completedUsers } });
        //   } catch (e: any) {
        //     next(e);
        //   }
        // };
    }
}
exports.default = UserController;
