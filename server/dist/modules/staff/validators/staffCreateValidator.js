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
exports.staffCreateValidator = void 0;
const express_validator_1 = require("express-validator");
const User_1 = require("../../user/models/User");
const Country_1 = require("../../country/models/Country");
const staffRoles_1 = require("../../base/enums/staffRoles");
const Staff_1 = require("../models/Staff");
const Organization_1 = require("../../organization/models/Organization");
exports.staffCreateValidator = [
    (0, express_validator_1.body)("user").custom((userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield User_1.User.findById(userId);
            if (!user) {
                return Promise.reject("user not found");
            }
            const staff = yield Staff_1.Staff.find({ user: user._id });
            if (staff && staff.length > 0) {
                return Promise.reject("there is already a staff for that userId");
            }
            return Promise.resolve();
        }
        catch (_) {
            return Promise.reject();
        }
    })),
    (0, express_validator_1.body)("country").custom((countryId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const country = yield Country_1.Country.findById(countryId);
            if (!country) {
                return Promise.reject("country not found");
            }
            return Promise.resolve();
        }
        catch (_) {
            return Promise.reject();
        }
    })),
    (0, express_validator_1.body)("organization").custom((organizationId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const organization = yield Organization_1.Organization.findById(organizationId);
            if (!organization) {
                return Promise.reject("organization not found");
            }
            return Promise.resolve();
        }
        catch (_) {
            return Promise.reject();
        }
    })),
    (0, express_validator_1.body)("role").isIn(Object.values(staffRoles_1.StaffRoles)),
];
