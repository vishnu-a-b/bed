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
const mongoose_1 = __importDefault(require("mongoose"));
const NotFoundError_1 = __importDefault(require("../../../errors/errorTypes/NotFoundError"));
const Bed_1 = require("../../bed/models/Bed");
const Supporter_1 = require("../models/Supporter");
class SupporterService {
    constructor() {
        this.create = (supporter) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Supporter_1.Supporter.create(supporter);
            }
            catch (e) {
                console.log(e);
            }
        });
        // controllers/supporterController.js
        this.findHeadingData = () => __awaiter(this, void 0, void 0, function* () {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            return yield Supporter_1.Supporter.aggregate([
                // 1. Join with related collections
                {
                    $lookup: {
                        from: "beds",
                        localField: "bed",
                        foreignField: "_id",
                        as: "bed",
                    },
                },
                { $unwind: { path: "$bed", preserveNullAndEmptyArrays: false } },
                {
                    $lookup: {
                        from: "countries",
                        localField: "bed.country",
                        foreignField: "_id",
                        as: "country",
                    },
                },
                { $unwind: { path: "$country", preserveNullAndEmptyArrays: false } },
                {
                    $lookup: {
                        from: "payments",
                        localField: "_id",
                        foreignField: "supporter",
                        as: "payments",
                    },
                },
                // 2. Group by Organization and Country
                {
                    $group: {
                        _id: {
                            organization: "$bed.organization",
                            country: "$country._id",
                            countryName: "$country.name",
                            currency: "$country.currency",
                        },
                        // Supporter counts
                        totalSupporters: { $sum: 1 },
                        activeSupporters: {
                            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                        },
                        thisDaySupporters: {
                            $sum: {
                                $cond: [{ $gte: ["$createdAt", startOfDay] }, 1, 0],
                            },
                        },
                        thisMonthSupporters: {
                            $sum: {
                                $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0],
                            },
                        },
                        thisWeekSupporters: {
                            $sum: {
                                $cond: [{ $gte: ["$createdAt", startOfWeek] }, 1, 0],
                            },
                        },
                        // Amount calculations
                        totalAmount: { $sum: { $sum: "$amount" } },
                        thisDayAmount: {
                            $sum: {
                                $cond: [{ $gte: ["$createdAt", startOfDay] }, "$amount", 0],
                            },
                        },
                        thisMonthAmount: {
                            $sum: {
                                $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$amount", 0],
                            },
                        },
                        thisWeekAmount: {
                            $sum: {
                                $cond: [{ $gte: ["$createdAt", startOfWeek] }, "$amount", 0],
                            },
                        },
                    },
                },
                // 3. Reshape into organization-centric format
                {
                    $group: {
                        _id: "$_id.organization",
                        organizationId: { $first: "$_id.organization" },
                        data: {
                            $push: {
                                country: "$_id.countryName",
                                currency: "$_id.currency",
                                totalSupporters: "$totalSupporters",
                                activeSupporters: "$activeSupporters",
                                thisDaySupporters: "$thisDaySupporters",
                                thisMonthSupporters: "$thisMonthSupporters",
                                thisWeekSupporters: "$thisWeekSupporters",
                                totalAmount: "$totalAmount",
                                thisDayAmount: "$thisDayAmount",
                                thisMonthAmount: "$thisMonthAmount",
                                thisWeekAmount: "$thisWeekAmount",
                            },
                        },
                        // Calculate organization-wide totals
                        totalSupporters: { $sum: "$totalSupporters" },
                        activeSupporters: { $sum: "$activeSupporters" },
                        thisDaySupporters: { $sum: "$thisDaySupporters" },
                        thisMonthSupporters: { $sum: "$thisMonthSupporters" },
                        thisWeekSupporters: { $sum: "$thisWeekSupporters" },
                        totalAmount: { $sum: "$totalAmount" },
                        thisDayAmount: { $sum: "$thisDayAmount" },
                        thisMonthAmount: { $sum: "$thisMonthAmount" },
                        thisWeekAmount: { $sum: "$thisWeekAmount" },
                    },
                },
                // 4. Join organization details
                {
                    $lookup: {
                        from: "organizations",
                        localField: "organizationId",
                        foreignField: "_id",
                        as: "organization",
                    },
                },
                { $unwind: "$organization" },
                {
                    $project: {
                        organizationId: 1,
                        organizationName: "$organization.name",
                        data: 1,
                        totalSupporters: 1,
                        activeSupporters: 1,
                        thisDaySupporters: 1,
                        thisMonthSupporters: 1,
                        thisWeekSupporters: 1,
                        totalAmount: 1,
                        thisDayAmount: 1,
                        thisMonthAmount: 1,
                        thisWeekAmount: 1,
                        _id: 0,
                    },
                },
            ]);
        });
        // API Route
        this.find = (_a, startDate_1, endDate_1) => __awaiter(this, [_a, startDate_1, endDate_1], void 0, function* ({ limit, skip, filterQuery, sort }, startDate, endDate) {
            console.log("Service received dates:", startDate, endDate);
            try {
                limit = limit ? limit : 10;
                skip = skip ? skip : 0;
                let dateFilter = {};
                if (startDate || endDate) {
                    dateFilter = {
                        createdAt: Object.assign(Object.assign({}, (startDate && {
                            $gte: (() => {
                                const d = new Date(startDate);
                                d.setHours(0, 0, 0, 0);
                                return d;
                            })()
                        })), (endDate && {
                            $lte: (() => {
                                const d = new Date(endDate);
                                d.setHours(23, 59, 59, 999);
                                return d;
                            })()
                        })),
                    };
                }
                const finalFilter = Object.assign(Object.assign({}, filterQuery), dateFilter);
                console.log("Final filter query:", finalFilter);
                const supporters = yield Supporter_1.Supporter.find(finalFilter)
                    .populate([
                    "user",
                    {
                        path: "bed",
                        populate: [{ path: "organization" }, { path: "country" }],
                    },
                ])
                    .sort(sort)
                    .limit(limit)
                    .skip(skip);
                const total = yield Supporter_1.Supporter.countDocuments(finalFilter);
                return {
                    total,
                    limit,
                    skip,
                    items: supporters,
                };
            }
            catch (error) {
                console.error("Error finding supporters:", error);
                throw error;
            }
        });
        this.findAllData = () => __awaiter(this, void 0, void 0, function* () {
            // 1. First get correct bed counts per country
            const bedsByCountry = yield Bed_1.Bed.aggregate([
                {
                    $group: {
                        _id: "$country",
                        totalBedsInCountry: { $sum: 1 },
                        totalAmountOfBed: { $sum: "$amount" },
                    },
                },
                {
                    $lookup: {
                        from: "countries",
                        localField: "_id",
                        foreignField: "_id",
                        as: "country",
                    },
                },
                { $unwind: "$country" },
                {
                    $project: {
                        countryId: "$country._id",
                        countryName: "$country.name",
                        currency: "$country.currency",
                        totalBedsInCountry: 1,
                        totalAmountOfBed: 1,
                    },
                },
            ]);
            // 2. Get supporter amounts per country
            const supportersByCountry = yield Supporter_1.Supporter.aggregate([
                {
                    $lookup: {
                        from: "beds",
                        localField: "bed",
                        foreignField: "_id",
                        as: "bed",
                    },
                },
                { $unwind: "$bed" },
                {
                    $group: {
                        _id: "$bed.country",
                        totalAmountOfSupporter: { $sum: "$amount" },
                    },
                },
            ]);
            // 3. Merge the results
            const result = bedsByCountry.map((country) => {
                const supporterData = supportersByCountry.find((s) => String(s._id) === String(country._id));
                return {
                    countryId: country.countryId,
                    countryName: country.countryName,
                    currency: country.currency,
                    totalBedsInCountry: country.totalBedsInCountry, // Now correct
                    totalAmountOfSupporter: (supporterData === null || supporterData === void 0 ? void 0 : supporterData.totalAmountOfSupporter) || 0,
                    totalAmountOfBed: country.totalAmountOfBed,
                };
            });
            console.log(result);
            return {
                total: 10,
                limit: 10,
                skip: 10,
                items: result,
            };
        });
        this.findOneCountryData = (countryId) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            // 1. Get basic country info with bed counts
            const countryData = yield Bed_1.Bed.aggregate([
                {
                    $match: {
                        country: new mongoose_1.default.Types.ObjectId(countryId),
                    },
                },
                {
                    $lookup: {
                        from: "countries",
                        localField: "country",
                        foreignField: "_id",
                        as: "country",
                    },
                },
                { $unwind: "$country" },
                {
                    $group: {
                        _id: "$country._id",
                        countryId: { $first: "$country._id" },
                        countryName: { $first: "$country.name" },
                        currency: { $first: "$country.currency" },
                        totalBedsInCountry: { $sum: 1 },
                        totalAmountOfBed: { $sum: "$amount" },
                        beds: { $push: "$_id" }, // Collect all bed IDs
                    },
                },
            ]);
            if (countryData.length === 0) {
                throw new Error("Country not found");
            }
            const country = countryData[0];
            // 2. Get supporter amounts for the country
            const supporterData = yield Supporter_1.Supporter.aggregate([
                {
                    $lookup: {
                        from: "beds",
                        localField: "bed",
                        foreignField: "_id",
                        as: "bed",
                    },
                },
                { $unwind: "$bed" },
                {
                    $match: {
                        "bed.country": new mongoose_1.default.Types.ObjectId(countryId),
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmountOfSupporter: { $sum: "$amount" },
                    },
                },
            ]);
            // 3. Get detailed bed information with supporter counts
            const bedsWithSupporters = yield Bed_1.Bed.aggregate([
                {
                    $match: {
                        country: new mongoose_1.default.Types.ObjectId(countryId),
                    },
                },
                {
                    $lookup: {
                        from: "supporters",
                        localField: "_id",
                        foreignField: "bed",
                        as: "supporters",
                    },
                },
                {
                    $project: {
                        bedNo: "$bedNo",
                        bedId: "$_id",
                        totalAmountOfTheBed: "$amount",
                        totalNoOfSupportersByBed: { $size: "$supporters" },
                        totalAmountFromSupporters: { $sum: "$supporters.amount" },
                    },
                },
                { $sort: { bedNo: 1 } },
            ]);
            return {
                countryId: country._id,
                countryName: country.countryName,
                currency: country.currency,
                totalBedsInCountry: country.totalBedsInCountry,
                totalAmountOfSupporter: ((_a = supporterData[0]) === null || _a === void 0 ? void 0 : _a.totalAmountOfSupporter) || 0,
                totalAmountOfBed: country.totalAmountOfBed,
                beds: bedsWithSupporters.map((bed) => ({
                    bedNo: bed.bedNo,
                    bedId: bed.bedId,
                    totalAmountOfTheBed: bed.totalAmountOfTheBed,
                    totalNoOfSupportersByBed: bed.totalNoOfSupportersByBed,
                    totalAmountFromSupporters: bed.totalAmountFromSupporters,
                })),
            };
        });
        this.findOneBedData = (bedId) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Validate bedId
            if (!bedId || !mongoose_1.default.Types.ObjectId.isValid(bedId)) {
                throw new Error("Invalid bed ID");
            }
            // 1. Get basic bed information
            const bedData = yield Bed_1.Bed.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(bedId),
                    },
                },
                {
                    $lookup: {
                        from: "countries",
                        localField: "country",
                        foreignField: "_id",
                        as: "country",
                    },
                },
                { $unwind: "$country" },
            ]);
            if (bedData.length === 0) {
                throw new Error("Bed not found");
            }
            const bed = bedData[0];
            // 2. Get all supporters for this bed with their names directly from supporter schema
            const supportersData = yield Supporter_1.Supporter.aggregate([
                {
                    $match: {
                        bed: new mongoose_1.default.Types.ObjectId(bedId),
                    },
                },
                {
                    $project: {
                        supporterName: {
                            $cond: {
                                if: { $eq: ["$nameVisible", true] },
                                then: "$name",
                                else: "Anonymous",
                            },
                        },
                        amount: 1,
                        createdAt: 1,
                        // Include any other supporter fields you need
                    },
                },
                { $sort: { createdAt: -1 } }, // Sort by newest first
            ]);
            // 3. Calculate totals (unchanged)
            const totals = yield Supporter_1.Supporter.aggregate([
                {
                    $match: {
                        bed: new mongoose_1.default.Types.ObjectId(bedId),
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalNoOfSupportersByBed: { $sum: 1 },
                        totalAmountFromSupporters: { $sum: "$amount" },
                    },
                },
            ]);
            return {
                bedNo: bed.bedNo,
                bedId: bed._id,
                countryId: bed.country._id,
                countryName: bed.country.name,
                currency: bed.country.currency,
                totalAmountOfTheBed: bed.amount,
                fixedAmount: bed.fixedAmount,
                totalNoOfSupportersByBed: ((_a = totals[0]) === null || _a === void 0 ? void 0 : _a.totalNoOfSupportersByBed) || 0,
                totalAmountFromSupporters: ((_b = totals[0]) === null || _b === void 0 ? void 0 : _b.totalAmountFromSupporters) || 0,
                supporters: supportersData.map((supporter) => ({
                    supporterName: supporter.supporterName,
                    amount: supporter.amount,
                    date: supporter.createdAt,
                    // Include any other supporter fields you need
                })),
            };
        });
        this.countTotalDocuments = () => __awaiter(this, void 0, void 0, function* () { return yield Supporter_1.Supporter.countDocuments(); });
        this.findOne = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Supporter_1.Supporter.findById(id).populate(["user", "bed"]);
        });
        this.findOneWithUserId = (id) => __awaiter(this, void 0, void 0, function* () {
            const supporters = yield Supporter_1.Supporter.find({ user: id })
                .populate(["user", "bed"])
                .limit(1);
            if (supporters.length < 1)
                throw new NotFoundError_1.default({ error: "Supporter not found" });
            return supporters[0];
        });
        this.update = (_a) => __awaiter(this, [_a], void 0, function* ({ id, supporter }) {
            return yield Supporter_1.Supporter.findByIdAndUpdate(id, supporter);
        });
        this.delete = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Supporter_1.Supporter.findByIdAndDelete(id);
        });
    }
}
exports.default = SupporterService;
