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
exports.paymentCreateDoc = void 0;
const paymentCreateDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
            #swagger.tags = ['GenerousContributionPayment']
            #swagger.description = 'Create a generous contribution payment (General Donations) - Used by client app - Supports PayPal online and offline payment modes'
            #swagger.parameters['parameter_name'] = {
              in: 'body',
              description: 'Generous contribution payment details for general donations',
              schema: {
                name: "John Doe",
                phNo: "+61412345678",
                email: "donor@example.com",
                address: "123 Main St, Sydney NSW 2000, Australia",
                amount: 500,
                currency: "AUD",
                contribution: {
                  purpose: "general_donation",
                  description: "General donation to support the cause"
                },
                paymentMode: "online",
                manualMethod: "bank_transfer",
                transactionReference: "TXN123456",
                remarks: "Generous contribution",
                source: "website"
              }
            }
        */
    next();
});
exports.paymentCreateDoc = paymentCreateDoc;
