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
exports.paymentUpdateDoc = void 0;
const paymentUpdateDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
            #swagger.tags = ['BedPaymentIn']
            #swagger.description = 'Update a bed payment (India) record - typically for manual/offline payments or status updates'
            #swagger.parameters['id'] = { description: 'Payment ID', in: 'path', required: true, type: 'string' }
            #swagger.parameters['parameter_name'] = {
              in: 'body',
              description: 'Payment update details',
              schema: {
                status: "captured",
                isVerified: true,
                remarks: "Payment verified",
                transactionReference: "TXN123456",
                paymentDate: "2024-01-15T10:30:00.000Z"
              }
            }
  
            #swagger.security = [
              {
                JWT: []
              }
            ]
        */
    next();
});
exports.paymentUpdateDoc = paymentUpdateDoc;
