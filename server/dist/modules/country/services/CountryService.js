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
const Country_1 = require("../models/Country");
class CountryService {
    constructor() {
        this.create = (data) => __awaiter(this, void 0, void 0, function* () {
            return yield Country_1.Country.create(data);
        });
        this.find = (_a) => __awaiter(this, [_a], void 0, function* ({ limit, skip, filterQuery, sort }) {
            limit = limit ? limit : 10;
            skip = skip ? skip : 0;
            const countrys = yield Country_1.Country.find(filterQuery)
                .populate(["organization", "head"])
                .sort(sort)
                .limit(limit)
                .skip(skip);
            const total = yield Country_1.Country.countDocuments(filterQuery);
            return {
                total,
                limit,
                skip,
                items: countrys,
            };
        });
        this.findOne = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Country_1.Country.findById(id);
        });
        this.countTotalDocuments = () => __awaiter(this, void 0, void 0, function* () { return yield Country_1.Country.countDocuments(); });
        this.update = (_a) => __awaiter(this, [_a], void 0, function* ({ id, data }) {
            return yield Country_1.Country.findByIdAndUpdate(id, data);
        });
        this.delete = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Country_1.Country.findByIdAndDelete(id);
        });
        this.filterByHead = (head) => __awaiter(this, void 0, void 0, function* () {
            return yield Country_1.Country.find({
                head,
            });
        });
    }
}
exports.default = CountryService;
