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
exports.supporterCreateDoc = void 0;
const supporterCreateDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
            #swagger.tags = ['Supporter']
            #swagger.description = 'Create a new supporter/sponsor for a bed'
            #swagger.parameters['parameter_name'] = {
              in: 'body',
              description: 'Supporter details',
              schema: {
                user: "65cd9d8d5cae5ffc348ed638",
                name: "John Doe",
                panNo: "ABCDE1234F",
                nameVisible: true,
                bed: "65cd9d8d5cae5ffc348ed638",
                startDate: "2024-01-01T00:00:00.000Z",
                endDate: "2024-12-31T23:59:59.999Z",
                role: "head",
                type: "individual",
                isActive: true,
                amount: 5000,
                verificationStatus: "verified",
                address: "123 Main St, City, State, ZIP"
              }
            }
        */
    next();
});
exports.supporterCreateDoc = supporterCreateDoc;
