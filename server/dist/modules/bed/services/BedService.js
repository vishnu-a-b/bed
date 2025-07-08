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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NotFoundError_1 = __importDefault(require("../../../errors/errorTypes/NotFoundError"));
const Bed_1 = require("../models/Bed");
class BedService {
    constructor() {
        this.create = (bed) => __awaiter(this, void 0, void 0, function* () {
            console.log("BedService create", bed);
            try {
                return yield Bed_1.Bed.create(bed);
            }
            catch (error) {
                //console.error("Error creating bed:", error);
                throw new Error("Failed to create bed");
            }
        });
        this.find = (_a) => __awaiter(this, [_a], void 0, function* ({ limit, skip, filterQuery, sort }) {
            limit = limit ? limit : 10;
            try {
                console.log("BedService find - raw input:", JSON.stringify(filterQuery, null, 2));
                // Deep clone and sanitize the filter query
                const sanitizedFilter = JSON.parse(JSON.stringify(filterQuery || {}));
                // Handle $regex on bedNo by converting to exact match (if possible)
                const sanitizeBedNo = (obj) => {
                    var _a;
                    if (typeof obj !== "object" || obj === null)
                        return;
                    for (const key in obj) {
                        if (key === "bedNo" && ((_a = obj[key]) === null || _a === void 0 ? void 0 : _a.$regex)) {
                            // Try to convert regex to number (if it's a simple digit match)
                            const regexStr = obj[key].$regex;
                            if (/^\d+$/.test(regexStr)) {
                                obj[key] = Number(regexStr); // Exact match
                            }
                            else {
                                delete obj[key]; // Remove if not a pure number
                            }
                        }
                        else if (key === "$or" && Array.isArray(obj[key])) {
                            obj[key] = obj[key]
                                .map((condition) => {
                                var _a;
                                if ((_a = condition === null || condition === void 0 ? void 0 : condition.bedNo) === null || _a === void 0 ? void 0 : _a.$regex) {
                                    const regexStr = condition.bedNo.$regex;
                                    if (/^\d+$/.test(regexStr)) {
                                        return Object.assign(Object.assign({}, condition), { bedNo: Number(regexStr) });
                                    }
                                    return {}; // Remove invalid conditions
                                }
                                return condition;
                            })
                                .filter((c) => Object.keys(c).length > 0);
                        }
                        else {
                            sanitizeBedNo(obj[key]);
                        }
                    }
                };
                sanitizeBedNo(sanitizedFilter);
                const beds = yield Bed_1.Bed.find(sanitizedFilter)
                    .populate(["organization", "country", "head"])
                    .sort(sort)
                    .limit(limit)
                    .skip(skip);
                const total = yield Bed_1.Bed.countDocuments(sanitizedFilter);
                return {
                    total,
                    limit,
                    skip,
                    items: beds,
                };
            }
            catch (error) {
                console.error("Error finding beds:", error);
                throw new Error("Failed to fetch beds");
            }
        });
        this.countTotalDocuments = () => __awaiter(this, void 0, void 0, function* () { return yield Bed_1.Bed.countDocuments(); });
        this.findOne = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Bed_1.Bed.findById(id).populate(["organization", "country"]);
        });
        this.findOneWithUserId = (id) => __awaiter(this, void 0, void 0, function* () {
            const beds = yield Bed_1.Bed.find({ user: id })
                .populate(["organization", "country"])
                .limit(1);
            if (beds.length < 1)
                throw new NotFoundError_1.default({ error: "Bed not found" });
            return beds[0];
        });
        this.update = (_a) => __awaiter(this, [_a], void 0, function* ({ id, bed }) {
            return yield Bed_1.Bed.findByIdAndUpdate(id, bed);
        });
        this.delete = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Bed_1.Bed.findByIdAndDelete(id);
        });
    }
}
exports.default = BedService;
