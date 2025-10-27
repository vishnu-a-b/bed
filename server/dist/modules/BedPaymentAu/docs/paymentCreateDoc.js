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
            #swagger.tags = ['BedPaymentAu']
            #swagger.description = 'Create a bed payment (Bed Sponsorship) - Used by client_bed app - Supports PayPal online and offline payment modes'
            #swagger.parameters['parameter_name'] = {
              in: 'body',
              description: 'Bed sponsorship payment details for Australia',
              schema: {
                supporter: "65cd9d8d5cae5ffc348ed638",
                bed: "65cd9d8d5cae5ffc348ed638",
                amount: 500,
                currency: "AUD",
                contribution: {
                  purpose: "bed_donation",
                  description: "Bed sponsorship donation"
                },
                paymentMode: "online",
                manualMethod: "bank_transfer",
                transactionReference: "TXN123456",
                remarks: "Bed sponsorship payment",
                source: "website"
              }
            }
        */
    next();
});
exports.paymentCreateDoc = paymentCreateDoc;
