"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bed = exports.bedFilterFields = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bedSchema = new mongoose_1.default.Schema({
    organization: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Organization" },
    country: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Country" },
    bedNo: { type: Number },
    maxNoContributer: { type: Number, default: 15 },
    amount: { type: Number },
    fixedAmount: { type: Number },
    patientName: { type: String },
    address: { type: String },
    qrPhoto: { type: String, required: false, maxLength: 200 },
    head: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    vcLink: {
        type: String,
    }
}, { timestamps: true });
exports.bedFilterFields = {
    filterFields: [],
    searchFields: ["bedNo"],
    sortFields: ["bedNo", "createdAt", "updatedAt"],
};
exports.Bed = mongoose_1.default.model("Bed", bedSchema);
