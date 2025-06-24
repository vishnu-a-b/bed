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
const Organization_1 = require("../models/Organization");
class OrganizationService {
    constructor() {
        this.create = (organization) => __awaiter(this, void 0, void 0, function* () {
            return yield Organization_1.Organization.create(organization);
        });
        this.find = (_a) => __awaiter(this, [_a], void 0, function* ({ limit, skip, filterQuery, sort }) {
            limit = limit ? limit : 10;
            skip = skip ? skip : 0;
            const organizationes = yield Organization_1.Organization.find(filterQuery)
                .sort(sort)
                .limit(limit)
                .skip(skip);
            const total = yield Organization_1.Organization.countDocuments(filterQuery);
            return {
                total,
                limit,
                skip,
                items: organizationes,
            };
        });
        this.findOne = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Organization_1.Organization.findById(id).populate(["address"]);
        });
        this.countTotalDocuments = () => __awaiter(this, void 0, void 0, function* () { return yield Organization_1.Organization.countDocuments(); });
        this.update = (_a) => __awaiter(this, [_a], void 0, function* ({ id, organization }) {
            return yield Organization_1.Organization.findByIdAndUpdate(id, organization);
        });
        this.delete = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield Organization_1.Organization.findByIdAndDelete(id);
        });
        this.filterByAdmin = (admin) => __awaiter(this, void 0, void 0, function* () {
            return yield Organization_1.Organization.find({
                admin,
            }).populate(["address"]);
        });
    }
}
exports.default = OrganizationService;
