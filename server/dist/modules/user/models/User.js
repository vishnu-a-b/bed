"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.userFilterFields = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const genders_1 = require("../../base/enums/genders");
const maritalStatuses_1 = require("../../base/enums/maritalStatuses");
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: false, maxLength: 100 },
    countryCode: {
        type: String,
        maxLength: 10,
    },
    mobileNo: { type: String, required: true, unique: true, maxLength: 20 },
    password: { type: String, required: true, maxLength: 150, select: false },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function (value) {
                return value <= new Date();
            },
            message: "Invalid date of birth - should not be in the future",
        },
    },
    gender: {
        type: String,
        maxLength: 20,
        enum: Object.values(genders_1.Genders),
    },
    maritalStatus: {
        type: String,
        maxLength: 20,
        enum: Object.values(maritalStatuses_1.MaritalStatuses),
    },
    roles: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Role" }],
    isActive: {
        type: Boolean,
        default: true,
    },
    isSuperAdmin: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.userFilterFields = {
    filterFields: [
        "name",
        "mobileNo",
        "email",
        "gender",
        "maritalStatus",
        "isActive",
        "isSuperAdmin",
    ],
    searchFields: ["name", "mobileNo", "email"],
    sortFields: ["createdAt", "updatedAt"],
};
exports.User = mongoose_1.default.model("User", userSchema);
