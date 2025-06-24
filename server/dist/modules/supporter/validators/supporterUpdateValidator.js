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
exports.supporterUpdateValidator = void 0;
const express_validator_1 = require("express-validator");
const staffRoles_1 = require("../../base/enums/staffRoles");
const Bed_1 = require("../../bed/models/Bed");
exports.supporterUpdateValidator = [
    (0, express_validator_1.body)("bed").custom((countryId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const country = yield Bed_1.Bed.findById(countryId);
            if (!country) {
                return Promise.reject("country not found");
            }
            return Promise.resolve();
        }
        catch (_) {
            return Promise.reject();
        }
    })),
    (0, express_validator_1.body)("role").optional().isIn(Object.values(staffRoles_1.StaffRoles))
];
