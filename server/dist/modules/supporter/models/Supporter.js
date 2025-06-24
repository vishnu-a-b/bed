"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supporter = exports.supporterFilterFields = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const staffRoles_1 = require("../../base/enums/staffRoles");
const supporterSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, maxLength: 200, required: true },
    bed: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Bed",
        required: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    role: {
        type: String,
        required: true,
        maxLength: 20,
        enum: Object.values(staffRoles_1.StaffRoles),
    },
    type: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    amount: { type: Number },
    verificationStatus: {
        type: String,
    },
}, { timestamps: true });
exports.supporterFilterFields = {
    filterFields: [
        "user",
        "bed",
        "isActive",
    ],
    searchFields: ["name"],
    sortFields: ["createdAt", "updatedAt", "registrationDate"],
};
exports.Supporter = mongoose_1.default.model("Supporter", supporterSchema);
