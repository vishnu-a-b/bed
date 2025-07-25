"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Country = exports.countryFilterFields = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const countrySchema = new mongoose_1.default.Schema({
    name: { type: String, maxLength: 200, required: true },
    organization: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Organization" },
    flag: { type: String, maxLength: 200, required: false },
    currency: { type: String, maxLength: 200, required: true },
    address: {
        type: String,
        maxLength: 500,
        required: false
    },
    phoneNumber: {
        type: String,
        maxLength: 50,
        required: false
    },
    website: {
        type: String,
        maxLength: 200,
        required: false
    },
    head: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.countryFilterFields = {
    filterFields: ["organization", "head"],
    searchFields: ["name"],
    sortFields: ["createdAt", "updatedAt"],
};
exports.Country = mongoose_1.default.model("Country", countrySchema);
