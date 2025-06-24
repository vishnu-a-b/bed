"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Staff = exports.staffFilterFields = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const staffRoles_1 = require("../../base/enums/staffRoles");
const staffSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, maxLength: 200, required: true },
    country: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Country",
        required: true,
    },
    organization: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
    role: {
        type: String,
        required: true,
        maxLength: 20,
        enum: Object.values(staffRoles_1.StaffRoles),
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    salary: { type: Number },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.staffFilterFields = {
    filterFields: [
        "user",
        "country",
        "organization",
        "isActive",
    ],
    searchFields: ["name"],
    sortFields: ["createdAt", "updatedAt"],
};
exports.Staff = mongoose_1.default.model("Staff", staffSchema);
