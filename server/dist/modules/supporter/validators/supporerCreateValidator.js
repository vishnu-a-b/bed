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
Object.defineProperty(exports, "__esModule", { value: true });
exports.supporterCreateValidator = void 0;
const express_validator_1 = require("express-validator");
const User_1 = require("../../user/models/User");
const staffRoles_1 = require("../../base/enums/staffRoles");
const Supporter_1 = require("../models/Supporter");
const Bed_1 = require("../../bed/models/Bed");
exports.supporterCreateValidator = [
    (0, express_validator_1.body)("user").custom((userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield User_1.User.findById(userId);
            if (!user) {
                return Promise.reject("user not found");
            }
            const supporter = yield Supporter_1.Supporter.find({ user: user._id });
            if (supporter && supporter.length > 0) {
                return Promise.reject("there is already a supporter for that userId");
            }
            return Promise.resolve();
        }
        catch (_) {
            return Promise.reject();
        }
    })),
    (0, express_validator_1.body)("bed").custom((bedId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const bed = yield Bed_1.Bed.findById(bedId);
            if (!bed) {
                return Promise.reject("bed not found");
            }
            return Promise.resolve();
        }
        catch (_) {
            return Promise.reject();
        }
    })),
    (0, express_validator_1.body)("role").isIn(Object.values(staffRoles_1.StaffRoles)),
];
