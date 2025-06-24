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
exports.staffUpdateValidator = void 0;
const express_validator_1 = require("express-validator");
const Country_1 = require("../../country/models/Country");
const staffRoles_1 = require("../../base/enums/staffRoles");
const Organization_1 = require("../../organization/models/Organization");
const staffTypes_1 = require("../../base/enums/staffTypes");
exports.staffUpdateValidator = [
    (0, express_validator_1.body)("country")
        .optional()
        .custom((countryId) => __awaiter(void 0, void 0, void 0, function* () {
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
    (0, express_validator_1.body)("organization")
        .optional()
        .custom((organizationId) => __awaiter(void 0, void 0, void 0, function* () {
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
    (0, express_validator_1.body)("joinDate").optional().isISO8601(),
    (0, express_validator_1.body)("role").optional().isIn(Object.values(staffRoles_1.StaffRoles)),
    (0, express_validator_1.body)("type").optional().isIn(Object.values(staffTypes_1.StaffTypes)),
];
