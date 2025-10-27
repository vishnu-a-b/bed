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
exports.paymentDetailsDoc = void 0;
const paymentDetailsDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
       #swagger.tags = ['BedPaymentIn']
       #swagger.description = 'Get detailed information about a specific bed payment (India) by ID'
       #swagger.parameters['id'] = { description: 'Payment ID', in: 'path', required: true, type: 'string' }
       #swagger.responses[200] = {
        description: 'Payment details retrieved successfully',
        schema: {
          success: true,
          data: {
                _id: "65cd9d8d5cae5ffc348ed638",
                razorpay_payment_id: "pay_xyz123",
                razorpay_order_id: "order_xyz123",
                razorpay_signature: "signature_xyz",
                amount: 10000,
                currency: "INR",
                status: "captured",
                method: "upi",
                email: "supporter@example.com",
                contact: "+919876543210",
                created_at: 1612345678,
                notes: {},
                paymentMode: "online",
                manualMethod: null,
                transactionReference: null,
                paymentDate: null,
                remarks: null,
                recordedBy: null,
                supporter: "65cd9d8d5cae5ffc348ed638",
                bed: "65cd9d8d5cae5ffc348ed638",
                isVerified: true,
                createdAt: "2024-02-17T07:50:12.025Z",
                updatedAt: "2024-02-17T07:50:12.025Z",
              }
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
exports.paymentDetailsDoc = paymentDetailsDoc;
