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
            return yield Bed_1.Bed.create(bed);
        });
        this.find = (_a) => __awaiter(this, [_a], void 0, function* ({ limit, skip, filterQuery, sort }) {
            limit = limit ? limit : 10;
            const beds = yield Bed_1.Bed.find(filterQuery)
                .populate(["organization", "country", "head"])
                .sort(sort)
                .limit(limit)
                .skip(skip);
            const total = yield Bed_1.Bed.countDocuments(filterQuery);
            return {
                total,
                limit,
                skip,
                items: beds,
            };
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
