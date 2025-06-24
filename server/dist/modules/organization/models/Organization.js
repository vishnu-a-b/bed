"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = exports.organizationFilterFields = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const organizationSchema = new mongoose_1.default.Schema({
    name: { type: String, maxLength: 200, required: true },
    address: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Address" },
    photos: [{ type: String, maxLength: 200 }],
    management: {
        type: String,
        maxLength: 200,
    },
    contactMobileNumbers: [{ type: String, maxLength: 20, required: false }],
    contactLandlines: [{ type: String, maxLength: 20, required: false }],
    admin: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    vcLink: {
        type: String,
    },
}, { timestamps: true });
exports.organizationFilterFields = {
    filterFields: ["admin", "management"],
    searchFields: ["name"],
    sortFields: ["createdAt", "updatedAt"],
};
exports.Organization = mongoose_1.default.model("Organization", organizationSchema);
